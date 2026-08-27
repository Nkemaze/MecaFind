# Seed mechanic accounts

These are **local development seed accounts**, created from public workshop listings for MecaFind demonstrations. They are not ownership-verified accounts. Each workshop profile is set to **pending** and must remain unapproved until an administrator verifies the real owner and map location.

Run the seed script from the repository root:

```bash
npm run seed:mechanics --prefix server
```

Default password for every account: `MecaFindSeed!2026`

You may override it before seeding with `SEED_MECHANIC_PASSWORD`. Re-running the script updates these seed accounts and resets their password to the configured seed password.

| Workshop | Seed email | Password |
| --- | --- | --- |
| Exact Automobile | exact-automobile@seed.mecafind.local | MecaFindSeed!2026 |
| Herby auto | herby-auto@seed.mecafind.local | MecaFindSeed!2026 |
| Fred Sarl Atelier | fred-sarl-atelier@seed.mecafind.local | MecaFindSeed!2026 |
| Henri Garage | henri-garage@seed.mecafind.local | MecaFindSeed!2026 |
| KP6 Auto | kp6-auto@seed.mecafind.local | MecaFindSeed!2026 |
| Centre Auto Cameroun | centre-auto-cameroun@seed.mecafind.local | MecaFindSeed!2026 |
| HN Auto Express | hn-auto-express@seed.mecafind.local | MecaFindSeed!2026 |
| PLATINUIM AUTOMOBILE PRO OYOMABANG | platinuim-auto-pro-oyomabang@seed.mecafind.local | MecaFindSeed!2026 |
| CADCIA SARL | cadcia-sarl@seed.mecafind.local | MecaFindSeed!2026 |
| Neptune Oil Garage | neptune-oil-garage@seed.mecafind.local | MecaFindSeed!2026 |
| RPM Garage | rpm-garage@seed.mecafind.local | MecaFindSeed!2026 |
| ABBA AUTOMOBILE ENERGIE | abba-automobile-energie@seed.mecafind.local | MecaFindSeed!2026 |

Do not deploy these credentials or publish these accounts as verified businesses. Replace them with the real owner’s email and a password chosen by that owner during onboarding.
