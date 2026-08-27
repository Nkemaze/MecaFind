const pool = require('../db/pool');

async function getProfile(profileId, client = pool) {
  const profileResult = await client.query(
    `SELECT mp.id, mp.user_id AS "userId", mp.workshop_name AS "workshopName", mp.description,
            mp.address, mp.city, mp.phone, mp.whatsapp, mp.approval_status AS "approvalStatus",
            mp.is_mobile_service AS "isMobileService", mp.latitude, mp.longitude,
            u.name AS "mechanicName"
       FROM mechanic_profiles mp JOIN users u ON u.id = mp.user_id WHERE mp.id = $1`,
    [profileId],
  );
  if (!profileResult.rowCount) return null;
  const profile = profileResult.rows[0];
  const [services, brands, hours, photos] = await Promise.all([
    client.query('SELECT service_name AS "serviceName" FROM mechanic_services WHERE mechanic_profile_id = $1 ORDER BY service_name', [profileId]),
    client.query('SELECT brand_name AS "brandName" FROM mechanic_car_brands WHERE mechanic_profile_id = $1 ORDER BY brand_name', [profileId]),
    client.query(`SELECT day_of_week AS "dayOfWeek", opens_at::text AS "opensAt", closes_at::text AS "closesAt", is_closed AS "isClosed"
                  FROM workshop_hours WHERE mechanic_profile_id = $1 ORDER BY day_of_week`, [profileId]),
    client.query(`SELECT id, image_url AS "imageUrl", created_at AS "createdAt"
                  FROM workshop_photos WHERE mechanic_profile_id = $1 ORDER BY created_at`, [profileId]),
  ]);
  return { ...profile, services: services.rows, carBrands: brands.rows, hours: hours.rows, photos: photos.rows };
}

function isOpenNow(hours) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Douala', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const today = hours.find((item) => item.dayOfWeek === dayMap[values.weekday]);
  if (!today || today.isClosed || !today.opensAt || !today.closesAt) return false;
  const current = `${values.hour}:${values.minute}`;
  if (today.opensAt <= today.closesAt) return current >= today.opensAt && current < today.closesAt;
  return current >= today.opensAt || current < today.closesAt;
}

module.exports = { getProfile, isOpenNow };
