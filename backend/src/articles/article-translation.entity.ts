import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Article } from './article.entity';

export type ArticleLanguage = 'en' | 'hi' | 'pa';

@Entity('article_translations')
@Unique('uq_article_lang', ['article_id', 'language'])
export class ArticleTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  article_id: string;

  @ManyToOne(() => Article, (article) => article.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Column({ type: 'varchar', length: 8 })
  language: ArticleLanguage;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Index()
  @Column({ type: 'varchar', length: 320 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
