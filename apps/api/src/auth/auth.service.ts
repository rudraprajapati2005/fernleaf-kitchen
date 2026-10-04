import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const staff = await this.prisma.staff.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!staff || !staff.active) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    const payload = {
      sub: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
    };
    return {
      token: await this.jwt.signAsync(payload),
      user: { id: staff.id, email: staff.email, name: staff.name, role: staff.role },
    };
  }
}
