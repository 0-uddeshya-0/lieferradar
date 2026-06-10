# Data Model

PostgreSQL schema managed by Prisma. See `prisma/schema.prisma` for the source of truth.

## Entities

### Organization

Top-level tenant. One organization has many users, suppliers, and orders.

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| name | string | Company name |
| email | string | Unique; used for digest emails |

### User

Manager accounts. Belong to exactly one organization.

| Field | Type | Notes |
|-------|------|-------|
| email | string | Unique login |
| passwordHash | string | bcrypt, 12 rounds |
| orgId | FK | Organization |

### Supplier

Vendor contact within an organization.

| Field | Type | Notes |
|-------|------|-------|
| contactEmail | string | Notification target |
| contactName | string? | Greeting in emails |

### Order

Core tracking entity.

| Field | Type | Notes |
|-------|------|-------|
| orderNumber | string | Internal PO reference |
| dueDate | DateTime | Expected delivery |
| status | OrderStatus | See enum below |
| magicToken | string | Unique URL token for supplier page |
| lastSupplierUpdate | DateTime? | Last supplier interaction |
| lastReminderSent | DateTime? | Last automated/manual reminder |
| reminderCount | int | Drives escalation logic |

### OrderStatus enum

`PENDING` → `RECEIVED` → `IN_PROGRESS` → `SHIPPED` / `DELAYED` → `DELIVERED` / `CANCELLED`

### OrderEvent

Audit trail of status changes.

| Field | Notes |
|-------|-------|
| status | Status at time of event |
| source | `supplier`, `manager`, or `system` |
| note | Optional reason text |

### Reminder

Email dispatch log.

| Field | Notes |
|-------|-------|
| type | `INITIAL`, `REMINDER_1`, `REMINDER_2`, `MANUAL` |
| emailTo | Recipient address |

## Computed fields (not stored)

- **Delay risk** (`gruen` / `gelb` / `rot`) — computed from status, due date, reminders, supplier updates
- **Supplier scorecard** — on-time rate, avg response hours, responsiveness label

## Indexes

Orders indexed on `orgId`, `supplierId`, `status`, `dueDate` for dashboard queries.

## Seed data

`pnpm db:seed` creates:

- 1 organization (Muster Maschinenbau GmbH)
- 1 user (`manager@muster.de`)
- 3 suppliers
- 5 orders across different statuses
