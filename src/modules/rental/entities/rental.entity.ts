import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Room } from '@/modules/room/entities/room.entity';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';

@Table({ tableName: 'rentals', underscored: true, paranoid: true })
export class Rental extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Room)
  @Column(DataType.UUID)
  roomId: string;

  @BelongsTo(() => Room)
  room: Room;

  @ForeignKey(() => Customer)
  @Column(DataType.UUID)
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;

  @ForeignKey(() => Branch)
  @Column(DataType.UUID)
  branchId: string;

  @BelongsTo(() => Branch)
  branch: Branch;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  startDate: Date;

  @Column({
    type: DataType.ENUM('daily', 'weekly', 'monthly'),
    defaultValue: 'monthly'
  })
  rentType: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  dueDateDay: Date;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  notificationDay: Date;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  monthlyPrice: number;

  @Column({
    type: DataType.ENUM('active', 'finished', 'overdue'),
    defaultValue: 'active'
  })
  status: string;

  @Column(DataType.TEXT)
  notes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}