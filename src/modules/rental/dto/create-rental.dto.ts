import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString, IsNumber } from 'class-validator';

export class CreateRentalDto {
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  rentType?: 'daily' | 'weekly' | 'monthly';

  @IsDateString()
  @IsNotEmpty()
  dueDateDay: string;

  @IsDateString()
  @IsNotEmpty()
  notificationDay: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyPrice: number;

  @IsEnum(['active', 'finished', 'overdue'])
  @IsOptional()
  status?: 'active' | 'finished' | 'overdue';

  @IsString()
  @IsOptional()
  notes?: string;
}
