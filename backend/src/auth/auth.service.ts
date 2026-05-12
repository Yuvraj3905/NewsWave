import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager } from '../managers/manager.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Manager)
    private readonly managerRepo: Repository<Manager>,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const manager = await this.managerRepo.findOne({ where: { username } });
    if (!manager) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, manager.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: manager.id,
      username: manager.username,
      role: manager.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      manager: {
        id: manager.id,
        username: manager.username,
        role: manager.role,
      },
    };
  }
}
