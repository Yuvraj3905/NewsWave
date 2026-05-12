import { INestApplicationContext, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Manager } from './managers/manager.entity';
import { CategoriesService } from './categories/categories.service';
import { LocationsService } from './locations/locations.service';

const DEFAULT_CATEGORIES = [
  'Sports',
  'Business',
  'Health',
  'Automobile',
  'Politics',
  'Crime',
  'Entertainment',
];

const DEFAULT_LOCATIONS = [
  'Punjab',
  'Haryana',
  'Chandigarh',
  'National',
  'International',
];

export async function seedManager(app: INestApplicationContext) {
  const logger = new Logger('Seed');
  const dataSource = app.get(DataSource);
  const managerRepo = dataSource.getRepository(Manager);

  const username = process.env.SEED_MANAGER_USERNAME || 'admin';
  const password = process.env.SEED_MANAGER_PASSWORD || 'changeme123';
  const role = (process.env.SEED_MANAGER_ROLE as 'admin' | 'editor') || 'admin';

  const existing = await managerRepo.findOne({ where: { username } });
  if (!existing) {
    const password_hash = await bcrypt.hash(password, 10);
    await managerRepo.save(
      managerRepo.create({ username, password_hash, role }),
    );
    logger.log(`Seeded manager: ${username}`);
  }

  try {
    const categoriesService = app.get(CategoriesService);
    await categoriesService.ensureMany(DEFAULT_CATEGORIES);
    const locationsService = app.get(LocationsService);
    await locationsService.ensureMany(DEFAULT_LOCATIONS);
    logger.log('Seeded default categories and locations');
  } catch (err: any) {
    logger.warn(`Taxonomy seed skipped: ${err?.message || err}`);
  }
}
