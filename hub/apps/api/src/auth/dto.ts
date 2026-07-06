import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

// All validation messages are in Argentine Spanish — the only supported locale.
export class RegisterDto {
  @IsEmail({}, { message: "El email no es válido" })
  email!: string;

  @IsString({ message: "La contraseña es obligatoria" })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(72, { message: "La contraseña es demasiado larga" })
  password!: string;

  @IsString({ message: "El nombre es obligatorio" })
  @MinLength(2, { message: "El nombre es demasiado corto" })
  @MaxLength(40, { message: "El nombre es demasiado largo" })
  displayName!: string;
}

export class LoginDto {
  @IsEmail({}, { message: "El email no es válido" })
  email!: string;

  @IsString({ message: "La contraseña es obligatoria" })
  @MinLength(1, { message: "La contraseña es obligatoria" })
  password!: string;
}
