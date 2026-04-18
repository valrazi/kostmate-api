import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import { User } from "@/modules/users/entities/user.entity";
import { Branch } from "@/modules/branch/entities/branch.entity";

@Table({ tableName: 'owners', underscored: true, paranoid: true })
export class Owner extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ allowNull: false })
  name: string;

  @Column
  phoneNumber: string;

  @Column(DataType.DATE)
  subscriptionActiveUntil: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 2 })
  branchQuota: number;

  @Column({ type: DataType.INTEGER, defaultValue: 30 })
  roomQuota: number;

  @HasMany(() => Branch)
  branches: Branch[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}