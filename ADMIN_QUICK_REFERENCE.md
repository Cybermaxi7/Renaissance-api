# Admin Moderation Tools - Quick Reference

## 🚀 Quick Start

### Prerequisites
- Admin JWT token (user with `role: 'admin'`)
- Backend running on `http://localhost:3000`

### 5-Minute Setup
1. Run migration: `npm run migration:run`
2. Restart backend
3. Get admin JWT token from login endpoint
4. Start using endpoints below

---

## 📋 API Endpoints (5 Total)

### 1️⃣ Cancel Pending Bet

```bash
POST /admin/bets/{betId}/cancel
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "reason": "User requested refund"
}

Response:
{
  "message": "Bet cancelled successfully and stake refunded",
  "bet": {
    "id": "uuid",
    "status": "cancelled",
    "settledAt": "2026-01-26T10:30:00Z"
  }
}
```

**When to use:** User accidentally placed bet, wants to cancel before match

---

### 2️⃣ Correct User Balance

```bash
POST /admin/users/{userId}/balance
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "newBalance": "5000.50",
  "reason": "Bug compensation - deposit failed to credit"
}

Response:
{
  "message": "Balance corrected successfully",
  "user": {
    "id": "uuid",
    "walletBalance": "5000.50"
  }
}
```

**When to use:** User balance is wrong due to system bug or error

---

### 3️⃣ Correct Match Score

```bash
POST /admin/matches/{matchId}/correct
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "homeScore": 3,
  "awayScore": 2,
  "reason": "Operator typo - was 3-3, official result is 3-2"
}

Response:
{
  "message": "Match details corrected successfully",
  "match": {
    "id": "uuid",
    "homeScore": 3,
    "awayScore": 2
  }
}
```

**When to use:** Wrong score entered, need to fix for correct settlement

---

### 4️⃣ View All Audit Logs

```bash
GET /admin/audit-logs?page=1&limit=50&actionType=bet_cancelled
Authorization: Bearer <admin-jwt>

Response:
{
  "data": [
    {
      "id": "uuid",
      "adminId": "admin-uuid",
      "actionType": "bet_cancelled",
      "affectedUserId": "user-uuid",
      "reason": "User requested refund",
      "previousValues": { "status": "pending" },
      "newValues": { "status": "cancelled" },
      "metadata": { "stakeAmount": "100.00" },
      "createdAt": "2026-01-26T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 50
}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `actionType` - Filter by action:
  - `bet_cancelled`
  - `balance_corrected`
  - `match_corrected`

---

### 5️⃣ View User's Audit History

```bash
GET /admin/users/{userId}/audit-logs?page=1&limit=50
Authorization: Bearer <admin-jwt>

