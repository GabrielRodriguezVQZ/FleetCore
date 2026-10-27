# FleetCore API

REST API to manage the maintenance of FleetCore's vehicle fleet: vehicles, mechanics, workshops, and preventive/corrective maintenances.

**NestJS · TypeScript · TypeORM · PostgreSQL · JWT · argon2 · Swagger**

- **Coder:** _YOUR FULL NAME_
- **Clan:** _YOUR CLAN_

---

## 1. Requirements

- Node.js 20+ and npm
- PostgreSQL 14+ (or Docker, see below)

## 2. Installation

```bash
git clone https://github.com/GabrielRodriguezVQZ/FleetCore.git
cd FleetCore
npm install
```

> If npm blocks the `argon2` install script, run:
> `npm install-scripts approve argon2 && npm rebuild argon2`

## 3. Database

With Docker (uses the `db` service from the repo's `docker-compose.yml`):

```bash
docker compose up -d db
```

Or with a local PostgreSQL: create a database named `fleetcore`.

> The Docker image only creates `POSTGRES_DB` the first time its volume is initialized. If the database does not exist, create it manually:
> `docker compose exec db psql -U postgres -c "CREATE DATABASE fleetcore;"`

## 4. Environment variables

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `3000`) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | PostgreSQL connection |
| `DB_SYNC` | `true` creates the tables automatically (development only) |
| `JWT_SECRET` | JWT signing secret (at least 32 characters) |
| `JWT_EXPIRES_IN` | Token lifetime in seconds |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials of the ADMIN user created by the seeder |
| `API_KEYS` | Valid `x-api-key` values, comma-separated |

## 5. Seeder (single command, idempotent)

```bash
npm run seed
```

It creates:

- 1 `ADMIN` user and 2 `TECHNICIAN` users
- 3 mechanics: 2 active (linked to the technicians) and 1 inactive
- 2 workshops: 1 active and 1 inactive
- 4 vehicles: 2 `AVAILABLE`, 1 `IN_MAINTENANCE` (with its `IN_PROGRESS` maintenance) and 1 `INACTIVE`
- 1 `COMPLETED` maintenance to show history

Running it several times does **not** duplicate records.

A ready-to-load dump (structure + data) is also available at [`db/fleetcore.sql`](db/fleetcore.sql).

## 6. Run

```bash
npm run start:dev
```

- API: http://localhost:3000
- **Swagger docs: http://localhost:3000/docs**

(Use the port set in your `.env` if you changed `PORT`.)

## 7. Test credentials

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@fleetcore.com` (per `ADMIN_EMAIL`) | `Admin123*` (per `ADMIN_PASSWORD`) |
| TECHNICIAN | `tecnico1@fleetcore.com` | `Tecnico123*` |
| TECHNICIAN | `tecnico2@fleetcore.com` | `Tecnico123*` |

Test API keys (`x-api-key` header): `demo-key-partner-1`, `demo-key-partner-2`.

To try it in Swagger: `POST /auth/signin` → copy the `accessToken` → click **Authorize** → paste the token.

## 8. Endpoints

| Module | Endpoints | Access |
| --- | --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/signin` | Public |
| Vehicles | `POST /vehicles`, `PATCH /vehicles/:id`, `DELETE /vehicles/:id` (inactivates) | ADMIN |
| | `GET /vehicles`, `GET /vehicles/:id`, `GET /vehicles/plate/:plate` | Authenticated |
| | `GET /vehicles/:id/maintenances` (history) | ADMIN |
| Mechanics | `POST /mechanics`, `GET /mechanics`, `GET /mechanics/:id`, `PATCH /mechanics/:id`, `PATCH /mechanics/:id/status`, `DELETE /mechanics/:id` (inactivates), `GET /mechanics/:id/maintenances` | ADMIN |
| Workshops | `POST /workshops`, `PATCH /workshops/:id`, `PATCH /workshops/:id/status`, `DELETE /workshops/:id` (inactivates) | ADMIN |
| | `GET /workshops` (active only), `GET /workshops/:id` | Authenticated |
| Maintenances | `POST /maintenances`, `GET /maintenances`, `GET /maintenances/active`, `GET /maintenances/vehicle/:vehicleId`, `GET /maintenances/mechanic/:mechanicId` | ADMIN |
| | `GET /maintenances/my`, `GET /maintenances/:id`, `PATCH /maintenances/:id/status` | ADMIN / TECHNICIAN (own maintenances only) |
| Integrations | `GET /integrations/vehicles/:plate/maintenances` | `x-api-key` header |

## 9. Business rules

- A new maintenance always starts as `SCHEDULED`.
- Valid transitions: `SCHEDULED → IN_PROGRESS | CANCELLED` and `IN_PROGRESS → COMPLETED | CANCELLED`. `COMPLETED` and `CANCELLED` are final states; any invalid transition returns `409` with a descriptive message.
- When a maintenance moves to `IN_PROGRESS`, the vehicle becomes `IN_MAINTENANCE`. When it is `COMPLETED`, the vehicle becomes `AVAILABLE` again and its mileage is updated to the final mileage.
- Completing a maintenance requires `workDone`, `finalCost`, `finishedAt` and `finalMileage`.
- A vehicle cannot have more than one active maintenance (`SCHEDULED` or `IN_PROGRESS`).
- A mechanic cannot have active maintenances with overlapping time ranges, in any workshop. Ranges are half-open: 7:30–9:00 and 9:00–10:00 are compatible.
- `INACTIVE` vehicles and inactive or non-existent mechanics/workshops cannot be assigned. A maintenance mileage cannot be lower than the vehicle's current mileage.
- "Delete" means inactivate: `DELETE` only changes the status, so the maintenance history is always preserved.

## 10. Response format

Success (handled by the interceptor):

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

Error (handled by the global exception filter):

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Vehicle ABC123 already has an active maintenance",
  "path": "/maintenances",
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

Validation, authentication, authorization, not-found, business-conflict and PostgreSQL unique-constraint errors are never returned as `500`.

## 11. Project structure

```
src/
├── auth/            signup / signin (argon2 + JWT)
├── users/           User entity
├── vehicles/        CRUD + maintenance history
├── mechanics/       CRUD + activate/inactivate
├── workshops/       CRUD + activate/inactivate
├── maintenances/    lifecycle, state transitions and transactions
├── integrations/    endpoint protected with x-api-key
├── database/        seed.ts
└── common/          decorators (@Roles, @CurrentUser, @Public),
                     guards (Jwt, Roles, ApiKey),
                     interceptors (Transform, Logging),
                     filters (AllExceptions), enums
```