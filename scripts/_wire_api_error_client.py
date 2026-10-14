# -*- coding: utf-8 -*-
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMPORT = 'import { resolveApiErrorMessage } from "@/lib/api-error-message";\n'

files = list((ROOT / "apps/web/src/components").rglob("*.tsx"))

# Patterns: left → use resolveApiErrorMessage(obj, t, fallback)
# Capture object expression and fallback key

patterns = [
    # json?.error?.message ?? t("...")
    (
        re.compile(
            r'(\w+(?:\?\.\w+)*)\?\.error\?\.message\s*\?\?\s*t\("([^"]+)"\)'
        ),
        lambda m: f'resolveApiErrorMessage({m.group(1)}, t, "{m.group(2)}")',
    ),
    # json.error?.message ?? t("...")
    (
        re.compile(r'(\w+)\.error\?\.message\s*\?\?\s*t\("([^"]+)"\)'),
        lambda m: f'resolveApiErrorMessage({m.group(1)}, t, "{m.group(2)}")',
    ),
    # body?.error?.message ?? t("...")
    (
        re.compile(r'(body)\?\.error\?\.message\s*\?\?\s*t\("([^"]+)"\)'),
        lambda m: f'resolveApiErrorMessage({m.group(1)}, t, "{m.group(2)}")',
    ),
    # intent.error?.message ?? t(...)  already covered by second
]


def ensure_import(text: str) -> str:
    if "resolveApiErrorMessage" in text and "api-error-message" in text:
        return text
    if "resolveApiErrorMessage" not in text:
        return text
    if text.startswith('"use client"'):
        return text.replace('"use client";\n\n', f'"use client";\n\n{IMPORT}', 1)
    # after first import
    lines = text.splitlines(keepends=True)
    last = 0
    for i, ln in enumerate(lines):
        if ln.startswith("import "):
            last = i
    lines.insert(last + 1, IMPORT)
    return "".join(lines)


n = 0
for p in files:
    text = p.read_text(encoding="utf-8")
    orig = text
    for rx, fn in patterns:
        text = rx.sub(fn, text)
    # AiAssist special: json?.error?.message ?? json?.message ?? t(...)
    text = re.sub(
        r'json\?\.error\?\.message\s*\?\?\s*json\?\.message\s*\?\?\s*t\("([^"]+)"\)',
        r'resolveApiErrorMessage(json, t, "\1")',
        text,
    )
    # BillingClient multi-line
    text = text.replace(
        """json.error?.message ??
            t("commerce.billingUnavailable")""",
        'resolveApiErrorMessage(json, t, "commerce.billingUnavailable")',
    )
    if text != orig:
        if "resolveApiErrorMessage" in text:
            text = ensure_import(text)
        p.write_text(text, encoding="utf-8")
        n += 1
        print("wired", p.relative_to(ROOT).as_posix())
print("files", n)
