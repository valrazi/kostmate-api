import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';

@Table({ tableName: 'rooms', underscored: true, paranoid: true })
export class Room extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Branch)
  @Column(DataType.UUID)
  branchId: string;

  @BelongsTo(() => Branch)
  branch: Branch;

  @Column({ allowNull: false })
  roomNumber: string;

  @Column({
    type: DataType.ENUM('available', 'filled', 'maintenance'),
    defaultValue: 'available'
  })
  status: string;

  @Column({
    type: DataType.ENUM('male', 'female', 'mixed'),
    defaultValue: 'mixed'
  })
  gender: string;

  @HasMany(() => Rental)
  rentals: Rental[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}