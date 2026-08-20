import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TimeInMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.timeIn = Date.now()
    next();
  }
}
