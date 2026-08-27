require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../src/db/pool');

// Local development data gathered from public listings. These profiles remain
// pending until an administrator verifies the workshop and its map position.
const defaultHours = [
  { dayOfWeek: 0, opensAt: null, closesAt: null, isClosed: true },
  ...[1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, opensAt: '08:00', closesAt: '18:00', isClosed: false })),
];

function weeklyHours({ weekdayOpen = '08:00', weekdayClose = '18:00', saturdayOpen = weekdayOpen, saturdayClose = weekdayClose, sunday = null }) {
  return [
    sunday ?? { dayOfWeek: 0, opensAt: null, closesAt: null, isClosed: true },
    ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({ dayOfWeek, opensAt: weekdayOpen, closesAt: weekdayClose, isClosed: false })),
    { dayOfWeek: 6, opensAt: saturdayOpen, closesAt: saturdayClose, isClosed: false },
  ];
}

const workshops = [
  {
    email: 'exact-automobile@seed.mecafind.local', name: 'Exact Automobile', phone: '+237 680 07 54 29', whatsapp: null,
    address: 'Terminus Mimboman, Yaoundé, Cameroon', latitude: 3.8681, longitude: 11.5478,
    description: 'Automobile garage in Yaoundé providing vehicle diagnosis, repair and maintenance.',
    services: ['Engine repair', 'Preventive and corrective maintenance', 'Electronic diagnostics', 'Brake system service', 'Suspension service', 'Tyre mounting', 'Wheel balancing', 'Wheel alignment', 'Air conditioning', 'Automotive electrical and electronic service'],
    brands: ['All brands'], hours: weeklyHours({ weekdayClose: '17:30', saturdayClose: '14:00' }), mobile: false,
  },
  {
    email: 'herby-auto@seed.mecafind.local', name: 'Herby auto', phone: '+237 652 90 53 09', whatsapp: null,
    address: 'Route du Golf, Rue 6.015, Yaoundé, Cameroon', latitude: 3.8965, longitude: 11.5186,
    description: 'Modern automobile garage specializing in automotive advice, assistance, servicing and maintenance.',
    services: ['Automotive advice', 'Automotive assistance', 'Vehicle servicing', 'Vehicle maintenance'], brands: [],
    hours: weeklyHours({ weekdayOpen: '07:30', weekdayClose: '18:30', saturdayOpen: '07:30', saturdayClose: '18:30', sunday: { dayOfWeek: 0, opensAt: '09:30', closesAt: '13:30', isClosed: false } }), mobile: false,
  },
  {
    email: 'fred-sarl-atelier@seed.mecafind.local', name: 'Fred Sarl Atelier', phone: '+237 678 28 84 91', whatsapp: '+237 678 28 84 91',
    address: 'VGX9+FQM Fred Garage, Yaoundé, Cameroon', latitude: 3.8486875, longitude: 11.4818125,
    description: 'Automotive maintenance and mechanical workshop operating in Yaoundé since 2014.',
    services: ['Fleet maintenance', 'Vehicle transformation', 'Automotive tuning', 'Automotive upholstery', 'Vehicle maintenance', 'Vehicle repair', 'Motorcycle maintenance', 'ATV maintenance', 'UTV maintenance'], brands: [],
    hours: weeklyHours({ weekdayClose: '17:00', saturdayClose: '12:00' }), mobile: false,
  },
  {
    email: 'henri-garage@seed.mecafind.local', name: 'Henri Garage', phone: '+237 675 067 329', whatsapp: null,
    address: 'Yaoundé, Cameroon', latitude: 3.8126729692074357, longitude: 11.476616103446148,
    description: 'Automobile garage founded in Yaoundé by Mr. Henri, providing maintenance, mechanical repair and roadside assistance.',
    services: ['General maintenance', 'Preventive maintenance', 'Mechanical repair', 'Electronic diagnostics', 'Engine repair', 'Transmission repair', 'Bodywork', 'Painting', 'Air conditioning', 'Roadside assistance', 'Fleet management'],
    brands: ['European vehicles', 'Asian vehicles', 'American vehicles'], hours: defaultHours, mobile: true,
  },
  {
    email: 'kp6-auto@seed.mecafind.local', name: 'KP6 Auto', phone: '+237 681 16 53 46', whatsapp: '+237 658 30 44 59',
    address: "Quartier Ekoumdoum, Yaoundé 4, about 400 m from Carrefour de l'Amitié and Total Ekoumdoum toward Awae Escalier", latitude: 3.8342, longitude: 11.5431,
    description: 'Automobile workshop in Ekoumdoum providing vehicle maintenance and repair.',
    services: ['Vehicle servicing', 'Tyre service', 'Oil change', 'Vehicle diagnostics', 'Air conditioning', 'Battery service', 'Maintenance', 'Repair'], brands: [], hours: defaultHours, mobile: false,
  },
  {
    email: 'centre-auto-cameroun@seed.mecafind.local', name: 'Centre Auto Cameroun', phone: '+237 692 05 05 72', whatsapp: null,
    address: 'RG56+H22, 7028 Yaoundé, Cameroon', latitude: 3.8588125, longitude: 11.5100625,
    description: 'Automotive service and maintenance centre in Yaoundé offering vehicle maintenance and repair services.',
    services: ['Car tyres', 'Oil change', 'Air conditioning', 'Brakes', 'Chassis suspension', 'Wheel alignment', 'Wheel balancing', 'Vehicle maintenance', 'Engine service'], brands: [],
    hours: weeklyHours({ saturdayClose: '16:00' }), mobile: false,
  },
  {
    email: 'hn-auto-express@seed.mecafind.local', name: 'HN Auto Express', phone: '+237 674 39 05 40', whatsapp: null,
    address: 'Rue CEPER, Yaoundé, Cameroon', latitude: 3.8821, longitude: 11.5174,
    description: 'Automotive maintenance and diagnostic service based on Rue CEPER in Yaoundé, with home-service capability.',
    services: ['Electronic vehicle diagnostics', 'Wheel alignment', 'Wheel camber adjustment', 'Tyre sales and fitting', 'Engine oil change', 'Axle oil change', 'Gearbox oil change', 'Oil-circuit cleaning', 'Injector cleaning', 'Engine decarbonization', 'Wheel balancing', 'Air-conditioning circuit cleaning', 'Preventive automotive advice'], brands: [],
    hours: weeklyHours({ saturdayOpen: '09:00', saturdayClose: '16:00' }), mobile: true,
  },
  {
    email: 'platinuim-auto-pro-oyomabang@seed.mecafind.local', name: 'PLATINUIM AUTOMOBILE PRO OYOMABANG', phone: '+237 696 19 75 31', whatsapp: null,
    address: 'VFF7+FQC, Yaoundé, Cameroon', latitude: 3.8736875, longitude: 11.4643125,
    description: 'General automotive mechanics garage listed in Oyomabang, Yaoundé.', services: [], brands: [],
    hours: weeklyHours({ weekdayOpen: '07:00', weekdayClose: '22:41', saturdayOpen: '07:00', saturdayClose: '22:41', sunday: { dayOfWeek: 0, opensAt: '07:00', closesAt: '22:41', isClosed: false } }), mobile: false,
  },
  {
    email: 'cadcia-sarl@seed.mecafind.local', name: 'CADCIA SARL', phone: '+237 679 52 77 42', whatsapp: null,
    address: 'RG87+F6G, Yaoundé, Cameroon', latitude: 3.8836875, longitude: 11.5130625,
    description: 'Garage listed under general automotive mechanics in Yaoundé.', services: [], brands: [], hours: defaultHours, mobile: false,
  },
  {
    email: 'neptune-oil-garage@seed.mecafind.local', name: 'Neptune Oil Garage', phone: '+237 653 98 95 16', whatsapp: null,
    address: 'RG6J+R2V, Yaoundé, Cameroon', latitude: 3.8620625, longitude: 11.5300625,
    description: 'General automotive mechanics garage listed in Yaoundé.', services: [], brands: [], hours: defaultHours, mobile: false,
  },
  {
    email: 'rpm-garage@seed.mecafind.local', name: 'RPM Garage', phone: '+237 678 94 49 44', whatsapp: null,
    address: 'VGWC+WQW, Unnamed Road, Yaoundé, Cameroon', latitude: 3.8449375, longitude: 11.4718125,
    description: 'General automotive mechanics garage listed in Yaoundé.', services: [], brands: [], hours: defaultHours, mobile: false,
  },
  {
    email: 'abba-automobile-energie@seed.mecafind.local', name: 'ABBA AUTOMOBILE ENERGIE', phone: '+237 677 60 03 69', whatsapp: null,
    address: 'Yaoundé, Cameroon', latitude: 3.8667, longitude: 11.5167,
    description: 'Automotive business listed in Yaoundé providing general diagnostics, repair, bodywork, mechanical work, GPS/alarm installation and maintenance.',
    services: ['General vehicle diagnostics', 'Vehicle repair', 'Bodywork', 'Mechanical work', 'GPS installation', 'Alarm installation', 'Vehicle maintenance'], brands: [], hours: defaultHours, mobile: false,
  },
];

