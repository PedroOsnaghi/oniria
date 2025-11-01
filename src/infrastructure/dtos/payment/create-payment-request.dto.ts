import { IsString, IsNumber, IsEmail, IsNotEmpty, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

class IdentificationDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;
}

class PayerDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ValidateNested()
  @Type(() => IdentificationDto)
  identification!: IdentificationDto;
}

export class CreatePaymentRequestDto {
  @IsNumber()
  transaction_amount!: number;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  payment_method_id!: string;

  @IsNumber()
  installments!: number;

  @ValidateNested()
  @Type(() => PayerDto)
  payer!: PayerDto;

  @IsOptional()
  @IsString()
  context?: "membership" | "coins";
}
