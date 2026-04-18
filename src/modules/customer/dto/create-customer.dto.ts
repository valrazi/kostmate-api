import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  whatsappNumber: string;

  @IsEnum(['male', 'female'])
  @IsNotEmpty()
  gender: 'male' | 'female';

  @IsString()
  @IsNotEmpty()
  emergencyContactName: string;

  @IsString()
  @IsNotEmpty()
  emergencyPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  identityUrl: string;
}
