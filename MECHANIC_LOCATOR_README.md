# MecaFind — Yaoundé Mechanic Locator

## Project overview

MecaFind is a responsive web application that helps car owners in Yaoundé,
Cameroon find trustworthy nearby mechanic workshops. A car owner can sign in,
share their current location, see the nearest workshops, inspect a mechanic's
profile, and follow an in-app map route to the selected workshop.

Mechanics create and maintain their own workshop listings. Platform
administrators review and manage mechanic accounts to reduce fake or unsafe
listings.

The project is inspired by the discovery-and-directions flow in PharmaFinder,
but is being built as a separate web application with React, Node/Express, and
PostgreSQL.

## Users and permissions

| User | Main capabilities |
| --- | --- |
| Car owner | Register/sign in, use the free trial or paid usage balance, share location, search nearby mechanics, view profiles, and get in-app directions. |
| Mechanic | Register/sign in, create and update a workshop profile, set services and working hours, provide contact details, and pin the workshop on a map. |
| Administrator | Review mechanics, approve/suspend listings, manage user accounts, and monitor usage/payment records. |

## Core user journeys

### Car owner: find a mechanic

1. The car owner creates an account and signs in.
2. The browser requests permission to access the car owner's current location.
3. The application retrieves approved mechanics around Yaoundé and calculates
   the distance from the car owner.
4. Results are grouped and sorted so workshops that are open now appear first,
   nearest to farthest. Closed workshops appear after them with a prominent
   **Closed** status.
5. The car owner opens a workshop profile to see its details.
6. Selecting **Directions** consumes one eligible usage, shows the route on an
   in-app OpenStreetMap map, and displays estimated distance, travel time, and
   turn-by-turn steps.

### Mechanic: create a workshop listing

1. The mechanic creates an account and signs in.
2. The mechanic completes a workshop profile and selects the exact workshop
   position on the map.
3. The listing is sent for administrator review.
4. Once approved, it becomes visible in car-owner search results.
5. The mechanic can keep their contact details, services, working hours,
   photos, and location up to date.

### Administrator: manage listings

1. An administrator signs in to a protected dashboard.
2. The administrator reviews pending mechanic registrations and workshop
   details.
3. The administrator approves, rejects, suspends, or reactivates mechanics.
4. Only approved and active workshops are available to car owners.

## Functional requirements

### Authentication and roles

- Account registration and secure sign-in for car owners, mechanics, and
  administrators.
- Passwords stored only as secure hashes; never as plain text.
- Role-based access control so each user can access only the appropriate area.
- A mechanic can edit only their own workshop listing.
- Administrators can manage all mechanic listings and relevant user records.

### Mechanic profile

Each workshop profile should support:

- Mechanic/workshop name
- Profile photo and workshop photos
- Phone number and WhatsApp contact
- Workshop address and an exact map pin (latitude and longitude)
- Services offered, such as engine repair, diagnostics, tyre service,
  electrical repair, body work, oil change, or emergency/mobile service
- Car brands handled
- Weekday and weekend operating hours
- Open/closed status calculated from working hours
- Description and any useful experience or certification information
- Approval status: pending, approved, rejected, or suspended

### Nearby mechanic discovery

- Obtain the car owner's location through the browser Geolocation API.
- Use Yaoundé, Cameroon as the initial geographic focus and map default.
- Find workshops by latitude/longitude and calculate distance in kilometres.
- Display open workshops first, ordered by nearest distance.
- Display closed workshops below open ones, clearly labelled as closed.
- Allow searching and filtering by workshop name, service, car brand, distance,
  and availability.
- Show a useful empty state when location permission is denied or no mechanic
  matches are available.

### Maps and directions

- Render maps inside the application using OpenStreetMap tiles.
- Let mechanics choose their workshop position with an interactive map picker.
- Show the car owner and selected workshop on the map.
- Request driving routes from OSRM and render the route inside the app.
- Display distance, estimated duration, and turn-by-turn instructions.
- Handle routing/network failures gracefully with a clear message and a
  straight-line distance fallback where appropriate.
