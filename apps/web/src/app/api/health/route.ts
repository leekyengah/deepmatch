import { NextResponse } from "next/server";
import { brand, defaultFlags } from "@deepmatch/shared";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "deepmatch-web",
    env: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    brand,
    flags: defaultFlags,
    productionDeploy: false,
  });
}
