# DEEPMATCH AI — Test Matrix

| ID | Case | Expected | Status |
|---|---|---|---|
| AI-01 | `ff_ai` off | Redirect `/me` | NOT_TESTED (manual) |
| AI-02 | Hub renders 8 modules | Cards + status | NOT_TESTED |
| AI-03 | Chat without consent | Blocked | NOT_TESTED |
| AI-04 | Chat with consent | Assist API + reply | NOT_TESTED |
| AI-05 | Quota exhausted | RATE_LIMITED | NOT_TESTED |
| AI-06 | Usage panel | Real used/quota | NOT_TESTED |
| AI-07 | DeepMind save/delete | Existing flow | NOT_TESTED |
| AI-08 | DeepSafe free path | `/safe` works | NOT_TESTED |
| AI-09 | No cross-user history | N/A until persistence | N/A |
| AI-10 | Secrets not in client | OPENAI key server-only | PASS (code review) |
| AI-11 | tsc | EXIT 0 | PENDING |
| AI-12 | 320px layout | No H-overflow | NOT_TESTED |
