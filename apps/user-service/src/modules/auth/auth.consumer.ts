import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('auth')
export class AuthConsumer extends WorkerHost {
  process(job: Job) {
    if (job.name === 'verify-token') return Promise.resolve({ success: true });
    return Promise.resolve({ success: true });
  }
}
