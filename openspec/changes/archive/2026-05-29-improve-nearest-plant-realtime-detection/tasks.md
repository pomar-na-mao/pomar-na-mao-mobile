## 1. Nearest Decision Logic

- [x] 1.1 Extract nearest-plant scan and switch-decision logic into small testable helpers or a focused local function.
- [x] 1.2 Tune the near-tie hysteresis so it only blocks switching when distances are effectively tied.
- [x] 1.3 Ensure repeated updates showing a clearly closer candidate switch the in-memory nearest plant promptly.

## 2. Real-Time State Flow

- [x] 2.1 Add refs for latest loaded plants, nearest plant, active inspection, and persistence state to avoid stale closure delays.
- [x] 2.2 Trigger nearest-plant evaluation from valid foreground location updates while plants are loaded.
- [x] 2.3 Update `nearestPlant` and loaded plant marker flags immediately when the nearest plant changes.
- [x] 2.4 Avoid rewriting the loaded plants array when nearest marker flags and meaningful distance state are unchanged.

## 3. Persistence Throttling

- [x] 3.1 Keep SQLite nearest-plant persistence asynchronous and separate from immediate UI state updates.
- [x] 3.2 Persist when nearest plant ID changes or distance changes by the configured meaningful threshold.
- [x] 3.3 Do not persist nearest-plant state for every GPS tick when the nearest result is effectively unchanged.

## 4. Verification

- [x] 4.1 Run TypeScript validation.
- [x] 4.2 Run ESLint on changed files.
- [x] 4.3 Add a dev-only route simulation module for manually verifying nearest-plant switching and tie behavior.
- [ ] 4.4 Verify with local/manual data that walking between two loaded plants switches the highlighted nearest plant promptly.
- [ ] 4.5 Verify near-tie behavior does not flicker rapidly between adjacent plants.
