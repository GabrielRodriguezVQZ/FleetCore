import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
import { SignupDto } from './dto/signup.dto.js';
import { SigninDto } from './dto/signin.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    if (await this.users.existsBy({ email: dto.email })) {
      throw new ConflictException(`El correo ${dto.email} ya está registrado`);
    }
    // La contraseña NUNCA se guarda en claro: solo el hash argon2.
    const password = await argon2.hash(dto.password);
    const user = await this.users.save(this.users.create({ ...dto, password }));
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async signin(dto: SigninDto) {
    // `password` tiene select:false, por eso se pide explícitamente aquí.
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email: dto.email })
      .getOne();

    const valid = user && (await argon2.verify(user.password, dto.password));
    if (!user || !valid) throw new UnauthorizedException('Credenciales inválidas');

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: Number(this.config.get('JWT_EXPIRES_IN')),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
