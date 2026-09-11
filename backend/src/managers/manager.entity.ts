import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type ManagerRole = 'superadmin' | 'admin' | 'editor';
export const MANAGER_ROLES: ManagerRole[] = ['superadmin', 'admin', 'editor'];

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 20, default: 'admin' })
  role: ManagerRole;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
