import { hashToken } from "@/lib/crypto";
import { connectDB } from "@/lib/db";
import RefreshToken from "@/models/RefreshToken";
import { cookies } from "next/headers";

export async function POST() {
  await connectDB();

  const cookiesStore = await cookies();

  const token = cookiesStore.get("Secure-refreshToken")?.value;

  // 1.hash the token and revoke token
  if (token) {
    const tokenDoc = await RefreshToken.findOneAndUpdate(
      { token: hashToken(token) },
      { revoked: true },
    );
  }

  // 2.delete cookies

  cookiesStore.delete("Secure-userID");
  cookiesStore.delete("Secure-accessToken");
  cookiesStore.delete("Secure-refreshToken");
  cookiesStore.delete("Host-sessionId");

  return Response.json({
    message: "logged out successfully",
  });
}