Response:
{
  "data": [
    {
      "id": "uuid",
      "adminId": "admin-uuid",
      "actionType": "balance_corrected",
      "affectedUserId": "user-uuid",
      "reason": "Deposit bug fix",
      "metadata": { "adjustmentAmount": "500.00" },
      "createdAt": "2026-01-26T10:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 50
}
```

---

## 🔒 Security

✅ **Authentication:** JWT required on all endpoints  
✅ **Authorization:** Only ADMIN role can access  
✅ **Validation:** All inputs validated  
✅ **Audit Trail:** Every action logged with reason  
✅ **Transactions:** All-or-nothing database operations  

---

## 🐛 Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Cannot cancel bet with status {status}" | Bet not pending |
| 400 | "New balance must be different" | Same balance provided |
| 403 | "Insufficient permissions" | Not ADMIN role |
| 401 | N/A | Missing JWT token |
| 404 | "not found" | Entity doesn't exist |
| 500 | "Internal server error" | Database error |

---

## 📊 What Gets Tracked (Audit Log)

For **every** admin action:

| Field | Captured |
|-------|----------|
| Who | Admin ID |
| What | Action type + entity |
| When | Timestamp |
| Why | **Reason (required)** |
| Before | Previous values |
| After | New values |
| Context | Metadata (amounts, etc.) |

**Example audit log:**
```json
{
  "adminId": "550e8400-e29b-41d4-a716-446655440000",
  "actionType": "bet_cancelled",
  "affectedUserId": "550e8400-e29b-41d4-a716-446655440001",
  "affectedEntityId": "550e8400-e29b-41d4-a716-446655440002",
  "affectedEntityType": "bet",
  "reason": "User requested refund - accidental placement",
  "previousValues": {
    "status": "pending",
    "settledAt": null
  },
  "newValues": {
    "status": "cancelled",
    "settledAt": "2026-01-26T10:30:00Z"
  },
  "metadata": {
    "stakeAmount": "100.00000000",
    "userPreviousBalance": "900.00000000",
    "userNewBalance": "1000.00000000"
  },
  "createdAt": "2026-01-26T10:30:00Z"
}
```

---

## 🔄 What Happens Behind the Scenes

### When Bet is Cancelled:
1. ✅ Bet status → `cancelled`
2. ✅ User balance → increased by stake
3. ✅ Transaction created → `BET_CANCELLATION`
4. ✅ Audit log created → with reason & metadata

### When Balance is Corrected:
1. ✅ User balance → updated to new amount
2. ✅ Transaction created → `WALLET_DEPOSIT` or `WALLET_WITHDRAWAL`
3. ✅ Audit log created → shows before/after

### When Match is Corrected:
1. ✅ Match scores → updated
2. ✅ Audit log created → shows old scores

**All operations are transactional** → either all succeed or all rollback

---

## 📱 Common Use Cases

### Case 1: User Accidentally Placed Bet
```bash
curl -X POST http://localhost:3000/admin/bets/{betId}/cancel \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "User support ticket #12345 - accidental placement"
  }'
```

### Case 2: Deposit Bug Affected User
```bash
curl -X POST http://localhost:3000/admin/users/{userId}/balance \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "newBalance": "1234.56",
    "reason": "Compensation for deposit failure (bug #4521)"
  }'
```

### Case 3: Data Entry Error on Score
```bash
curl -X POST http://localhost:3000/admin/matches/{matchId}/correct \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "homeScore": 2,
    "awayScore": 1,
    "reason": "Correcting typo: entered as 1-2, official is 2-1"
  }'
```

### Case 4: Investigate User's History
```bash
curl -X GET http://localhost:3000/admin/users/{userId}/audit-logs \
  -H "Authorization: Bearer <jwt>"
```

### Case 5: Review All Balance Corrections
```bash
curl -X GET 'http://localhost:3000/admin/audit-logs?actionType=balance_corrected' \
  -H "Authorization: Bearer <jwt>"
```

---

## ⚠️ Important Notes

- **Reason is mandatory** - Every action requires explanation
- **No undo** - Changes are permanent (but tracked)
- **Admin ID recorded** - Who made the change is always logged
- **Balance changes create transactions** - For accounting purposes
- **Immutable audit logs** - Can't be deleted, only soft-deleted (archive)
- **Timestamps automatic** - No need to provide times

---

## 📚 Files Created

```
backend/src/admin/
├── admin.controller.ts              # HTTP endpoints
├── admin.service.ts                 # Business logic
├── admin.module.ts                  # Module registration
├── entities/
│   └── admin-audit-log.entity.ts   # Database entity
└── dto/
    └── admin.dto.ts                 # Request DTOs

backend/src/migrations/
└── 005-create-admin-audit-logs.ts  # Database schema

backend/test/
└── admin.e2e-spec.ts               # Test examples

backend/src/app.module.ts            # (UPDATED) - Added AdminModule
```

---

## 🧪 Testing

Run the example tests:
```bash
npm run test admin.e2e-spec.ts
```

Test checklist in `ADMIN_MODERATION.md`

---

## 📖 Full Documentation

For complete API documentation, examples, and architecture details:
- See `ADMIN_MODERATION.md` - Complete API reference
- See `ADMIN_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

## ✨ Summary

| Feature | Status |
|---------|--------|
| Bet Cancellation | ✅ Done |
| Balance Correction | ✅ Done |
| Match Correction | ✅ Done |
| Audit Logging | ✅ Done |
| Admin-only Access | ✅ Done |
| Transaction Safety | ✅ Done |
| Documentation | ✅ Done |
| Tests | ✅ Done |

**Ready for production!** 🚀
