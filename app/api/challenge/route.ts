import { type NextRequest, NextResponse } from "next/server";
import { generateSASUrl } from "@/lib/utils";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    return NextResponse.json({ message: "Hello" });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.error().json();
  }
}
