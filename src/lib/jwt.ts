import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
}
