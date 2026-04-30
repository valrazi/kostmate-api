import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @IsEnum(['available', 'filled', 'maintenance'])
  @IsOptional()
  status?: 'available' | 'filled' | 'maintenance';

  @IsEnum(['male', 'female', 'mixed'])
  @IsOptional()
  gender?: 'male' | 'female' | 'mixed';
}
