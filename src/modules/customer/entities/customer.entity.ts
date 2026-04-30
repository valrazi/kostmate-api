import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';

@Table({ tableName: 'customers', underscored: true, paranoid: true })
export class Customer extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Branch)
  @Column(DataType.UUID)
  branchId: string;

  @BelongsTo(() => Branch)
  branch: Branch;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  whatsappNumber: string;

  @Column({ type: DataType.ENUM('male', 'female'), allowNull: false })
  gender: string;

  @Column({ allowNull: false })
  emergencyContactName: string;

  @Column({ allowNull: false })
  emergencyPhoneNumber: string;

  @Column({ allowNull: false })
  identityUrl: string;

  @HasMany(() => Rental)
  rentals: Rental[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}