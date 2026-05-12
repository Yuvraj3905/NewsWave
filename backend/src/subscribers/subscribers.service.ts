import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly repo: Repository<Subscriber>,
  ) {}

  async create(dto: CreateSubscriberDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) {
      if (exists.active) {
        throw new ConflictException('Email already subscribed');
      }
      exists.active = true;
      return this.repo.save(exists);
    }
    const sub = this.repo.create({
      email: dto.email,
      name: dto.name,
      active: true,
    });
    return this.repo.save(sub);
  }

  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  count() {
    return this.repo.count({ where: { active: true } });
  }

  async revoke(id: string) {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    sub.active = false;
    return this.repo.save(sub);
  }

  async remove(id: string) {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    await this.repo.remove(sub);
    return { deleted: true };
  }
}
