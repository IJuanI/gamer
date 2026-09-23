import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { RecruitmentPostType } from "@gamer/shared";

// All validation messages are in Argentine Spanish — the only supported locale.
export class CreateRecruitmentPostDto {
  @IsEnum(RecruitmentPostType, { message: "El tipo de publicación no es válido" })
  type!: RecruitmentPostType;

  @IsString({ message: "El juego es obligatorio" })
  gameId!: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsString({ message: "El título es obligatorio" })
  @MinLength(3, { message: "El título es demasiado corto" })
  @MaxLength(80, { message: "El título es demasiado largo" })
  title!: string;

  @IsString({ message: "La descripción es obligatoria" })
  @MinLength(10, { message: "Contanos un poco más" })
  @MaxLength(2000, { message: "La descripción es demasiado larga" })
  body!: string;
}

export class UpdateRecruitmentPostDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: "El título es demasiado corto" })
  @MaxLength(80, { message: "El título es demasiado largo" })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: "Contanos un poco más" })
  @MaxLength(2000, { message: "La descripción es demasiado larga" })
  body?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
