import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    return NextResponse.json({ message: "Hello" });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.error().json();
  }
}
