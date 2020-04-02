import Bee from 'bee-queue';

import { CancellationMailJob } from '../../app/jobs';
import { redisConfig } from '../../config';

const jobs = [CancellationMailJob];
class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, error) {
    console.log(`### QUEUE ${job.queue.name}: FAILED`, error);
  }
}

export default new Queue();
