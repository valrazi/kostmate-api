import { IsUUID, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  rentalId: string;

  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(['pending', 'paid', 'overdue', 'failed'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  invoiceUrl?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
