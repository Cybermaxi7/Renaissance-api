# Admin Moderation - Database Schema

## Table: admin_audit_logs

```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL CHECK (
    action_type IN ('bet_cancelled', 'balance_corrected', 'match_corrected')
  ),
  affected_user_id UUID,
  affected_entity_id UUID,
  affected_entity_type VARCHAR(50) COMMENT 'Type: bet, match, user, etc.',
  reason TEXT,
  previous_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

## Indexes

```sql
-- Single column indexes
CREATE INDEX idx_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_action_type ON admin_audit_logs(action_type);
CREATE INDEX idx_created_at ON admin_audit_logs(created_at);
CREATE INDEX idx_affected_user_id ON admin_audit_logs(affected_user_id);

-- Composite indexes for common queries
CREATE INDEX idx_admin_id_created_at ON admin_audit_logs(admin_id, created_at);
CREATE INDEX idx_action_type_created_at ON admin_audit_logs(action_type, created_at);
```

## Entity Relationships

```
┌─────────────────────────────────────┐
│          users (existing)           │
├─────────────────────────────────────┤
│ id (UUID) PRIMARY KEY               │
│ email                               │
│ role ENUM ('admin', 'user', ...)    │
│ walletBalance DECIMAL               │
│ ... other fields ...                │
└──────────────┬──────────────────────┘
               │
               │ (admin_id FK)
               │
       ┌───────▼────────────────────────────────┐
       │   admin_audit_logs (new)                │
       ├─────────────────────────────────────────┤
       │ id (UUID) PRIMARY KEY                   │
       │ admin_id (UUID) FK → users.id           │
       │ actionType ENUM                         │
       │   - bet_cancelled                       │
       │   - balance_corrected                   │
       │   - match_corrected                     │
       │ affectedUserId (UUID)                   │
       │ affectedEntityId (UUID)                 │
       │ affectedEntityType (VARCHAR)            │
       │ reason (TEXT)                           │
       │ previousValues (JSONB)                  │
       │ newValues (JSONB)                       │
       │ metadata (JSONB)                        │
       │ createdAt (TIMESTAMP)                   │
       │ updatedAt (TIMESTAMP)                   │
       │ deletedAt (TIMESTAMP NULL)              │
       └─────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Bet Cancellation

```
User: "I want to cancel my bet"
  │
  ├─→ Admin reviews request
  │    Admin calls: POST /admin/bets/{betId}/cancel
  │    Reason: "User support ticket #12345"
  │
  ├─→ System transactions:
  │    1. Fetch Bet (status: pending)
  │    2. Fetch User (balance: 900)
  │    3. Update Bet.status → cancelled
  │    4. Update User.walletBalance → 1000
  │    5. Create Transaction (type: BET_CANCELLATION)
  │    6. Create AdminAuditLog entry
  │
  └─→ Audit Log Created:
       {
         adminId: "admin-uuid",
         actionType: "bet_cancelled",
         affectedUserId: "user-uuid",
         affectedEntityId: "bet-uuid",
         affectedEntityType: "bet",
         reason: "User support ticket #12345",
         previousValues: {
           status: "pending",
           settledAt: null
         },
         newValues: {
           status: "cancelled",
           settledAt: "2026-01-26T10:30:00Z"
         },
         metadata: {
           stakeAmount: "100.00000000",
           userPreviousBalance: "900.00000000",
           userNewBalance: "1000.00000000"
         }
       }
```

### Example 2: Balance Correction

```
User: "My deposit didn't arrive"
  │
  ├─→ Admin investigates, finds bug
  │    Admin calls: POST /admin/users/{userId}/balance
  │    newBalance: 1500.00
  │    Reason: "Deposit bug #4521 - user sent 0.5 BTC, received 0.3 BTC"
  │
  ├─→ System transactions:
  │    1. Fetch User (balance: 1000)
  │    2. Update User.walletBalance → 1500
  │    3. Create Transaction (type: WALLET_DEPOSIT, amount: 500)
  │    4. Create AdminAuditLog entry
  │
  └─→ Audit Log Created:
       {
         adminId: "admin-uuid",
         actionType: "balance_corrected",
         affectedUserId: "user-uuid",
         affectedEntityId: "user-uuid",
         affectedEntityType: "user",
         reason: "Deposit bug #4521 - user sent 0.5 BTC, received 0.3 BTC",
         previousValues: {
           walletBalance: "1000.00000000"
         },
         newValues: {
           walletBalance: "1500.00000000"
         },
         metadata: {
           adjustmentAmount: "500.00000000"
         }
       }
```

### Example 3: Match Score Correction

