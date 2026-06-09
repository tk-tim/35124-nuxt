const urls = [
  "http://localhost:3000/",
];

const REQUESTS_PER_MINUTE = 100;

async function runBatch(batchNumber) {
  const total = urls.length * REQUESTS_PER_MINUTE;
  let count = 0;

  const tasks = [];
  for (let i = 0; i < REQUESTS_PER_MINUTE; i++) {
    for (const url of urls) {
      const index = ++count;
      tasks.push(
        fetch(url, { signal: AbortSignal.timeout(30_000) })
          .then((res) => {
            console.log(`[batch ${batchNumber}] [${index}/${total}] ${res.status} ${url}`);
          })
          .catch((err) => {
            console.error(`[batch ${batchNumber}] [${index}/${total}] ERROR ${url} — ${err.message}`);
          })
      );
    }
  }

  await Promise.allSettled(tasks);
}

let batch = 0;

async function tick() {
  batch++;
  console.log(`\n--- Batch ${batch} started at ${new Date().toISOString()} ---`);
  await runBatch(batch);
  console.log(`--- Batch ${batch} done ---`);
}

// Run once and finish
await tick();
