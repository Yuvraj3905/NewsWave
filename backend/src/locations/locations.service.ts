import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Location } from './location.entity';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const loc = await this.repo.findOne({ where: { id } });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  findByIds(ids: string[]) {
    if (!ids || ids.length === 0) return Promise.resolve([]);
    return this.repo.find({ where: { id: In(ids) } });
  }

  create(name: string) {
    const loc = this.repo.create({ name, slug: slugify(name) });
    return this.repo.save(loc);
  }

  async ensureMany(names: string[]) {
    const existing = await this.repo.find();
    const existingNames = new Set(existing.map((l) => l.name.toLowerCase()));
    const toCreate = names.filter((n) => !existingNames.has(n.toLowerCase()));
    if (toCreate.length > 0) {
      const records = toCreate.map((n) =>
        this.repo.create({ name: n, slug: slugify(n) }),
      );
      await this.repo.save(records);
    }
    return this.findAll();
  }

  async remove(id: string) {
    const loc = await this.findById(id);
    await this.repo.remove(loc);
    return { deleted: true };
  }
}
