# Security Specification - Bistro App

## Data Invariants
1. **User Ownership**: All addresses and orders must belong to the authenticated user (`uid`).
2. **Immutability**: `createdAt` timestamps and `userId` fields must not change after creation.
3. **Terminal States**: Orders in `delivered` or `cancelled` status cannot be modified.
4. **Validation**: All string fields must have reasonable size limits to prevent resource exhaustion.

## The Dirty Dozen Payloads

### 1. Identity Spoofing (Address)
**Payload**: `{"userId": "another_user_id", "label": "Home", ...}`
**Intent**: Create an address for a different user.
**Expected**: `PERMISSION_DENIED`

### 2. PII Blanket Read (Users)
**Operation**: `get /users/another_user_id`
**Intent**: Read another user's private profile info.
**Expected**: `PERMISSION_DENIED`

### 3. Ghost Field Injection (Order)
**Payload**: `{"items": [...], "status": "pending", "isVerified": true, ...}`
**Intent**: Inject a field not defined in the schema.
**Expected**: `PERMISSION_DENIED`

### 4. Admin Privilege Escalation (User)
**Payload**: `{"isAdmin": true, "name": "Hacker"}`
**Intent**: Grant admin rights via profile update.
**Expected**: `PERMISSION_DENIED`

### 5. State Shortcutting (Order)
**Payload**: `{"status": "delivered"}`
**Intent**: Directly set an order to delivered without payment/preparation.
**Expected**: `PERMISSION_DENIED`

### 6. Resource Poisoning (Address ID)
**Path**: `/addresses/VERY_LONG_STRING_OVER_128_CHARS...`
**Intent**: Inject massive strings as document IDs.
**Expected**: `PERMISSION_DENIED`

### 7. Large Data Injection (User Name)
**Payload**: `{"name": "A" * 1000}`
**Intent**: Exhaust wallet via massive string storage.
**Expected**: `PERMISSION_DENIED`

### 8. Orphaning Records (Order)
**Payload**: `{"userId": "non_existent_user", ...}`
**Intent**: Create an order without a valid user reference.
**Expected**: `PERMISSION_DENIED` (via `exists()`)

### 9. Time Spoofing (Order)
**Payload**: `{"createdAt": "2020-01-01T00:00:00Z"}`
**Intent**: Backdate an order.
**Expected**: `PERMISSION_DENIED` (must use `request.time`)

### 10. Unauthorized Order Cancellation
**Operation**: `update /orders/another_user_order` with `{"status": "cancelled"}`
**Intent**: Cancel someone else's order.
**Expected**: `PERMISSION_DENIED`

### 11. Terminal State Modification
**Operation**: `update /orders/delivered_order` with `{"status": "pending"}`
**Intent**: Reopen a closed order.
**Expected**: `PERMISSION_DENIED`

### 12. Query Scraping (Addresses)
**Operation**: `list /addresses` (without filter)
**Intent**: Scrape all addresses in the database.
**Expected**: `PERMISSION_DENIED` (Rule must enforce `resource.data.userId == uid`)
