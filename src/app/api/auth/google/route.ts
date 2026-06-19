import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import { signAccessToken } from "@/lib/jwt";
import { generateRefreshToken, hashToken } from "@/lib/crypto";
import RefreshToken from "@/models/RefreshToken";
import { v4 as uuidv4 } from "uuid";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { message: "Google token is required" },
        { status: 400 },
      );
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      return NextResponse.json(
        { message: "Email not verified" },
        { status: 401 },
      );
    }

    // 1. Connect MongoDB
    await connectDB();
    // 2. Find/Create user
    let user = await User.findOne({
      email,
    });

    if (!user) {
      user = User.create({
        email,
        name,
        profilePicture: picture,
        user: "user",
        provider: "google",
        googleId,
      });
    }

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

    return NextResponse.json({
      success: true,
      user: {
        email,
        name,
        picture,
        googleId,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Invalid Google token" },
      { status: 401 },
    );
  }
}
