import { NextResponse } from "next/server";
import { NEEDS_QUESTION_BANK_VI } from "@deepmatch/shared";
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
  const group = url.searchParams.get("group");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0") || 0, 0);

  let list = NEEDS_QUESTION_BANK_VI;
  if (group) list = list.filter((q) => q.group === group || q.id.startsWith(group));

  return NextResponse.json({
    data: {
      questions: list.slice(offset, offset + limit),
      total: list.length,
      offset,
      limit,
    },
    meta: { request_id: requestId },
  });
}
