import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AdSlot = 'home_banner' | 'sidebar' | 'in_article';
export const AD_SLOTS: AdSlot[] = ['home_banner', 'sidebar', 'in_article'];

export type AdType = 'image' | 'html';
export const AD_TYPES: AdType[] = ['image', 'html'];

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Admin-facing label.
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 40 })
  slot: AdSlot;

  @Column({ type: 'varchar', length: 10, default: 'image' })
  type: AdType;

  // image ads
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  target_url: string | null;

  // html/script ads (ad networks, AdSense). Admin-entered, trusted.
  @Column({ type: 'text', nullable: true })
  html: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Lower shows first within a slot.
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'timestamptz', nullable: true })
  starts_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  ends_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
