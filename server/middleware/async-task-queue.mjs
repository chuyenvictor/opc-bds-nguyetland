/**
 * server/middleware/async-task-queue.mjs — Non-Blocking Asynchronous Micro-Task Queue
 * Offloads slow external third-party HTTP calls (Telegram, Google Apps Script, n8n)
 * from the main request thread, eliminating latency and connection pool exhaustion.
 */

class AsyncTaskQueue {
    constructor(maxConcurrency = 5) {
        this.queue = [];
        this.activeCount = 0;
        this.maxConcurrency = maxConcurrency;
        this.metrics = { processed: 0, failed: 0 };
    }

    /**
     * Enqueue an async task to execute in the background
     * @param {string} taskName - Human-readable label for debugging
     * @param {Function} taskFn - Function returning a Promise
     * @param {number} retries - Number of retry attempts on network error
     */
    enqueue(taskName, taskFn, retries = 2) {
        this.queue.push({ taskName, taskFn, retries, attempts: 0 });
        setImmediate(() => this.processNext());
    }

    async processNext() {
        if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        this.activeCount++;

        try {
            task.attempts++;
            await task.taskFn();
            this.metrics.processed++;
        } catch (err) {
            if (task.attempts <= task.retries) {
                console.warn(`[TaskQueue] ⚠️ Retrying task "${task.taskName}" (Attempt ${task.attempts}/${task.retries}) - Error: ${err.message}`);
                this.queue.push(task);
            } else {
                this.metrics.failed++;
                console.error(`[TaskQueue] ❌ Task "${task.taskName}" permanently failed after ${task.attempts} attempts:`, err.message);
            }
        } finally {
            this.activeCount--;
            setImmediate(() => this.processNext());
        }
    }

    getMetrics() {
        return {
            pending: this.queue.length,
            active: this.activeCount,
            processed: this.metrics.processed,
            failed: this.metrics.failed
        };
    }
}

export const taskQueue = new AsyncTaskQueue();
