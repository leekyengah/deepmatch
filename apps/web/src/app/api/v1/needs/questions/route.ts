import { NextResponse } from "next/server";
import {
  NEEDS_QUESTION_BANK_VI,
  NEEDS_ONBOARDING_COMMON_IDS,
  NEEDS_ONBOARDING_MODE_BY_C01,
  buildOnboardingQuestionSet,
  needsQuestionById,
} from "@deepmatch/shared";
import { createClient } from "@/lib/supabase/server";
import { jsonError, makeRequestId } from "@/lib/api-error";

export async function GET(req: Request) {
  const requestId = makeRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHENTICATED", null, requestId);

  const url = new URL(req.url);
  const set = url.searchParams.get("set");
  const group = url.searchParams.get("group");
  const c01 = url.searchParams.get("c01");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0") || 0, 0);

  if (set === "onboarding") {
    const questions = buildOnboardingQuestionSet(c01);
    const modeQuestions = Object.fromEntries(
      Object.entries(NEEDS_ONBOARDING_MODE_BY_C01).map(([label, id]) => [
        label,
        needsQuestionById(id),
      ]),
    );
    return NextResponse.json({
      data: {
        questions,
        total: 7,
        applicable: questions.length,
        commonIds: [...NEEDS_ONBOARDING_COMMON_IDS],
        modeQuestions,
        set: "onboarding",
        offset: 0,
        limit: 7,
      },
      meta: { request_id: requestId },
    });
  }

  let list = NEEDS_QUESTION_BANK_VI;
  if (group) list = list.filter((q) => q.group === group || q.id.startsWith(group));

  return NextResponse.json({
    data: {
      questions: list.slice(offset, offset + limit),
      total: list.length,
      offset,
      limit,
      set: "full",
    },
    meta: { request_id: requestId },
  });
}
