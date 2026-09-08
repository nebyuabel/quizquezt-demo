import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const adminSecret = process.env.ADMIN_SECRET_PASSWORD;

    if (!adminSecret) {
      console.error("ADMIN_SECRET_PASSWORD not set");
      return NextResponse.json(
        { error: "Admin access not configured" },
        { status: 500 },
      );
    }

    if (password !== adminSecret) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set cookie for API authentication
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
