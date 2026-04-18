import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { Branch } from '@/modules/branch/entities/branch.entity';

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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}