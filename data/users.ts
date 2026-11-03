/**
 * Credenciales de prueba. Los valores se leen de variables de entorno (.env),
 * por lo que ninguna contraseña queda escrita en el repositorio.
 */
export interface Credentials {
  username: string;
  password: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example como .env y complétala (ver README).`,
    );
  }
  return value;
}

export function standardUser(): Credentials {
  return {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: requireEnv('SAUCE_PASSWORD'),
  };
}

export function lockedOutUser(): Credentials {
  return {
    username: process.env.LOCKED_OUT_USER ?? 'locked_out_user',
    password: requireEnv('SAUCE_PASSWORD'),
  };
}
