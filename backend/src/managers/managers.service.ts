import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Manager } from './manager.entity';
import { CreateManagerDto, UpdateManagerDto } from './dto/manager.dto';

// Public shape — never leak password_hash.
export type SafeManager = Omit<Manager, 'password_hash'>;

const strip = (m: Manager): SafeManager => {
  const { password_hash, ...rest } = m;
  return rest;
};

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager)
    private readonly repo: Repository<Manager>,
  ) {}

  async list(): Promise<SafeManager[]> {
    const rows = await this.repo.find({ order: { created_at: 'ASC' } });
    return rows.map(strip);
  }

  async create(dto: CreateManagerDto): Promise<SafeManager> {
    const exists = await this.repo.findOne({
      where: { username: dto.username },
    });
    if (exists) throw new BadRequestException('Username already taken');
    const password_hash = await bcrypt.hash(dto.password, 10);
    const saved = await this.repo.save(
      this.repo.create({
        username: dto.username,
        password_hash,
        role: dto.role,
      }),
    );
    return strip(saved);
  }

  async update(id: string, dto: UpdateManagerDto): Promise<SafeManager> {
    const manager = await this.repo.findOne({ where: { id } });
    if (!manager) throw new NotFoundException('Manager not found');

    // Block demoting the last superadmin — otherwise no one can manage users.
    if (
      dto.role &&
      dto.role !== 'superadmin' &&
      manager.role === 'superadmin' &&
      (await this.superadminCount()) <= 1
    ) {
      throw new ForbiddenException('Cannot demote the last superadmin');
    }

    if (dto.role) manager.role = dto.role;
    if (dto.password) manager.password_hash = await bcrypt.hash(dto.password, 10);
    return strip(await this.repo.save(manager));
  }

  async remove(id: string, actingManagerId: string) {
    if (id === actingManagerId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const manager = await this.repo.findOne({ where: { id } });
    if (!manager) throw new NotFoundException('Manager not found');
    if (
      manager.role === 'superadmin' &&
      (await this.superadminCount()) <= 1
    ) {
      throw new ForbiddenException('Cannot delete the last superadmin');
    }
    await this.repo.remove(manager);
    return { deleted: true };
  }

  private superadminCount(): Promise<number> {
    return this.repo.count({ where: { role: 'superadmin' } });
  }

  // Ensures at least one superadmin exists. Used at seed time so existing
  // installs (whose seed user is role 'admin') keep a way to manage users.
  async ensureSuperadmin(username: string): Promise<void> {
    if ((await this.superadminCount()) > 0) return;
    const user = await this.repo.findOne({ where: { username } });
    if (user) {
      user.role = 'superadmin';
      await this.repo.save(user);
    }
  }
}
