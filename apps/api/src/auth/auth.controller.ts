import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { Public } from './decorators';
import { CurrentUser } from './current-user';
import { JwtUser } from './jwt-user';
import { ROLE_PERMISSIONS } from '@fernleaf/domain';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return { ...user, permissions: ROLE_PERMISSIONS[user.role] };
  }
}
