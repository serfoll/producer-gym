import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { getUTCDate } from "@/lib/utils";
import type {
  ChallengeResponse,
  DailyChallengeResponse,
} from "@/lib/challenge-types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const today = getUTCDate();
  const tomorrow = getUTCDate(1);
  const dbResponse = await prisma.challenge.findFirst({
    where: {
      activeDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (!dbResponse) {
    const error = NextResponse.error();

    throw new Error(
      `Failed to get challenge from db! Msg: ${error.statusText}! Status: ${error.status}.`,
    );
  }

  const {
    activeDate,
    blobUrl,
    description,
    duration,
    id,
    referenceFeatures,
    title,
  } = dbResponse;

  const challenge: ChallengeResponse = {
    activeDate,
    blobUrl,
    description,
    duration,
    id,
    referenceFeatures,
    title,
  };

  const response: DailyChallengeResponse = {
    challenge,
    nextChallengeAtUTC: tomorrow,
    serverNowUTC: new Date(),
  };

  return NextResponse.json(response);
}
