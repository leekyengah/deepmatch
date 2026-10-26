# -*- coding: utf-8 -*-
import base64
import json
import subprocess
from pathlib import Path

out = Path(".ai/.vercel-prod.env")
subprocess.run(
    [
        "npx",
        "vercel",
        "env",
        "pull",
        str(out),
        "--environment",
        "production",
        "--yes",
        "--scope",
        "tradingbase",
    ],
    check=False,
)

text = out.read_text(encoding="utf-8") if out.exists() else ""
vals = {}
for line in text.splitlines():
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    vals[k] = v.strip().strip('"')

url = vals.get("NEXT_PUBLIC_SUPABASE_URL", "")
anon = vals.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
pub = vals.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")


def role(jwt: str):
    try:
        payload = jwt.split(".")[1]
        payload += "=" * ((4 - len(payload) % 4) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        return data.get("role"), data.get("ref")
    except Exception as e:
        return f"err:{e}", None


print("URL_ok", url.startswith("https://") and "supabase.co" in url)
print("URL_prefix", url[:48] if url else None)
print("ANON_len", len(anon), "role", role(anon) if anon else None)
print("PUB_len", len(pub), "role", role(pub) if pub.startswith("eyJ") else ("not-jwt-or-empty", None))
print("URL_is_jwt", url.startswith("eyJ"))
print("ANON_is_url", anon.startswith("https://"))
