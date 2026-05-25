import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber, SubscriberStatus } from './subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

const STATUSES: SubscriberStatus[] = ['pending', 'approved', 'rejected'];

@Injectable()
export class SubscribersService implements OnModuleInit {
  private readonly logger = new Logger(SubscribersService.name);

  constructor(
    @InjectRepository(Subscriber)
    private readonly repo: Repository<Subscriber>,
  ) {}

  async onModuleInit() {
    // Legacy rows have status_changed_at IS NULL after the new columns are
    // sync-added. Map them from the existing `active` boolean so previously
    // approved subscribers stay approved instead of becoming pending.
    try {
      const approved = await this.repo
        .createQueryBuilder()
        .update(Subscriber)
        .set({ status: 'approved', status_changed_at: () => 'NOW()' })
        .where('status_changed_at IS NULL')
        .andWhere('active = :a', { a: true })
        .execute();
      if (approved.affected) {
        this.logger.log(
          `Backfilled status='approved' on ${approved.affected} legacy subscriber(s)`,
        );
      }
      const rejected = await this.repo
        .createQueryBuilder()
        .update(Subscriber)
        .set({ status: 'rejected', status_changed_at: () => 'NOW()' })
        .where('status_changed_at IS NULL')
        .andWhere('active = :a', { a: false })
        .execute();
      if (rejected.affected) {
        this.logger.log(
          `Backfilled status='rejected' on ${rejected.affected} legacy revoked subscriber(s)`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Subscriber status backfill skipped: ${(err as Error).message}`,
      );
    }
  }

  async create(dto: CreateSubscriberDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) {
      if (exists.status === 'pending') {
        throw new ConflictException(
          'Email already submitted. Awaiting admin approval.',
        );
      }
      if (exists.status === 'approved') {
        throw new ConflictException('Email already subscribed');
      }
      // previously rejected — let user re-submit, reset to pending
      exists.name = dto.name ?? exists.name;
      exists.status = 'pending';
      exists.status_changed_at = new Date();
      exists.active = false;
      return this.repo.save(exists);
    }
    const sub = this.repo.create({
      email: dto.email,
      name: dto.name,
      status: 'pending',
      status_changed_at: new Date(),
      active: false,
    });
    return this.repo.save(sub);
  }

  findAll(status?: SubscriberStatus) {
    if (status && STATUSES.includes(status)) {
      return this.repo.find({
        where: { status },
        order: { created_at: 'DESC' },
      });
    }
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async counts() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { status: 'pending' } }),
      this.repo.count({ where: { status: 'approved' } }),
      this.repo.count({ where: { status: 'rejected' } }),
    ]);
    // active = approved (kept for backwards compat with dashboard card)
    return { total, pending, approved, rejected, count: approved };
  }

  async setStatus(id: string, status: SubscriberStatus) {
    if (!STATUSES.includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    sub.status = status;
    sub.status_changed_at = new Date();
    sub.active = status === 'approved';
    return this.repo.save(sub);
  }

  approve(id: string) {
    return this.setStatus(id, 'approved');
  }

  reject(id: string) {
    return this.setStatus(id, 'rejected');
  }

  async revoke(id: string) {
    // legacy: revoke = move approved -> rejected
    return this.setStatus(id, 'rejected');
  }

  async remove(id: string) {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    await this.repo.remove(sub);
    return { deleted: true };
  }
}
