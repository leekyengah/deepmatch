import {
  catalogHintsFor,
  resolveAiAdapter,
  stubAssist,
  systemPromptFor,
  type AiAssistResponse,
  type AiSuggestion,
  type AiTask,
  AI_DISCLAIMER,
} from "@deepmatch/shared";

function parseSuggestions(raw: string): AiSuggestion[] | null {
  try {
    const json = JSON.parse(raw) as { suggestions?: AiSuggestion[] };
    if (!Array.isArray(json.suggestions) || !json.suggestions.length) {
      return null;
    }
    return json.suggestions
      .filter((s) => s && typeof s.title === "string" && typeof s.body === "string")
      .slice(0, 4)
      .map((s) => ({
        title: String(s.title).slice(0, 120),
        body: String(s.body).slice(0, 800),
        demo: Boolean(s.demo),
      }));
  } catch {
    return null;
  }
}

async function openaiAssist(
  task: AiTask,
  input: Record<string, unknown>,
): Promise<AiAssistResponse | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPromptFor(task) },
        {
          role: "user",
          content: JSON.stringify({ task, input }),
        },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  const suggestions = parseSuggestions(content);
  if (!suggestions?.length) return null;

  return {
    adapter: "openai",
    task,
    disclaimer: AI_DISCLAIMER,
    suggestions,
    catalogHints: catalogHintsFor(task),
  };
}

/** Stub by default; OpenAI when AI_ADAPTER=openai and key present; else stub fallback. */
export async function runAssist(
  task: AiTask,
  input: Record<string, unknown>,
): Promise<AiAssistResponse> {
  const adapter = resolveAiAdapter();
  if (adapter === "openai") {
    try {
      const live = await openaiAssist(task, input);
      if (live) return live;
    } catch {
      /* fall through */
    }
    return { ...stubAssist(task, input), fallbackFrom: "openai" };
  }
  return stubAssist(task, input);
}
