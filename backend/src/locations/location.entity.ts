import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @ManyToMany(() => Article, (article) => article.locations)
  articles: Article[];
}
