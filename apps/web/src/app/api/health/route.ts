import { NextResponse } from "next/server";
import { brand } from "@deepmatch/shared";
import { getFlags } from "@/lib/flags";

export async function GET() {
  const env = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
  const productionDeploy = env === "production";
  return NextResponse.json({
    ok: true,
    service: "deepmatch-web",
    env,
    brand,
    flags: await getFlags(),
    productionDeploy,
  });
}