- The main experience remains in the app; Google Maps is not required.

### Usage and payment model

The initial business rule is usage-based access:

- Every new car-owner account receives **3 free direction/search usages**.
- After the free trial is exhausted, the car owner pays **1000 FCFA** to receive
  **5 additional usages**.
- The system records free and purchased usage separately for auditing.
- A usage should be consumed only after a defined protected action succeeds.
  Recommended first definition: consume one usage when the user requests a
  route/directions to a mechanic, not merely when browsing the results list.
- Payment integration should be designed as a provider adapter so a Cameroon-
  appropriate service such as MTN Mobile Money or Orange Money can be added
  without changing the rest of the application logic.

The exact payment provider and whether a "usage" means a route request or a
full mechanic search should be confirmed before implementation. This README
uses a route request as the proposed default.

## Technology stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React.js | Responsive browser interface and client-side state/UI. |
| Styling | Tailwind CSS | Responsive, consistent visual design. |
| Backend | Node.js + Express.js | REST API, authentication, business rules, usage enforcement, and admin actions. |
| Database | PostgreSQL | Persistent users, workshops, locations, hours, approval status, usage, and payments. |
| Authentication | JWT with hashed passwords (for example, bcrypt/argon2) | Secure sessions and role-based API access. |
| Maps | Leaflet or React Leaflet + OpenStreetMap | Interactive maps, markers, and location picker. |
| Routing | OSRM | In-app driving route geometry, distance, duration, and steps. |
| Geolocation | Browser Geolocation API | Car owner’s current position, with permission handling. |
| Geospatial queries | PostgreSQL + PostGIS (recommended) | Efficient nearby-workshop and distance queries. |

PostGIS is strongly recommended. It lets PostgreSQL store workshop coordinates
as geographic points and query mechanics within a radius efficiently, instead
of loading every workshop into the backend and calculating each distance in
application code.

## Proposed application areas

### Public/car-owner area

- Landing page
- Registration and login
- Home/nearby-mechanics page
- Search and filter controls
- Mechanic list with open/closed grouping
- Mechanic detail page
- In-app directions page
- Account, usage balance, and payment history page

### Mechanic dashboard

- Registration and login
- Workshop-profile setup and map location picker
- Edit profile, services, brands, photos, contacts, and opening hours
- Listing approval/status screen
- Basic view of route requests or profile visibility (optional future feature)

### Administrator dashboard

- Administrator login
- Pending-mechanic review queue
- Mechanic approval, rejection, suspension, and reactivation
- Search/filter mechanics and users
- Usage/payment overview and audit records

## Proposed data model

The following is a starting point; field names can change during database
design.

```text
users
  id, name, email, password_hash, role, phone, status, created_at, updated_at

mechanic_profiles
  id, user_id, workshop_name, description, address, city,
  location (PostGIS point), phone, whatsapp, approval_status,
  is_mobile_service, created_at, updated_at

mechanic_services
  id, mechanic_profile_id, service_name

mechanic_car_brands
  id, mechanic_profile_id, brand_name

workshop_hours
  id, mechanic_profile_id, day_of_week, opens_at, closes_at, is_closed

workshop_photos
  id, mechanic_profile_id, image_url, sort_order

usage_wallets
  id, user_id, free_uses_remaining, paid_uses_remaining, updated_at

usage_transactions
  id, user_id, mechanic_profile_id, type, source, amount, created_at

payments
  id, user_id, provider, provider_reference, amount_fcfa, status,
  usages_granted, created_at, confirmed_at
```

Important relationships:

```text
User (mechanic) 1 ── 1 MechanicProfile
MechanicProfile 1 ── * Services / CarBrands / Hours / Photos
User (car owner) 1 ── 1 UsageWallet
User (car owner) 1 ── * UsageTransactions / Payments
```

