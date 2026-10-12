# -*- coding: utf-8 -*-
import base64
import json
from pathlib import Path


def parse_env(path: Path) -> dict[str, str]:
    vals: dict[str, str] = {}
    if not path.exists():
        return vals
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        vals[k] = v.strip().strip('"').strip("'")
    return vals


def role(jwt: str):
    try:
        payload = jwt.split(".")[1]
        payload += "=" * ((4 - len(payload) % 4) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        return data.get("role"), data.get("ref")
    except Exception as e:
        return f"err:{type(e).__name__}", None


def report(name: str, vals: dict[str, str]) -> None:
    url = vals.get("NEXT_PUBLIC_SUPABASE_URL", "")
    anon = vals.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    pub = vals.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")
    print(f"=== {name}")
    print("URL_ok", url.startswith("https://") and "supabase.co" in url, "prefix", url[:40] if url else None)
    print("URL_is_jwt", url.startswith("eyJ"))
    print("ANON_len", len(anon), "role", role(anon) if anon else None, "is_url", anon.startswith("https://"))
    print("PUB_len", len(pub), "role", role(pub) if pub.startswith("eyJ") else ("n/a", None))


for label, path in [
    ("vercel-prod", Path(".ai/.vercel-prod.env")),
    ("root-local", Path(".env.local")),
    ("web-local", Path("apps/web/.env.local")),
    ("admin-local", Path("apps/admin/.env.local")),
]:
    report(label, parse_env(path))
