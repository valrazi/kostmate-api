import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Owner } from '@/modules/owner/entities/owner.entity';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Customer } from '@/modules/customer/entities/customer.entity';

@Table({ tableName: 'whatsapp_message_queues', underscored: true, paranoid: true })
export class WhatsappQueue extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Owner)
  @Column({ type: DataType.UUID, allowNull: false })
  ownerId: string;

  @BelongsTo(() => Owner)
  owner: Owner;

  @ForeignKey(() => Branch)
  @Column({ type: DataType.UUID, allowNull: false })
  branchId: string;

  @BelongsTo(() => Branch)
  branch: Branch;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.UUID, allowNull: false })
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;

  @Column({ allowNull: false })
  customerWhatsappNumber: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  retriesCount: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  messageText: string;

  @Column({ type: DataType.STRING, allowNull: true })
  filePath: string;

  @Column({ type: DataType.ENUM('pending', 'sent', 'failed'), defaultValue: 'pending', allowNull: false })
  statusSent: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
