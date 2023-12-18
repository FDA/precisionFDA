import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private bla = 'BLA';

  getHello(): string {
    return 'Hello Worldd!';
  }
}
