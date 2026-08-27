const pool = require('../db/pool');
const fs = require('fs/promises');
const path = require('path');
const { getProfile, isOpenNow } = require('../services/mechanic.service');
const { coordinate, hoursSchema, z } = require('../validators/common');

const profileSchema = z.object({
  workshopName: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).nullable().optional(),
  address: z.string().trim().min(4).max(500),
  city: z.string().trim().min(2).max(100).default('Yaoundé'),
  latitude: coordinate.min(-90).max(90),
  longitude: coordinate.min(-180).max(180),
  phone: z.string().trim().min(5).max(32),
  whatsapp: z.string().trim().max(32).nullable().optional(),
  isMobileService: z.boolean().default(false),
  services: z.array(z.string().trim().min(2).max(120)).max(30).default([]),
  carBrands: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
  hours: z.array(hoursSchema).max(7).default([]),
});

const nearbySchema = z.object({
  lat: coordinate.min(-90).max(90),
  lng: coordinate.min(-180).max(180),
  radius: z.coerce.number().min(1).max(50).default(15),
  q: z.string().trim().max(120).optional(),
  service: z.string().trim().max(120).optional(),
  brand: z.string().trim().max(120).optional(),
});

async function saveRelatedData(client, profileId, input) {
  await Promise.all([
    client.query('DELETE FROM mechanic_services WHERE mechanic_profile_id = $1', [profileId]),
    client.query('DELETE FROM mechanic_car_brands WHERE mechanic_profile_id = $1', [profileId]),
    client.query('DELETE FROM workshop_hours WHERE mechanic_profile_id = $1', [profileId]),
  ]);
  for (const service of [...new Set(input.services)]) {
    await client.query('INSERT INTO mechanic_services (mechanic_profile_id, service_name) VALUES ($1, $2)', [profileId, service]);
  }
  for (const brand of [...new Set(input.carBrands)]) {
    await client.query('INSERT INTO mechanic_car_brands (mechanic_profile_id, brand_name) VALUES ($1, $2)', [profileId, brand]);
  }
  for (const hour of input.hours) {
    await client.query(
      `INSERT INTO workshop_hours (mechanic_profile_id, day_of_week, opens_at, closes_at, is_closed)
       VALUES ($1, $2, $3, $4, $5)`,
      [profileId, hour.dayOfWeek, hour.opensAt ?? null, hour.closesAt ?? null, hour.isClosed],
    );
  }
}

