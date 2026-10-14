# -*- coding: utf-8 -*-
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
vi = re.compile(
    r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]"
)
# leftover free-text jsonError 2nd args that aren't keys
pat = re.compile(r'jsonError\(\s*"([A-Z_]+)"\s*,\s*"([^"]+)"')
left = []
for p in sorted((ROOT / "apps/web/src/app/api").rglob("route.ts")):
    text = p.read_text(encoding="utf-8")
    for m in pat.finditer(text):
        msg = m.group(2)
        if msg[0].islower() or msg.startswith("flag") or msg.startswith("missing") or msg.startswith("ai") or msg.startswith("product") or msg.startswith("sandbox") or msg.startswith("booking") or msg.startswith("cart") or msg.startswith("contact") or msg.startswith("offering") or msg.startswith("invalid") or msg.startswith("stripe") or msg.startswith("unsupported") or msg.startswith("idRequired") or msg.startswith("notFound") or msg.startswith("couple") or msg.startswith("geocode") or msg.startswith("profile") or msg.startswith("delete"):
            continue
        # if contains space or Vietnamese → leftover
        if " " in msg or vi.search(msg) or msg[0].isupper() and "_" not in msg:
            left.append(f"{p.as_posix()}: {m.group(1)} | {msg}")
    for i, line in enumerate(text.splitlines(), 1):
        if vi.search(line):
            left.append(f"{p.as_posix()}:{i}: {line.strip()}")

out = ROOT / ".ai/api-vi-remaining.txt"
out.write_text("\n".join(left), encoding="utf-8")
print("remaining_lines", len(left))
for x in left[:40]:
    print(x)
