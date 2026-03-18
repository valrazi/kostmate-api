import {
  BeforeCreate,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Default('user')
  @Column({ type: DataType.STRING, allowNull: false })
  role: string;

  @HasMany(() => Product)
  products: Product[];

  @BeforeCreate
  static async assignIdAndHash(instance: User): Promise<void> {
    instance.id = instance.id ?? uuidv4();
    instance.password = await bcrypt.hash(instance.password, 10);
  }
}
