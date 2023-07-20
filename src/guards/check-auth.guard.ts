import { AuthGuard } from '@nestjs/passport'

export class CheckAuthGuard extends AuthGuard('jwt') {}
