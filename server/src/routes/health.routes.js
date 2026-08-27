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
    if (existing.rows[0].count >= 12) return response.json({ message: 'Already seeded with all 12 mechanics.' });

    const defaultHours = [
      { dayOfWeek: 0, opensAt: null, closesAt: null, isClosed: true },
      ...[1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, opensAt: '08:00', closesAt: '18:00', isClosed: false })),
    ];

    const workshops = [
      { name: 'Exact Automobile', phone: '+237680075429', address: 'Terminus Mimboman, Yaoundé, Cameroon', lat: 3.8681, lng: 11.5478, services: ['Engine repair', 'Preventive and corrective maintenance', 'Electronic diagnostics', 'Brake system service', 'Suspension service', 'Tyre mounting', 'Wheel balancing', 'Wheel alignment', 'Air conditioning', 'Automotive electrical and electronic service'], brands: ['All brands'], mobile: false },
      { name: 'Herby Auto', phone: '+237652905309', address: 'Route du Golf, Rue 6.015, Yaoundé, Cameroon', lat: 3.8965, lng: 11.5186, services: ['Automotive advice', 'Automotive assistance', 'Vehicle servicing', 'Vehicle maintenance'], brands: [], mobile: false },
      { name: 'Fred Sarl Atelier', phone: '+237678288491', address: 'VGX9+FQM Fred Garage, Yaoundé, Cameroon', lat: 3.8486875, lng: 11.4818125, services: ['Fleet maintenance', 'Vehicle transformation', 'Automotive tuning', 'Automotive upholstery', 'Vehicle maintenance', 'Vehicle repair', 'Motorcycle maintenance', 'ATV maintenance', 'UTV maintenance'], brands: [], mobile: false },
      { name: 'Henri Garage', phone: '+237675067329', address: 'Yaoundé, Cameroon', lat: 3.8126729692074357, lng: 11.476616103446148, services: ['General maintenance', 'Preventive maintenance', 'Mechanical repair', 'Electronic diagnostics', 'Engine repair', 'Transmission repair', 'Bodywork', 'Painting', 'Air conditioning', 'Roadside assistance', 'Fleet management'], brands: ['European vehicles', 'Asian vehicles', 'American vehicles'], mobile: true },
      { name: 'KP6 Auto', phone: '+237681165346', address: "Quartier Ekoumdoum, Yaoundé 4, about 400 m from Carrefour de l'Amitié and Total Ekoumdoum toward Awae Escalier", lat: 3.8342, lng: 11.5431, services: ['Vehicle servicing', 'Tyre service', 'Oil change', 'Vehicle diagnostics', 'Air conditioning', 'Battery service', 'Maintenance', 'Repair'], brands: [], mobile: false },
      { name: 'Centre Auto Cameroun', phone: '+237692050572', address: 'RG56+H22, 7028 Yaoundé, Cameroon', lat: 3.8588125, lng: 11.5100625, services: ['Car tyres', 'Oil change', 'Air conditioning', 'Brakes', 'Chassis suspension', 'Wheel alignment', 'Wheel balancing', 'Vehicle maintenance', 'Engine service'], brands: [], mobile: false },
      { name: 'HN Auto Express', phone: '+237674390540', address: 'Rue CEPER, Yaoundé, Cameroon', lat: 3.8821, lng: 11.5174, services: ['Electronic vehicle diagnostics', 'Wheel alignment', 'Wheel camber adjustment', 'Tyre sales and fitting', 'Engine oil change', 'Axle oil change', 'Gearbox oil change', 'Oil-circuit cleaning', 'Injector cleaning', 'Engine decarbonization', 'Wheel balancing', 'Air-conditioning circuit cleaning', 'Preventive automotive advice'], brands: [], mobile: true },
      { name: 'Platinum Auto Pro Oyomabang', phone: '+237696197531', address: 'VFF7+FQC, Yaoundé, Cameroon', lat: 3.8736875, lng: 11.4643125, services: [], brands: [], mobile: false },
      { name: 'CADCIA SARL', phone: '+237679527742', address: 'RG87+F6G, Yaoundé, Cameroon', lat: 3.8836875, lng: 11.5130625, services: [], brands: [], mobile: false },
      { name: 'Neptune Oil Garage', phone: '+237653989516', address: 'RG6J+R2V, Yaoundé, Cameroon', lat: 3.8620625, lng: 11.5300625, services: [], brands: [], mobile: false },
      { name: 'RPM Garage', phone: '+237678944944', address: 'VGWC+WQW, Unnamed Road, Yaoundé, Cameroon', lat: 3.8449375, lng: 11.4718125, services: [], brands: [], mobile: false },
      { name: 'ABBA Automobile Energie', phone: '+237677600369', address: 'Yaoundé, Cameroon', lat: 3.8667, lng: 11.5167, services: ['General vehicle diagnostics', 'Vehicle repair', 'Bodywork', 'Mechanical work', 'GPS installation', 'Alarm installation', 'Vehicle maintenance'], brands: [], mobile: false },
    ];

    const passwordHash = await bcrypt.hash('MecaFind2026!', 12);
    const client = await pool.connect();
    let seeded = 0;
    try {
      await client.query('BEGIN');
      for (const w of workshops) {
        const userResult = await client.query(
          `INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, 'mechanic') ON CONFLICT (email) DO NOTHING RETURNING id`,
          [w.name, w.name.toLowerCase().replace(/[^a-z]/g, '') + '@mecafind.local', passwordHash, w.phone],
        );
        if (!userResult.rowCount) continue;
        seeded++;
        const userId = userResult.rows[0].id;
        await client.query(
          `INSERT INTO mechanic_profiles (user_id, workshop_name, description, address, city, latitude, longitude, phone, approval_status, is_mobile_service) VALUES ($1, $2, $3, $4, 'Yaoundé', $5, $6, $7, 'approved', $8)`,
          [userId, w.name, w.name + ' workshop in Yaoundé', w.address, w.lat, w.lng, w.phone, w.mobile],
        );
        for (const s of w.services) await client.query('INSERT INTO mechanic_services (mechanic_profile_id, service_name) SELECT mp.id, $2 FROM mechanic_profiles mp WHERE mp.user_id = $1', [userId, s]);
        for (const b of w.brands) await client.query('INSERT INTO mechanic_car_brands (mechanic_profile_id, brand_name) SELECT mp.id, $2 FROM mechanic_profiles mp WHERE mp.user_id = $1', [userId, b]);
        for (const h of defaultHours) await client.query('INSERT INTO workshop_hours (mechanic_profile_id, day_of_week, opens_at, closes_at, is_closed) SELECT mp.id, $2, $3, $4, $5 FROM mechanic_profiles mp WHERE mp.user_id = $1', [userId, h.dayOfWeek, h.opensAt, h.closesAt, h.isClosed]);
      }
      await client.query('COMMIT');
      return response.json({ message: `Seeded ${seeded} new mechanics (total: ${existing.rows[0].count + seeded}).` });
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  } catch (error) { return response.status(500).json({ message: error.message }); }
});

module.exports = router;
