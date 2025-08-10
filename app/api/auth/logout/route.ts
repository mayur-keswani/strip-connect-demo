import { NextResponse } from "next/server";

// logout route
export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the userId cookie
    response.cookies.set("userId", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0), // Set expiry to past date to delete cookie
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
