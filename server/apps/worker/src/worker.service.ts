import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkerService {
  getHello(): string {
    return 'Hello World!';
  }
}
