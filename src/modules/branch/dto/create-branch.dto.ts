import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['male', 'female', 'mixed'])
  @IsOptional()
  genderPreference?: 'male' | 'female' | 'mixed';

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsOptional()
  roomQuota?: number;
}
