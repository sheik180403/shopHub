import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/models/RefreshToken";
import { generateRefreshToken, hashToken } from "@/lib/crypto";
import { signAccessToken } from "@/lib/jwt";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("Secure-refreshToken")?.value;

    const sessionId = cookieStore.get("Host-sessionId")?.value;

    if (!refreshToken || !sessionId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenDoc = await RefreshToken.findOne({
      sessionId,
      token: hashToken(refreshToken),
    });

    if (!tokenDoc) {
      return Response.json(
        { message: "Invalid refresh token" },
        { status: 401 },
      );
    }

    if (tokenDoc.revoked) {
      return Response.json(
        { message: "Refresh token revoked" },
        { status: 401 },
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      return Response.json(
        { message: "Refresh token expired" },
        { status: 401 },
      );
    }

    // Update last used time
    tokenDoc.lastUsedAt = new Date();
    await tokenDoc.save();

    // Revoke old refresh token
    await tokenDoc.revoke();

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();

    // Store new hashed refresh token
    await RefreshToken.create({
      userId: tokenDoc.userId,
      sessionId,
      token: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(),
    });

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: tokenDoc.userId.toString(),
      sessionId,
    });

    // Update access token cookie
    cookieStore.set("Secure-accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    // Update refresh token cookie
    cookieStore.set("Secure-refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return Response.json(
      {
        message: "Token refreshed successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Refresh token error:", error);

    return Response.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
