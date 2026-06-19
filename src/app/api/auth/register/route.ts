import { connectDB } from "@/lib/db";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { signAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { generateRefreshToken, hashToken } from "@/lib/crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = await req.json();

  // 1. check user exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return Response.json({ message: "User already exists" }, { status: 400 });
  }

  // 2. hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: "local",
  });

  // 4. create session
  const sessionId = uuidv4();

  // 5. generate tokens
  const accessToken = signAccessToken({
    userId: user._id,
    sessionId,
  });

  const refreshToken = generateRefreshToken(); // 🔥 crypto token

  // 6. store HASHED refresh token in DB (IMPORTANT FIX)
  await RefreshToken.create({
    userId: user._id,
    sessionId,
    token: hashToken(refreshToken), // 🔐 hashed
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // 7. set cookies 🍪
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

  // 8. response
  return Response.json(
    {
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
    { status: 201 },
  );
}