async function createProfile(request, response) {
  const input = profileSchema.parse(request.body);
  const existing = await pool.query('SELECT id FROM mechanic_profiles WHERE user_id = $1', [request.user.id]);
  if (existing.rowCount) return response.status(409).json({ message: 'You already have a workshop profile.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO mechanic_profiles
        (user_id, workshop_name, description, address, city, latitude, longitude, phone, whatsapp, is_mobile_service, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved')
       RETURNING id`,
      [request.user.id, input.workshopName, input.description ?? null, input.address, input.city, input.latitude, input.longitude, input.phone, input.whatsapp ?? null, input.isMobileService],
    );
    await saveRelatedData(client, result.rows[0].id, input);
    await client.query('COMMIT');
    return response.status(201).json({ mechanic: await getProfile(result.rows[0].id) });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateOwnProfile(request, response) {
  const input = profileSchema.parse(request.body);
  const current = await pool.query('SELECT id FROM mechanic_profiles WHERE user_id = $1', [request.user.id]);
  if (!current.rowCount) return response.status(404).json({ message: 'Create a workshop profile first.' });
  const profileId = current.rows[0].id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE mechanic_profiles SET workshop_name = $2, description = $3, address = $4, city = $5,
       latitude = $6, longitude = $7, phone = $8, whatsapp = $9,
       is_mobile_service = $10, updated_at = NOW() WHERE id = $1`,
      [profileId, input.workshopName, input.description ?? null, input.address, input.city, input.latitude, input.longitude, input.phone, input.whatsapp ?? null, input.isMobileService],
    );
    await saveRelatedData(client, profileId, input);
    await client.query('COMMIT');
    return response.json({ mechanic: await getProfile(profileId) });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function ownProfile(request, response) {
  const row = await pool.query('SELECT id FROM mechanic_profiles WHERE user_id = $1', [request.user.id]);
  if (!row.rowCount) return response.status(404).json({ message: 'Workshop profile not found.' });
  return response.json({ mechanic: await getProfile(row.rows[0].id) });
}

async function nearby(request, response) {
  const input = nearbySchema.parse(request.query);
  const radLat = input.lat * Math.PI / 180;
  const radLng = input.lng * Math.PI / 180;
  const haversine = `(2 * 6371 * asin(sqrt(
    power(sin((radians(mp.latitude) - ${radLat}) / 2), 2) +
    cos(${radLat}) * cos(radians(mp.latitude)) *
    power(sin((radians(mp.longitude) - ${radLng}) / 2), 2)
  )))`;
  const values = [];
  const filters = [`mp.approval_status = 'approved'`, `u.status = 'active'`, `${haversine} <= $1`];
  values.push(input.radius);
  if (input.q) {
    values.push(`%${input.q}%`);
    filters.push(`(mp.workshop_name ILIKE $${values.length} OR mp.address ILIKE $${values.length})`);
  }
  if (input.service) {
    values.push(`%${input.service}%`);
    filters.push(`EXISTS (SELECT 1 FROM mechanic_services ms WHERE ms.mechanic_profile_id = mp.id AND ms.service_name ILIKE $${values.length})`);
  }
  if (input.brand) {
    values.push(`%${input.brand}%`);
    filters.push(`EXISTS (SELECT 1 FROM mechanic_car_brands mb WHERE mb.mechanic_profile_id = mp.id AND mb.brand_name ILIKE $${values.length})`);
  }
  const result = await pool.query(
    `SELECT mp.id, ${haversine} AS "distanceKm"
       FROM mechanic_profiles mp JOIN users u ON u.id = mp.user_id
      WHERE ${filters.join(' AND ')} ORDER BY "distanceKm" LIMIT 100`,
    values,
  );
  const mechanics = await Promise.all(result.rows.map(async (row) => {
    const mechanic = await getProfile(row.id);
    return { ...mechanic, distanceKm: Number(row.distanceKm), isOpen: isOpenNow(mechanic.hours) };
  }));
  mechanics.sort((first, second) => Number(second.isOpen) - Number(first.isOpen) || first.distanceKm - second.distanceKm);
  return response.json({ mechanics });
}

async function getOne(request, response) {
  const mechanic = await getProfile(request.params.id);
  if (!mechanic || (mechanic.approvalStatus !== 'approved' && request.user.role !== 'admin' && mechanic.userId !== request.user.id)) {
    return response.status(404).json({ message: 'Mechanic not found.' });
  }
  return response.json({ mechanic: { ...mechanic, isOpen: isOpenNow(mechanic.hours) } });
}

async function uploadPhotos(request, response) {
  const profileResult = await pool.query('SELECT id FROM mechanic_profiles WHERE user_id = $1', [request.user.id]);
  if (!profileResult.rowCount) return response.status(404).json({ message: 'Create a workshop profile before uploading photos.' });
  const files = request.files ?? [];
  if (!files.length) return response.status(400).json({ message: 'Select at least one JPEG, PNG, or WebP image.' });
  const profileId = profileResult.rows[0].id;
  const count = await pool.query('SELECT COUNT(*)::int AS count FROM workshop_photos WHERE mechanic_profile_id = $1', [profileId]);
  if (count.rows[0].count + files.length > 8) {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
    return response.status(400).json({ message: 'A workshop can have at most 8 photos.' });
  }
  const imageBaseUrl = `${request.protocol}://${request.get('host')}/uploads`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const photos = [];
    for (const file of files) {
      const imageUrl = `${imageBaseUrl}/${file.filename}`;
      const result = await client.query(
        `INSERT INTO workshop_photos (mechanic_profile_id, image_url, filename)
         VALUES ($1, $2, $3) RETURNING id, image_url AS "imageUrl", created_at AS "createdAt"`,
        [profileId, imageUrl, file.filename],
      );
      photos.push(result.rows[0]);
    }
    await client.query('COMMIT');
    return response.status(201).json({ photos });
  } catch (error) {
    await client.query('ROLLBACK');
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
    throw error;
  } finally {
    client.release();
  }
}

async function deletePhoto(request, response) {
  const result = await pool.query(
    `DELETE FROM workshop_photos wp USING mechanic_profiles mp
      WHERE wp.id = $1 AND wp.mechanic_profile_id = mp.id AND mp.user_id = $2
      RETURNING wp.filename`,
    [request.params.photoId, request.user.id],
  );
  if (!result.rowCount) return response.status(404).json({ message: 'Photo not found.' });
  await fs.unlink(path.join(__dirname, '../../uploads', result.rows[0].filename)).catch(() => {});
  return response.status(204).send();
}

module.exports = { createProfile, deletePhoto, getOne, nearby, ownProfile, updateOwnProfile, uploadPhotos };
