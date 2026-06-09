# Memory Leak Reproduction

This project demonstrates a memory leak in a Nuxt SSR application caused by capturing the `useRoute()` object inside a `$fetch` interceptor closure. Each SSR request retains a reference to the route object via the closure, preventing garbage collection and causing heap memory to grow unboundedly over time.

---

## Scenario 1 — Baseline leak with successful requests

In this scenario all HTTP requests from the `$fetch` interceptor succeed (internet is available). Memory grows steadily but may be less dramatic.

**Steps:**

1. Build the project:
   ```bash
   pnpm build
   ```

2. Start the server with the Node.js inspector enabled:
   ```bash
   node --inspect .output/server/index.mjs
   ```

3. Open Chrome DevTools (`chrome://inspect`) and connect to the Node.js process.

4. Run the load test to send 100 concurrent requests to `http://localhost:3000/`:
   ```bash
   node load-test.mjs
   ```

5. In Chrome DevTools → **Memory** tab, take a **Heap Snapshot**.

6. Repeat steps 4–5 five times, taking a new heap snapshot after each load test run.

**Expected result:** Heap memory grows with each iteration. The snapshots will show accumulating route objects and closure references that are never released.

---

## Scenario 2 — Leak persists after failed requests

This scenario shows that memory accumulated during failed requests is never released, even when subsequent requests start succeeding again. The network is disabled mid-way through the test runs to trigger failures, then re-enabled to demonstrate that the heap does not shrink back.

**Steps:**

1. Build and start the server as in Scenario 1:
   ```bash
   pnpm build && node --inspect .output/server/index.mjs
   ```

2. Open Chrome DevTools (`chrome://inspect`) and connect to the Node.js process.

3. Run the load test normally (internet on) and take a **Heap Snapshot** after each run. Do this for **runs 1–3**:
   ```bash
   node load-test.mjs   # run 1 → snapshot
   node load-test.mjs   # run 2 → snapshot
   node load-test.mjs   # run 3 → snapshot
   ```

4. **Disable internet access** (e.g. disconnect Wi-Fi/Ethernet or block outbound traffic with a firewall rule). Keep `localhost` reachable so the load test can still reach the server.

5. Run the load test with the network disabled and take a snapshot after each run. Do this for **runs 4–5**:
   ```bash
   node load-test.mjs   # run 4 — requests to jsonplaceholder will fail → snapshot
   node load-test.mjs   # run 5 — requests to jsonplaceholder will fail → snapshot
   ```
   Heap should jump noticeably compared to runs 1–3.

6. **Re-enable internet access.**

7. Run the load test one more time (requests succeed again) and take a final snapshot:
   ```bash
   node load-test.mjs   # run 6 — requests succeed again → snapshot
   ```

**Expected result:** After runs 4–5 the heap is significantly higher than after run 3. Crucially, after run 6 (successful requests again) the heap **does not decrease** — memory retained during the failed runs is never released. This confirms that failed requests cause an irreversible heap increase due to the route object being captured in the closure with no cleanup path.
