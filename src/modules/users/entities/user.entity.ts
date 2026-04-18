import {
  BeforeCreate,
  Column,
  DataType,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasOne,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import { Owner } from "@/modules/owner/entities/owner.entity";

@Table({ tableName: "users", underscored: true, paranoid: true })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ unique: true, allowNull: false })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({
    type: DataType.ENUM("SUPERADMIN", "OWNER", "STAFF"),
    defaultValue: "OWNER",
  })
  role: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasOne(() => Owner)
  ownerProfile: Owner;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @BeforeCreate
  static async assignIdAndHash(instance: User): Promise<void> {
    instance.id = instance.id ?? uuidv4();
    instance.password = await bcrypt.hash(instance.password, 10);
  }
}
