# -*- coding: utf-8 -*-
import re
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
api = ROOT / "apps/web/src/app/api"
vi = re.compile(
    r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]"
)

# Capture string literals passed as 2nd arg to jsonError
pat = re.compile(r'jsonError\(\s*"([^"]+)"\s*,\s*"([^"]*)"')
pat2 = re.compile(r"jsonError\(\s*'([^']+)'\s*,\s*'([^']*)'")
# multi-line jsonError with template
pat_ml = re.compile(
    r'jsonError\(\s*"([^"]+)"\s*,\s*\n\s*"([^"]*)"',
)

msgs = Counter()
vi_files = []
parts = []

for p in sorted(api.rglob("route.ts")):
    text = p.read_text(encoding="utf-8")
    file_hits = []
    for m in pat.finditer(text):
        msgs[(m.group(1), m.group(2))] += 1
        file_hits.append(f"  {m.group(1)} | {m.group(2)}")
    for m in pat2.finditer(text):
        msgs[(m.group(1), m.group(2))] += 1
        file_hits.append(f"  {m.group(1)} | {m.group(2)}")
    for m in pat_ml.finditer(text):
        msgs[(m.group(1), m.group(2))] += 1
        file_hits.append(f"  {m.group(1)} | {m.group(2)}")
    if vi.search(text):
        vi_files.append(p.as_posix())
        for i, line in enumerate(text.splitlines(), 1):
            if vi.search(line):
                file_hits.append(f"  L{i}: {line.strip()}")
    if file_hits:
        parts.append(f"=== {p.as_posix()}")
        parts.extend(file_hits)
        parts.append("")

out = ROOT / ".ai/api-error-inventory.txt"
out.write_text("\n".join(parts), encoding="utf-8")
print("files_with_hits", len([x for x in parts if x.startswith("===")]))
print("unique_code_msg", len(msgs))
print("vi_files", len(vi_files))
# top messages
for (code, msg), n in msgs.most_common(40):
    print(f"{n:3} {code:24} {msg[:70]}")
