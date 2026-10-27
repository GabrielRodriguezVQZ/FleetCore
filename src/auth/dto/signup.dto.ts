import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/enums.js';

export class SignupDto {
  @ApiProperty({ example: 'Ana Torres' })
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'ana@fleetcore.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123*', minLength: 8 })
  @IsString() @MinLength(8) @MaxLength(72)
  password: string;

  @ApiProperty({ enum: Role, example: Role.TECHNICIAN })
  @IsEnum(Role)
  role: Role;
}
