import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import type { ChallengeResponse } from "@/lib/types";
import { calculateTtl, getUTCDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest): Promise<NextResponse> {
  const today = getUTCDate();
  const tomorrow = getUTCDate(1);
  const res = await prisma.challenge.findFirst({
    where: {
      activeDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (!res) {
    return NextResponse.error();
  }

  const {
    activeDate,
    blobUrl,
    description,
    duration,
    id,
    referenceFeatures,
    title,
  } = res;

  const challenge: ChallengeResponse = {
    activeDate,
    blobUrl,
    description,
    duration,
    id,
    referenceFeatures,
    title,
  };

  const secondsToNextChallenge = calculateTtl();

  return NextResponse.json({ challenge, secondsToNextChallenge });
}
