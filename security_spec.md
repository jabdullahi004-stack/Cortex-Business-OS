# Cortex Business OS Security Specification

## Data Invariants
1. **UserProfile**: One per user. ID must match `request.auth.uid`.
2. **Transaction**: Must belong to a valid user. `userId` must match `request.auth.uid`. Amount must be positive.
3. **Task**: Must belong to a valid user. `userId` must match `request.auth.uid`. Priority and Status must be from allowed enums.
4. **Memory**: Must belong to a valid user. `userId` must match `request.auth.uid`.

## The Dirty Dozen (Test Payloads)
1. **P01**: Create UserProfile for another user ID. (Identity Spoofing)
2. **P02**: Create Transaction for another user ID. (Identity Spoofing)
3. **P03**: Update a Transaction's `userId` to take ownership. (Identity Spoofing)
4. **P04**: Delete another user's Task. (Privilege Escalation)
5. **P05**: Create a Transaction with a negative amount. (Constraint Violation)
6. **P06**: Update a Task's `impact` (restricted field) as a basic user. (Tiered Access bypass)
7. **P07**: Create a Memory with a 1MB junk content string. (Resource Poisoning)
8. **P08**: List all transactions without a filter. (Query Scraping)
9. **P09**: Update `createdAt` on a UserProfile. (Immutability violation)
10. **P10**: Create a Task without a required field `title`. (Schema violation)
11. **P11**: Read a private UserProfile of another user. (PII Leak)
12. **P12**: Inject a script into a Transaction description. (XSS/Data Poisoning - though rules only check types/sizes)

## Test Runner
Verified via `firestore.rules.test.ts`.
