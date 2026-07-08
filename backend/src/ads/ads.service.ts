import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad, AdSlot } from './ad.entity';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';

const toDate = (v?: string): Date | null | undefined =>
  v === undefined ? undefined : v ? new Date(v) : null;

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private readonly repo: Repository<Ad>,
  ) {}

  // Public: active ads for a slot, respecting the schedule window.
  async findActive(slot: AdSlot): Promise<Ad[]> {
    return this.repo
      .createQueryBuilder('ad')
      .where('ad.slot = :slot', { slot })
      .andWhere('ad.active = true')
      .andWhere('(ad.starts_at IS NULL OR ad.starts_at <= NOW())')
      .andWhere('(ad.ends_at IS NULL OR ad.ends_at >= NOW())')
      .orderBy('ad.priority', 'ASC')
      .addOrderBy('ad.created_at', 'DESC')
      .getMany();
  }

  adminList(): Promise<Ad[]> {
    return this.repo.find({ order: { slot: 'ASC', priority: 'ASC' } });
  }

  async findOne(id: string): Promise<Ad> {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  create(dto: CreateAdDto): Promise<Ad> {
    const ad = this.repo.create({
      name: dto.name,
      slot: dto.slot,
      type: dto.type ?? 'image',
      image_url: dto.image_url ?? null,
      target_url: dto.target_url ?? null,
      html: dto.html ?? null,
      active: dto.active ?? true,
      priority: dto.priority ?? 0,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : null,
      ends_at: dto.ends_at ? new Date(dto.ends_at) : null,
    });
    return this.repo.save(ad);
  }

  async update(id: string, dto: UpdateAdDto): Promise<Ad> {
    const ad = await this.findOne(id);
    if (dto.name !== undefined) ad.name = dto.name;
    if (dto.slot !== undefined) ad.slot = dto.slot;
    if (dto.type !== undefined) ad.type = dto.type;
    if (dto.image_url !== undefined) ad.image_url = dto.image_url || null;
    if (dto.target_url !== undefined) ad.target_url = dto.target_url || null;
    if (dto.html !== undefined) ad.html = dto.html || null;
    if (dto.active !== undefined) ad.active = dto.active;
    if (dto.priority !== undefined) ad.priority = dto.priority;
    const starts = toDate(dto.starts_at);
    if (starts !== undefined) ad.starts_at = starts;
    const ends = toDate(dto.ends_at);
    if (ends !== undefined) ad.ends_at = ends;
    return this.repo.save(ad);
  }

  async remove(id: string) {
    const ad = await this.findOne(id);
    await this.repo.remove(ad);
    return { deleted: true };
  }
}
