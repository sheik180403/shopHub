import { connectDB } from "@/lib/db";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";
import bcrypt from "bcryptjs";
import { signAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { generateRefreshToken, hashToken } from "@/lib/crypto";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const sessionId = uuidv4();

  const accessToken = signAccessToken({
    userId: user._id,
    sessionId,
  });

  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    userId: user._id,
    sessionId,
    token: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const cookieStore = await cookies();

  cookieStore.set("Secure-userID", user._id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set("Secure-accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set("Secure-refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  cookieStore.set("Host-sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return Response.json({
    message: "Login successful",
  });
}
