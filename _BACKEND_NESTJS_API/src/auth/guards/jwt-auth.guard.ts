import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // no hace falta implementarlo porque acepta la estartegia que tenemos en el jwt-strategy
}
