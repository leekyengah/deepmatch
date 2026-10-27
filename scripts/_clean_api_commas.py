# -*- coding: utf-8 -*-
import re
from pathlib import Path

root = Path("apps/web/src/app/api")
for p in root.rglob("route.ts"):
    t = p.read_text(encoding="utf-8")
    n = t
    n = re.sub(r",(\s*)requestId,(\s*)\)", r",\1requestId\2)", n)
    n = n.replace("null,  requestId", "null, requestId")
    n = re.sub(r',  requestId', ", requestId", n)
    if n != t:
        p.write_text(n, encoding="utf-8")
        print("clean", p.as_posix())
print("done")
