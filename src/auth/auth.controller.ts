import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Audit } from '../common/decorators/audit.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { AuditAction } from '../common/enums.js';
import { AuthService } from './auth.service.js';
import { SigninDto } from './dto/signin.dto.js';
import { SignupDto } from './dto/signup.dto.js';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Audit('User', AuditAction.CREATE)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}