## Proposed REST API

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/mechanics/nearby?lat={lat}&lng={lng}&radius={km}
GET    /api/mechanics/:id
POST   /api/mechanics                     (mechanic only)
PATCH  /api/mechanics/me                  (own profile only)
POST   /api/usage/mechanics/:id/directions-use  (car owner usage enforcement)

GET    /api/usage/me
GET    /api/payments/me
POST   /api/usage/payments/checkout
GET    /api/usage/payments

GET    /api/admin/mechanics
PATCH  /api/admin/mechanics/:id/status
GET    /api/admin/users
GET    /api/admin/payments
POST   /api/admin/payments/:id/confirm     (temporary admin confirmation)
```

The frontend can call OSRM directly for route rendering, but routing through
the backend is also reasonable if rate-limiting, caching, usage enforcement,
or provider replacement is needed.

## Key business rules

1. A mechanic is not publicly searchable until an administrator approves the
   workshop.
2. Suspended, rejected, or incomplete mechanic profiles are not visible to car
   owners.
3. Open workshops always display before closed workshops; both groups are
   distance-sorted.
4. Open/closed status is calculated from Yaoundé’s local time and the
   workshop’s configured hours.
5. A car owner starts with three free uses.
6. A successful 1000 FCFA payment grants five uses only after payment
   confirmation.
7. Usage deduction must happen server-side in a database transaction, never
   only in React, so users cannot bypass it by changing browser code.

## Security and reliability considerations

- Validate all incoming API input on the Express server.
- Use HTTPS in production, secure JWT handling, password hashing, and rate
  limiting on authentication endpoints.
- Enforce role checks in backend middleware, not just by hiding frontend
  buttons.
- Store map API/routing configuration in environment variables where needed;
  do not commit secrets.
- Verify payment-provider webhooks before granting purchased usages.
- Keep an immutable usage/payment audit trail for disputes.
- Respect OpenStreetMap and public OSRM usage policies. For production scale,
  use a suitable hosted provider or self-host infrastructure rather than
  relying indefinitely on public demonstration endpoints.
- Provide clear consent text before requesting browser location access.

## Suggested repository structure

```text
mechanic-locator/
  client/                 # React + Tailwind application
    src/
      components/
      pages/
      features/
      services/
      hooks/
  server/                 # Node.js + Express API
    src/
      controllers/
      routes/
      middleware/
      services/
      db/
      validators/
  docs/                   # API, database, deployment documentation
  README.md
```

## Delivery phases

1. **Foundation:** repository setup, PostgreSQL/PostGIS schema, Express API,
   React/Tailwind layout, authentication, and roles.
2. **Mechanic onboarding:** profile setup, map pin selection, services/hours,
   and administrator approval workflow.
3. **Discovery:** browser location, nearby API, open/closed ranking, search,
   filters, and mechanic detail pages.
4. **Navigation:** OpenStreetMap view, OSRM route display, distance, ETA, and
   directions steps.
5. **Monetisation:** free-trial wallet, usage deduction, payment integration,
   transaction history, and webhook verification.
6. **Quality and deployment:** responsive testing, validation, security
   review, logging, backups, and production deployment.

## Initial assumptions and items to confirm

- The first launch area is Yaoundé, Cameroon, but the schema will allow future
  expansion to other cities.
- The product is a responsive browser web app, not a native mobile app.
- Users need accounts because access is usage-based.
- Ratings/reviews and emergency/mobile repair are included as profile
  capabilities for now; their exact moderation rules can be finalised later.
- The payment provider has not yet been chosen.
- The proposed charge is 1000 FCFA for five additional route-direction uses.









## Auth info
* Mechacic 
- Full name: Mechanic1
- email: mechanic@gmail.com 
- password: 123456789

* Driver 
- Full name: Driver1
- email: driver@gmail.com 
- password: 123456789