import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';
import { ArticleTranslation } from './article-translation.entity';
import { ArticleImage } from './article-image.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  // Auto-publish time. When set and in the future, the article is saved with
  // published=false and stays hidden until a scheduler tick flips it live.
  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  scheduled_at: Date | null;

  @Index()
  @Column({ type: 'int', nullable: true })
  display_order: number | null;

  @ManyToMany(() => Category, (category) => category.articles, {
    cascade: false,
    eager: true,
  })
  @JoinTable({
    name: 'article_categories',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @ManyToMany(() => Location, (location) => location.articles, {
    cascade: false,
    eager: true,
  })
  @JoinTable({
    name: 'article_locations',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'location_id', referencedColumnName: 'id' },
  })
  locations: Location[];

  @OneToMany(() => ArticleTranslation, (t) => t.article, {
    cascade: true,
    eager: true,
  })
  translations: ArticleTranslation[];

  @OneToMany(() => ArticleImage, (img) => img.article, {
    cascade: true,
    eager: true,
  })
  images: ArticleImage[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