async function saveWorkshop(client, workshop, passwordHash) {
  const userResult = await client.query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, 'mechanic')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, phone = EXCLUDED.phone, role = 'mechanic', status = 'active', updated_at = NOW()
     RETURNING id`,
    [workshop.name, workshop.email, passwordHash, workshop.phone],
  );
  const userId = userResult.rows[0].id;
  const profileResult = await client.query(
    `INSERT INTO mechanic_profiles (user_id, workshop_name, description, address, city, latitude, longitude, phone, whatsapp, approval_status, is_mobile_service)
     VALUES ($1, $2, $3, $4, 'Yaoundé', $5, $6, $7, $8, 'pending', $9)
     ON CONFLICT (user_id) DO UPDATE SET workshop_name = EXCLUDED.workshop_name, description = EXCLUDED.description, address = EXCLUDED.address, city = EXCLUDED.city, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, phone = EXCLUDED.phone, whatsapp = EXCLUDED.whatsapp, approval_status = 'pending', is_mobile_service = EXCLUDED.is_mobile_service, updated_at = NOW()
     RETURNING id`,
    [userId, workshop.name, workshop.description, workshop.address, workshop.latitude, workshop.longitude, workshop.phone, workshop.whatsapp, workshop.mobile],
  );
  const profileId = profileResult.rows[0].id;
  await client.query('DELETE FROM mechanic_services WHERE mechanic_profile_id = $1', [profileId]);
  await client.query('DELETE FROM mechanic_car_brands WHERE mechanic_profile_id = $1', [profileId]);
  await client.query('DELETE FROM workshop_hours WHERE mechanic_profile_id = $1', [profileId]);
  for (const service of workshop.services) await client.query('INSERT INTO mechanic_services (mechanic_profile_id, service_name) VALUES ($1, $2)', [profileId, service]);
  for (const brand of workshop.brands) await client.query('INSERT INTO mechanic_car_brands (mechanic_profile_id, brand_name) VALUES ($1, $2)', [profileId, brand]);
  for (const hour of workshop.hours) {
    await client.query('INSERT INTO workshop_hours (mechanic_profile_id, day_of_week, opens_at, closes_at, is_closed) VALUES ($1, $2, $3, $4, $5)', [profileId, hour.dayOfWeek, hour.opensAt, hour.closesAt, hour.isClosed]);
  }
}

async function seedMechanics() {
  const password = process.env.SEED_MECHANIC_PASSWORD || 'MecaFindSeed!2026';
  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const workshop of workshops) await saveWorkshop(client, workshop, passwordHash);
    await client.query('COMMIT');
    console.log(`Seeded ${workshops.length} pending mechanic accounts.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedMechanics().catch((error) => {
  console.error(`Could not seed mechanics: ${error.message}`);
  process.exitCode = 1;
});
