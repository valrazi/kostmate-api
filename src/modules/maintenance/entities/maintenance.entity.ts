import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Branch } from '@/modules/branch/entities/branch.entity';

@Table({ tableName: 'maintenances', underscored: true, paranoid: true })
export class Maintenance extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => Branch)
  @Column({ type: DataType.UUID, allowNull: false })
  branchId: string;

  @BelongsTo(() => Branch)
  branch: Branch;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false, defaultValue: 0 })
  electricBills: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false, defaultValue: 0 })
  operationalBills: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column(DataType.TEXT)
  notes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
