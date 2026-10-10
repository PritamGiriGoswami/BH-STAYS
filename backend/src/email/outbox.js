const { sendBookingConfirmation } = require('./emailService');

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [5000, 30000, 120000];

const handlers = {
  'booking-confirmation': sendBookingConfirmation,
};

const jobs = [];
const queue = [];
let running = false;
let nextJobId = 1;

function enqueue(type, payload) {
  const job = {
    id: nextJobId++,
    type,
    payload,
    status: 'queued',
    attempts: 0,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.push(job);
  queue.push(job);
  console.log(`[email-queue] Job #${job.id} (${type}) queued.`);
  schedule();
  return job;
}

function schedule() {
  if (running) return;
  running = true;
  setImmediate(run).unref?.();
}

async function run() {
  while (queue.length > 0) {
    const job = queue.shift();
    await attempt(job);
  }
  running = false;
}

async function attempt(job) {
  const handler = handlers[job.type];
  job.attempts += 1;
  job.updatedAt = new Date().toISOString();

  try {
    if (!handler) throw new Error(`No handler registered for job type '${job.type}'.`);
    const result = await handler(job.payload);
    job.status = 'sent';
    job.error = null;
    job.updatedAt = new Date().toISOString();
    console.log(
      `[email-queue] Job #${job.id} (${job.type}) sent on attempt ${job.attempts}` +
        (result && result.to ? ` to ${result.to}` : '') + '.'
    );
  } catch (err) {
    job.error = err.message;
    job.updatedAt = new Date().toISOString();
    if (job.attempts >= MAX_ATTEMPTS) {
      job.status = 'failed';
      console.error(
        `[email-queue] Job #${job.id} (${job.type}) FAILED after ${job.attempts} attempts: ${err.message}`
      );
      return;
    }
    const delay = RETRY_DELAYS_MS[job.attempts - 1] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
    job.status = 'retry-scheduled';
    console.warn(
      `[email-queue] Job #${job.id} (${job.type}) attempt ${job.attempts} failed: ${err.message}. Retrying in ${delay}ms.`
    );
    setTimeout(() => {
      queue.push(job);
      schedule();
    }, delay).unref?.();
  }
}

function listJobs() {
  return jobs.map((job) => ({ ...job }));
}

module.exports = { enqueue, listJobs };
