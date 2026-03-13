import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { getUTCDate } from "@/lib/utils";
import type { DailyChallengeResponse } from "@/lib/challenge-types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const tomorrow = getUTCDate(1);
  const limitDay = getUTCDate(-4);
  const res = await prisma.challenge.findMany({
    where: {
      activeDate: {
        gte: limitDay,
        lt: tomorrow,
      },
    },
    take: 6,
  });

  if (!res) {
    const error = NextResponse.error();

    throw new Error(
      `Failed to get challenge from db! Msg: ${error.statusText}! Status: ${error.status}.`,
    );
  }

  const response: DailyChallengeResponse = {
    challenges: res,
    todayChallengeId: res[res.length - 1]?.id,
    nextChallengeAtUTC: tomorrow,
    serverNowUTC: new Date(),
  };

  return NextResponse.json(response);
}