```
Operator: "I made a typo entering the score"
  │
  ├─→ Admin corrects the score
  │    Admin calls: POST /admin/matches/{matchId}/correct
  │    homeScore: 3
  │    awayScore: 2
  │    Reason: "Operator typo - was entered as 3-3, official result is 3-2"
  │
  ├─→ System transactions:
  │    1. Fetch Match (homeScore: 3, awayScore: 3)
  │    2. Update Match.awayScore → 2
  │    3. Create AdminAuditLog entry
  │
  └─→ Audit Log Created:
       {
         adminId: "admin-uuid",
         actionType: "match_corrected",
         affectedEntityId: "match-uuid",
         affectedEntityType: "match",
         reason: "Operator typo - was entered as 3-3, official result is 3-2",
         previousValues: {
           homeScore: 3,
           awayScore: 3
         },
         newValues: {
           homeScore: 3,
           awayScore: 2
         },
         metadata: {
           matchTeams: "Team A vs Team B"
         }
       }
```

## Query Examples

### Find all balance corrections
```sql
SELECT * FROM admin_audit_logs
WHERE action_type = 'balance_corrected'
ORDER BY created_at DESC;
```

### Find all actions by a specific admin
```sql
SELECT * FROM admin_audit_logs
WHERE admin_id = 'admin-uuid'
ORDER BY created_at DESC;
```

### Find all actions affecting a specific user
```sql
SELECT * FROM admin_audit_logs
WHERE affected_user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Find actions in a time period
```sql
SELECT * FROM admin_audit_logs
WHERE created_at BETWEEN '2026-01-20' AND '2026-01-26'
ORDER BY created_at DESC;
```

### Find actions with specific keywords in reason
```sql
SELECT * FROM admin_audit_logs
WHERE reason ILIKE '%bug%'
ORDER BY created_at DESC;
```

### Calculate total balance corrections
```sql
SELECT 
  affected_user_id,
  COUNT(*) as num_corrections,
  SUM((new_values->>'walletBalance')::numeric - 
      (previous_values->>'walletBalance')::numeric) as total_adjustment
FROM admin_audit_logs
WHERE action_type = 'balance_corrected'
GROUP BY affected_user_id;
```

### Track admin activity
```sql
SELECT 
  admin_id,
  action_type,
  COUNT(*) as action_count
FROM admin_audit_logs
WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
GROUP BY admin_id, action_type
ORDER BY admin_id, action_type;
```

## Migration SQL

```sql
-- Create enum type if using PostgreSQL enums
CREATE TYPE admin_action_type AS ENUM (
  'bet_cancelled',
  'balance_corrected',
  'match_corrected'
);

-- Create table
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type admin_action_type NOT NULL,
  affected_user_id UUID,
  affected_entity_id UUID,
  affected_entity_type VARCHAR(50),
  reason TEXT,
  previous_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_action_type ON admin_audit_logs(action_type);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
CREATE INDEX idx_admin_audit_logs_affected_user_id ON admin_audit_logs(affected_user_id);
CREATE INDEX idx_admin_audit_logs_admin_id_created_at ON admin_audit_logs(admin_id, created_at);
CREATE INDEX idx_admin_audit_logs_action_type_created_at ON admin_audit_logs(action_type, created_at);
```

## Data Types Reference

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key, auto-generated |
| admin_id | UUID | Foreign key to users table |
| action_type | ENUM | 'bet_cancelled', 'balance_corrected', 'match_corrected' |
| affected_user_id | UUID | Who was affected (nullable) |
| affected_entity_id | UUID | What was affected (nullable) |
| affected_entity_type | VARCHAR(50) | Entity type: 'bet', 'match', 'user', etc. |
| reason | TEXT | Admin's explanation (required) |
| previous_values | JSONB | State before change |
| new_values | JSONB | State after change |
| metadata | JSONB | Additional context (amounts, etc.) |
| created_at | TIMESTAMP | When action occurred (auto-set) |
| updated_at | TIMESTAMP | When record was updated (auto-set) |
| deleted_at | TIMESTAMP | For soft deletes (nullable) |

## Performance Considerations

**Indexes Optimize:**
- ✅ Finding logs by admin (admin_id)
- ✅ Finding logs by action type (action_type)
- ✅ Sorting by date (created_at)
- ✅ Finding actions affecting a user (affected_user_id)
- ✅ Common combinations (admin_id + created_at, action_type + created_at)

**JSONB Benefits:**
- ✅ Flexible schema for different action types
- ✅ Can query into JSON: `metadata->'stakeAmount'`
- ✅ Easily extend without schema changes
- ✅ Full text search capable

**Expected Query Performance:**
- Single admin's logs: < 100ms (indexed by admin_id, created_at)
- Logs by action type: < 100ms (indexed by action_type, created_at)
- User's audit history: < 100ms (indexed by affected_user_id)

## Backup & Recovery

Since audit logs are immutable (only soft-deleted), they're perfect for:
- ✅ Compliance/regulatory reports
- ✅ Dispute resolution
- ✅ Forensic analysis
- ✅ System debugging

**Backup Strategy:**
```sql
-- Export audit logs regularly
COPY admin_audit_logs TO '/backup/audit_logs_2026_01.csv' 
WITH (FORMAT CSV, HEADER TRUE);

-- Archive old logs (soft delete)
UPDATE admin_audit_logs 
SET deleted_at = CURRENT_TIMESTAMP
WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
```
