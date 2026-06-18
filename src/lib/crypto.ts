import crypto from "crypto";

const HASH_SECRET = process.env.HASH_SECRET!;

// generate secure refresh token
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

// hash token for DB storage
export function hashToken(token: string) {
  return crypto.createHmac("sha256", HASH_SECRET).update(token).digest("hex");
}
