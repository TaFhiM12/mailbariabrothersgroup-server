import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export type JwtPayload = {
  userId: string;
  role: string;
};

export const createToken = async (payload: JwtPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret);

  return payload as JwtPayload;
};