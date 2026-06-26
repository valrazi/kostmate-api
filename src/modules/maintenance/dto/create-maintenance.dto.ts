import { IsUUID, IsNumber, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'ID of the branch' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ description: 'Electricity bills cost' })
  @IsNumber()
  @IsNotEmpty()
  electricBills: number;

  @ApiProperty({ description: 'Operational bills cost' })
  @IsNumber()
  @IsNotEmpty()
  operationalBills: number;

  @ApiProperty({ description: 'Date of the bills (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Optional notes or description', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
