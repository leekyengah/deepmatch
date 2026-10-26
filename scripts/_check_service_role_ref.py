"""Compare JWT ref claim of SUPABASE_SERVICE_ROLE_KEY vs URL project."""
import base64
import json
import os
from pathlib import Path


def load(path: Path) -> dict:
    out = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def jwt_ref(token: str):
    if not token or token.count(".") < 2:
        return None
    try:
        p = token.split(".")[1]
        p += "=" * (-len(p) % 4)
        return json.loads(base64.urlsafe_b64decode(p.encode())).get("ref")
    except Exception:
        return None


for label, path in [
    ("vercel-prod", Path(".ai/.vercel-prod.env")),
    ("web-local", Path("apps/web/.env.local")),
    ("root-local", Path(".env.local")),
]:
    e = load(path)
    url = e.get("NEXT_PUBLIC_SUPABASE_URL", "")
    sr = e.get("SUPABASE_SERVICE_ROLE_KEY", "")
    anon = e.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    print(
        label,
        "url_has",
        "zzqpvjdyvjarpphqhaze" in url,
        "anon_ref",
        jwt_ref(anon),
        "service_ref",
        jwt_ref(sr),
        "service_len",
        len(sr),
    )
