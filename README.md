# FleetCore API

REST API to manage the maintenance of FleetCore's vehicle fleet: vehicles, mechanics, workshops, and preventive/corrective maintenances.

**NestJS · TypeScript · TypeORM · PostgreSQL · JWT · bcrypt · Swagger**

- **Coder:** Gabriel Enrique Rodriguez Vasquez
- **Clan:** Nodejs-Nestjs

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

Roles: **ADMIN** manages everything; **TECHNICIAN** sees and updates the status of its own maintenances.

Test API keys (`x-api-key` header): `demo-key-partner-1`, `demo-key-partner-2`.

To try it in Swagger: `POST /auth/signin` → copy the `accessToken` → click **Authorize** → paste the token.

## 8. Test evidence (Postman)

The collection [`postman/FleetCore.postman_collection.json`](postman/FleetCore.postman_collection.json) covers the main scenarios with automatic tests (61 requests): authentication, `401`/`403`, CRUD of vehicles, mechanics and workshops, maintenance creation rules (active maintenance, overlapping schedules, inactive mechanic/workshop, mileage), the full `SCHEDULED → IN_PROGRESS → COMPLETED` lifecycle, invalid transitions, history, the `x-api-key` integration, the audit log and logical deletion.

1. Start the API and run the seeder (`npm run seed`).
2. In Postman: **Import** → select the collection file.
3. Open the collection → **Run** (Collection Runner) and run every request **in order**. If you changed `PORT`, edit the `baseUrl` collection variable first.

Each run creates its own data with unique names, so it can be run as many times as needed.

## 9. Endpoints

| Module | Endpoints | Access |
| --- | --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/signin` | Public |
| Vehicles | `POST /vehicles`, `PATCH /vehicles/:id`, `DELETE /vehicles/:id` (inactivates) | ADMIN |
| | `GET /vehicles`, `GET /vehicles/:id`, `GET /vehicles/plate/:plate` | Authenticated |
| | `GET /vehicles/:id/maintenances` (history) | ADMIN |
| Mechanics | `POST /mechanics`, `GET /mechanics`, `GET /mechanics/:id`, `PATCH /mechanics/:id`, `PATCH /mechanics/:id/status`, `DELETE /mechanics/:id` (inactivates), `GET /mechanics/:id/maintenances` | ADMIN |
| Workshops | `POST /workshops`, `PATCH /workshops/:id`, `PATCH /workshops/:id/status`, `DELETE /workshops/:id` (inactivates) | ADMIN |
| | `GET /workshops` (active only; `?includeInactive=true` for ADMIN), `GET /workshops/:id` | Authenticated |
| Maintenances | `POST /maintenances`, `GET /maintenances`, `GET /maintenances/active`, `GET /maintenances/vehicle/:vehicleId`, `GET /maintenances/mechanic/:mechanicId` | ADMIN |
| | `GET /maintenances/my`, `GET /maintenances/:id`, `PATCH /maintenances/:id/status` | ADMIN / TECHNICIAN (own maintenances only) |
| Audits | `GET /audits` (filters: `entity`, `entityId`, `action`, `userId`, `limit`) | ADMIN |
| Integrations | `GET /integrations/vehicles/:plate/maintenances` | `x-api-key` header |

## 10. Business rules

- A new maintenance always starts as `SCHEDULED`.
- Valid transitions: `SCHEDULED → IN_PROGRESS | CANCELLED` and `IN_PROGRESS → COMPLETED | CANCELLED`. `COMPLETED` and `CANCELLED` are final states; any invalid transition returns `409` with a descriptive message.
- When a maintenance moves to `IN_PROGRESS`, the vehicle becomes `IN_MAINTENANCE`. When it is `COMPLETED`, the vehicle becomes `AVAILABLE` again and its mileage is updated to the final mileage.
- Completing a maintenance requires `workDone`, `finalCost`, `finishedAt` and `finalMileage`.
- A vehicle cannot have more than one active maintenance (`SCHEDULED` or `IN_PROGRESS`).
- A mechanic cannot have active maintenances with overlapping time ranges, in any workshop. Ranges are half-open: 7:30–9:00 and 9:00–10:00 are compatible.
- A technician (mechanic) cannot work on more than one maintenance at the same time: it may have several non-overlapping `SCHEDULED` maintenances, but only one `IN_PROGRESS`. Starting a second one returns `409` until the current one is completed or cancelled. (This is how the rule "a technician cannot have more than one active maintenance" is reconciled with the rule that allows back-to-back schedules such as 7:30–9:00 and 9:00–10:00.)
- `INACTIVE` vehicles and inactive or non-existent mechanics/workshops cannot be assigned. A maintenance mileage cannot be lower than the vehicle's current mileage.
- "Delete" means inactivate: `DELETE` only changes the status, so the maintenance history is always preserved.

## 11. Audit log

Every successful write is recorded in the `audit_logs` table: creating, updating, changing the status of and inactivating vehicles, mechanics, workshops and maintenances, plus user signups. Each entry stores the action, the entity and its id, who did it (id, email and role at that moment), the HTTP method and path, the request body (passwords are never stored) and the date.

Routes are marked with the `@Audit(entity, action)` decorator and the global `AuditInterceptor` writes the entry only when the request succeeds, so rejected requests (`400`/`401`/`403`/`404`/`409`) leave no trace. Query it with `GET /audits`, for example `GET /audits?entity=Maintenance&entityId=3` shows the full history of one maintenance.

## 12. Response format

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

## 13. Project structure

```
src/
├── auth/            signup / signin (bcrypt + JWT)
├── users/           User entity
├── vehicles/        CRUD + maintenance history
├── mechanics/       CRUD + activate/inactivate
├── workshops/       CRUD + activate/inactivate
├── maintenances/    lifecycle, state transitions and transactions
├── integrations/    endpoint protected with x-api-key
├── audits/          audit log entity + GET /audits
├── database/        seed.ts
└── common/          decorators (@Roles, @CurrentUser, @Public, @Audit),
                     guards (Jwt, Roles, ApiKey),
                     interceptors (Transform, Audit, Logging),
                     filters (AllExceptions), enums
```