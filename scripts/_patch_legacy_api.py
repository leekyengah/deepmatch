# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# messages/route.ts — surgical replacements
p = ROOT / "apps/web/src/app/api/messages/route.ts"
t = p.read_text(encoding="utf-8")
if "jsonError" not in t:
    t = t.replace(
        'import { flagEnabled } from "@/lib/flags";\n',
        'import { flagEnabled } from "@/lib/flags";\nimport { jsonError, makeRequestId } from "@/lib/api-error";\n',
    )
t = t.replace(
    """  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId_required" }, { status: 400 });
  }""",
    """  const requestId = makeRequestId();
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) {
    return jsonError("VALIDATION_ERROR", "missingConversationId", requestId);
  }""",
)
t = t.replace(
    """  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const mediaIds = [""",
    """  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }

  const mediaIds = [""",
)
t = t.replace(
    """export async function POST(req: Request) {
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    conversationId?: string;
    text?: string;
    mediaId?: string;
    clientDedupeKey?: string;
  };
  const text = body.text?.trim() ?? "";
  if (!body.conversationId || (!text && !body.mediaId)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }""",
    """export async function POST(req: Request) {
  const requestId = makeRequestId();
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }

  const body = (await req.json()) as {
    conversationId?: string;
    text?: string;
    mediaId?: string;
    clientDedupeKey?: string;
  };
  const text = body.text?.trim() ?? "";
  if (!body.conversationId || (!text && !body.mediaId)) {
    return jsonError("VALIDATION_ERROR", "invalidJson", requestId);
  }""",
)
t = t.replace(
    'return NextResponse.json({ error: "media_not_accessible" }, { status: 403 });',
    'return jsonError("RESOURCE_NOT_ACCESSIBLE", null, requestId);',
)
t = t.replace(
    """  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ message: data });
}""",
    """  if (error) {
    return jsonError("VALIDATION_ERROR", null, requestId);
  }
  return NextResponse.json({ message: data });
}""",
)
p.write_text(t, encoding="utf-8")
print("messages")

for rel in [
    "apps/web/src/app/api/pairs/invites/route.ts",
    "apps/web/src/app/api/pairs/accept/route.ts",
]:
    p = ROOT / rel
    t = p.read_text(encoding="utf-8")
    if "jsonError" not in t:
        t = t.replace(
            'import { createClient } from "@/lib/supabase/server";\n',
            'import { createClient } from "@/lib/supabase/server";\nimport { jsonError, makeRequestId } from "@/lib/api-error";\n',
        )
    t = t.replace(
        """  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }""",
        """  const requestId = makeRequestId();
  if (!user) {
    return jsonError("UNAUTHENTICATED", null, requestId);
  }""",
    )
    t = t.replace(
        'return NextResponse.json({ error: "code_required" }, { status: 400 });',
        'return jsonError("VALIDATION_ERROR", null, requestId);',
    )
    t = t.replace(
        'return NextResponse.json({ error: error.message }, { status: 400 });',
        'return jsonError("VALIDATION_ERROR", null, requestId);',
    )
    p.write_text(t, encoding="utf-8")
    print(rel)

p = ROOT / "apps/web/src/app/api/matching/rank/route.ts"
t = p.read_text(encoding="utf-8")
if "jsonError" not in t:
    t = t.replace(
        'import { flagEnabled } from "@/lib/flags";\n',
        'import { flagEnabled } from "@/lib/flags";\nimport { jsonError } from "@/lib/api-error";\n',
    )
t = t.replace(
    'return NextResponse.json({ error: "matching_disabled" }, { status: 503 });',
    'return jsonError("FORBIDDEN", "flagDiscoveryOff");',
)
p.write_text(t, encoding="utf-8")
print("matching/rank")
print("legacy done")
