import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Room } from '@/modules/room/entities/room.entity';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';

@Table({ tableName: 'payments', underscored: true, paranoid: true })
export class Payment extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Rental)
  @Column(DataType.UUID)
  rentalId: string;

  @BelongsTo(() => Rental)
  rental: Rental;

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

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  amount: number;

  @Column({
    type: DataType.ENUM('pending', 'paid', 'overdue', 'failed'),
    defaultValue: 'pending'
  })
  status: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  dueDate: Date;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  paymentDate: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  invoiceUrl: string;
  
  @Column({ type: DataType.STRING, allowNull: true })
  paymentMethod: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
