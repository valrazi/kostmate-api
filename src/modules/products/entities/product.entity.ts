import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true,
})
export class Product extends Model<Product> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  ownerId: string;

  @BelongsTo(() => User)
  owner: User;

  static createId(): string {
    return uuidv4();
  }
}
