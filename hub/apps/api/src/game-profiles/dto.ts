import { IsString, MinLength, MaxLength } from "class-validator";

// All validation messages are in Argentine Spanish — the only supported locale.
export class CreateGameProfileDto {
  @IsString({ message: "El juego es obligatorio" })
  gameId!: string;

  @IsString({ message: "El nombre de usuario en el juego es obligatorio" })
  @MinLength(2, { message: "El nombre de usuario es demasiado corto" })
  @MaxLength(40, { message: "El nombre de usuario es demasiado largo" })
  inGameHandle!: string;
}

export class UpdateGameProfileDto {
  @IsString({ message: "El nombre de usuario en el juego es obligatorio" })
  @MinLength(2, { message: "El nombre de usuario es demasiado corto" })
  @MaxLength(40, { message: "El nombre de usuario es demasiado largo" })
  inGameHandle!: string;
}
