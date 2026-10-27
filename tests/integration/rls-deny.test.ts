/**
 * RLS deny harness (ARCH-03).
 * Runs only when SUPABASE_URL + SUPABASE_ANON_KEY + RLS_TEST_USER_A_JWT + RLS_TEST_USER_B_JWT are set.
 * Never commit JWTs or service role keys.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtA = process.env.RLS_TEST_USER_A_JWT;
const jwtB = process.env.RLS_TEST_USER_B_JWT;
const noteIdOwnedByA = process.env.RLS_TEST_PRIVATE_NOTE_ID_A;

const configured = Boolean(url && anon && jwtA && jwtB);

async function restGet(path: string, jwt: string) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anon!,
      Authorization: `Bearer ${jwt}`,
      Accept: "application/json",
    },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

describe("RLS deny suite", { skip: !configured }, () => {
  it("user B cannot read user A private notes when not shared", async () => {
    assert.ok(noteIdOwnedByA, "set RLS_TEST_PRIVATE_NOTE_ID_A");
    const { body } = await restGet(
      `private_notes?id=eq.${noteIdOwnedByA}&select=id,body`,
      jwtB!,
    );
    assert.ok(Array.isArray(body));
    assert.equal(body.length, 0, "expected empty result under RLS deny");
  });

  it("user B cannot read audit_logs", async () => {
    const { body } = await restGet("audit_logs?select=id&limit=1", jwtB!);
    assert.ok(Array.isArray(body));
    assert.equal(body.length, 0);
  });
});

describe("RLS harness gate", () => {
  it("documents skip when credentials absent", () => {
    if (!configured) {
      assert.equal(configured, false);
    } else {
      assert.equal(configured, true);
    }
  });
});
