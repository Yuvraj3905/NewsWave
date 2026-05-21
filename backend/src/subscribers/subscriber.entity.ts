import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type SubscriberStatus = 'pending' | 'approved' | 'rejected';

@Entity('subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Index()
  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: SubscriberStatus;

  @Column({ type: 'timestamptz', nullable: true })
  status_changed_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
