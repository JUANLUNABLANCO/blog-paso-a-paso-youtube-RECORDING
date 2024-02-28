export interface LoginForm {
  email: string;
  password: string;
}
export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface JWT {
  header: {
    alg: string;
    typ: string;
  };
  payload: {
    sub: string; // Sujeto (subject)
    exp: number; // Fecha de expiración (timestamp)
    iat: number; // Fecha de emisión (timestamp)
    // Otras claims (reclamaciones) según tus necesidades
  };
  signature: string;
}

export interface JWTDecoded {
  user: {
    id: number;
    name: string,
    email: string;
  }
}