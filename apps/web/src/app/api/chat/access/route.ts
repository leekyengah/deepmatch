import { NextResponse } from "next/server";
import { canAccessChat } from "@deepmatch/shared";
import { flagEnabled } from "@/lib/flags";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    isAuthenticated: boolean;
    isMutualMatch: boolean;
    isParticipant: boolean;
    isBlockedEitherWay: boolean;
    userSuspended: boolean;
  };

  const result = canAccessChat({
    ...body,
    chatFlagEnabled: await flagEnabled("ff_chat"),
  });

  return NextResponse.json(result, {
    status: result.allowed ? 200 : 403,
  });
}
