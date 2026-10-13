import json
import re
from pathlib import Path

p = Path(
    r"C:\Users\khanh\.cursor\projects\d-D-N-C-NG-NGH-DEEPMATCH\agent-tools\adcf20f7-2085-4fd4-a214-533548163d82.txt"
)
raw = p.read_text(encoding="utf-8", errors="replace")
# Prefer structured JSON if present
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    data = None

titles = []
if isinstance(data, dict):
    sheets = data.get("sheets") or data.get("result", {}).get("sheets") or []
    for s in sheets:
        props = s.get("properties") or {}
        t = props.get("title")
        if t:
            titles.append(t)
else:
    # titles near sheetId often appear as "title": "..."
    titles = re.findall(r'"title"\s*:\s*"([^"]+)"', raw)
    # Drop non-sheet noise: keep those that look like numbered tabs or known names
    titles = [t for t in titles if re.match(r"^\d{2}\s", t) or t.isupper() or " " in t]

# de-dupe preserve order
seen = set()
out = []
for t in titles:
    if t not in seen:
        seen.add(t)
        out.append(t)

out_path = Path("docs/evidence/AUDIT-MASTER-SHEETS-2026-10-13.txt")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text("\n".join(f"{i:02d}\t{t}" for i, t in enumerate(out)) + "\n", encoding="utf-8")
print(f"sheets={len(out)} -> {out_path}")
for i, t in enumerate(out):
    print(f"{i:02d}\t{t}")
