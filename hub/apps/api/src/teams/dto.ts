import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

// All validation messages are in Argentine Spanish — the only supported locale.
export class CreateTeamDto {
  @IsString({ message: "El juego es obligatorio" })
  gameId!: string;

  @IsString({ message: "El nombre del equipo es obligatorio" })
  @MinLength(2, { message: "El nombre es demasiado corto" })
  @MaxLength(60, { message: "El nombre es demasiado largo" })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: "El tag debe tener 10 caracteres o menos" })
  tag?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "La bio es demasiado larga" })
  bio?: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El nombre es demasiado corto" })
  @MaxLength(60, { message: "El nombre es demasiado largo" })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: "El tag debe tener 10 caracteres o menos" })
  tag?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "La bio es demasiado larga" })
  bio?: string;
}

export class AddTeamMemberDto {
  @IsString({ message: "El usuario es obligatorio" })
  userId!: string;
}
