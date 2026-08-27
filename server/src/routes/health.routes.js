const { Router } = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const router = Router();

router.get('/', (_request, response) => {
  response.json({ status: 'ok', service: 'mecafind-api' });
});

router.get('/seed', async (_request, response) => {
  try {
    const existing = await pool.query('SELECT count(*)::int AS count FROM mechanic_profiles');
    if (existing.rows[0].count > 0) return response.json({ message: 'Already seeded.' });

    const defaultHours = [
      { dayOfWeek: 0, opensAt: null, closesAt: null, isClosed: true },
      ...[1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, opensAt: '08:00', closesAt: '18:00', isClosed: false })),
    ];

    const workshops = [
      { name: 'Exact Automobile', phone: '+237680075429', address: 'Terminus Mimboman, Yaoundé', lat: 3.8681, lng: 11.5478, services: ['Engine repair', 'Brake system service', 'Wheel alignment', 'Air conditioning'], mobile: false },
      { name: 'Herby Auto', phone: '+237652905309', address: 'Route du Golf, Rue 6.015, Yaoundé', lat: 3.8965, lng: 11.5186, services: ['Vehicle servicing', 'Vehicle maintenance'], mobile: false },
      { name: 'Fred Sarl Atelier', phone: '+237678288491', address: 'VGX9+FQM Fred Garage, Yaoundé', lat: 3.8486875, lng: 11.4818125, services: ['Fleet maintenance', 'Vehicle repair', 'Motorcycle maintenance'], mobile: false },
      { name: 'Henri Garage', phone: '+237675067329', address: 'Yaoundé, Cameroon', lat: 3.812672, lng: 11.476616, services: ['Mechanical repair', 'Engine repair', 'Air conditioning', 'Roadside assistance'], mobile: true },
      { name: 'KP6 Auto', phone: '+237681165346', address: "Quartier Ekoumdoum, Yaoundé 4", lat: 3.8342, lng: 11.5431, services: ['Vehicle servicing', 'Oil change', 'Battery service'], mobile: false },
      { name: 'Centre Auto Cameroun', phone: '+237692050572', address: 'RG56+H22, 7028 Yaoundé', lat: 3.8588125, lng: 11.5100625, services: ['Oil change', 'Wheel alignment', 'Engine service'], mobile: false },
    ];

    const passwordHash = await bcrypt.hash('MecaFind2026!', 12);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const w of workshops) {
        const userResult = await client.query(
          `INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, 'mechanic') ON CONFLICT (email) DO NOTHING RETURNING id`,
          [w.name, w.name.toLowerCase().replace(/[^a-z]/g, '') + '@mecafind.local', passwordHash, w.phone],
        );
        if (!userResult.rowCount) continue;
        const userId = userResult.rows[0].id;
        await client.query(
          `INSERT INTO mechanic_profiles (user_id, workshop_name, description, address, city, latitude, longitude, phone, approval_status, is_mobile_service) VALUES ($1, $2, $3, $4, 'Yaoundé', $5, $6, $7, 'approved', $8)`,
          [userId, w.name, w.name + ' workshop in Yaoundé', w.address, w.lat, w.lng, w.phone, w.mobile],
        );
        for (const s of w.services) await client.query('INSERT INTO mechanic_services (mechanic_profile_id, service_name) SELECT mp.id, $2 FROM mechanic_profiles mp WHERE mp.user_id = $1', [userId, s]);
        for (const h of defaultHours) await client.query('INSERT INTO workshop_hours (mechanic_profile_id, day_of_week, opens_at, closes_at, is_closed) SELECT mp.id, $2, $3, $4, $5 FROM mechanic_profiles mp WHERE mp.user_id = $1', [userId, h.dayOfWeek, h.opensAt, h.closesAt, h.isClosed]);
      }
      await client.query('COMMIT');
      return response.json({ message: `Seeded ${workshops.length} mechanics.` });
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  } catch (error) { return response.status(500).json({ message: error.message }); }
});

module.exports = router;
