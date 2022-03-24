import { Request, Response } from "express";

export interface AuthInfo {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  auth?: AuthInfo;
}

// export class AuthContext {
//   public constructor(
//     public readonly req: AuthRequest,
//     public readonly res: Response
//   ) {}
// }

export class AuthContext {
  req!: AuthRequest;
  res!: Response;
}
