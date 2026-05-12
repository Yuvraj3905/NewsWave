import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @ManyToMany(() => Article, (article) => article.categories)
  articles: Article[];
}
