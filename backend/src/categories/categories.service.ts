import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './category.entity';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  findByIds(ids: string[]) {
    if (!ids || ids.length === 0) return Promise.resolve([]);
    return this.repo.find({ where: { id: In(ids) } });
  }

  async create(name: string) {
    const cat = this.repo.create({ name, slug: slugify(name) });
    return this.repo.save(cat);
  }

  async ensureMany(items: Array<string | { name: string; slug: string }>) {
    const normalized = items.map((i) =>
      typeof i === 'string' ? { name: i, slug: slugify(i) } : i,
    );
    const existing = await this.repo.find();
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const toCreate = normalized.filter(
      (n) => !existingNames.has(n.name.toLowerCase()),
    );
    if (toCreate.length > 0) {
      const records = toCreate.map((n) =>
        this.repo.create({ name: n.name, slug: n.slug }),
      );
      await this.repo.save(records);
    }
    return this.findAll();
  }

  async remove(id: string) {
    const cat = await this.findById(id);
    await this.repo.remove(cat);
    return { deleted: true };
  }
}
