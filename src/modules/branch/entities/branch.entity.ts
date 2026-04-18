import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Owner } from '@/modules/owner/entities/owner.entity';
import { Room } from '@/modules/room/entities/room.entity';
import { Customer } from '@/modules/customer/entities/customer.entity';

@Table({ tableName: 'branches', underscored: true, paranoid: true })
export class Branch extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Owner)
  @Column(DataType.UUID)
  ownerId: string;

  @BelongsTo(() => Owner)
  owner: Owner;

  @Column({ allowNull: false })
  name: string;

  @Column({
    type: DataType.ENUM('male', 'female', 'mixed'),
    defaultValue: 'mixed'
  })
  genderPreference: string;

  @Column(DataType.TEXT)
  address: string;

  @Column
  whatsappNumber: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  roomQuota: number;

  @HasMany(() => Room)
  rooms: Room[];

  @HasMany(() => Customer)
  customers: Customer[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}