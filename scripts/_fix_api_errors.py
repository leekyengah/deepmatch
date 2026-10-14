# -*- coding: utf-8 -*-
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "apps/web/src/app/api"


def fix_text(text: str) -> str:
    # double commas after null
    text = re.sub(r'jsonError\(\s*"([A-Z_]+)"\s*,\s*null\s*,\s*,\s*', r'jsonError("\1", null, ', text)
    # trailing empty third arg: jsonError("X", "key", ,)
    text = re.sub(
        r'jsonError\(\s*"([A-Z_]+)"\s*,\s*"([^"]+)"\s*,\s*,\s*\)',
        r'jsonError("\1", "\2")',
        text,
    )
    # multiline RESOURCE with null,,\n requestId
    text = re.sub(
        r'jsonError\(\s*"([A-Z_]+)"\s*,\s*null\s*,\s*,\s*\n\s*requestId\s*,?\s*\)',
        r'jsonError("\1", null, requestId)',
        text,
    )
    text = text.replace(", ,", ", ")
    text = text.replace(",,", ",")

    # Never pass await apiT(...) as detailKey — use key + vars
    text = text.replace(
        """    return jsonError(
      "VALIDATION_ERROR",
      await apiT("deleteConfirmRequired"),
      requestId,
    );""",
        """    return jsonError(
      "VALIDATION_ERROR",
      "deleteConfirmRequired",
      requestId,
    );""",
    )
    text = text.replace(
        """    return jsonError(
      "RATE_LIMITED",
      await apiT("aiQuotaExceeded", { quota }),
    );""",
        """    return jsonError(
      "RATE_LIMITED",
      "aiQuotaExceeded",
      undefined,
      { quota },
    );""",
    )
    text = text.replace(
        'session.error?.message ?? (await apiT("stripeCheckoutFailed"))',
        'await apiT("stripeCheckoutFailed")',
    )

    # DB/driver messages must not leak
    text = re.sub(
        r'jsonError\(\s*"VALIDATION_ERROR"\s*,\s*error\.message\s*(,\s*[^)]+)?\s*\)',
        lambda m: (
            f'jsonError("VALIDATION_ERROR", null{m.group(1) or ""})'
            if m.group(1)
            else 'jsonError("VALIDATION_ERROR")'
        ),
        text,
    )
    text = re.sub(
        r'jsonError\(\s*"INTERNAL"\s*,\s*error\.message\s*(,\s*[^)]+)?\s*\)',
        lambda m: (
            f'jsonError("INTERNAL", null{m.group(1) or ""})'
            if m.group(1)
            else 'jsonError("INTERNAL")'
        ),
        text,
    )

    # remaining VI ternaries
    text = text.replace(
        '? "Xác nhận DEMO — không phải đặt chỗ nhà cung cấp thật"\n'
        '        : "Đã hủy lệnh DEMO"',
        '? await apiT("demoConfirmed")\n'
        '        : await apiT("demoCancelled")',
    )
    text = text.replace(
        '? "Xác nhận DEMO — không phải đặt chỗ nhà cung cấp thật"\n'
        '      : "Đã hủy lệnh DEMO"',
        '? await apiT("demoConfirmed")\n'
        '      : await apiT("demoCancelled")',
    )
    text = text.replace(
        '? "Video vượt hạn mức 50MB hoặc kích thước không hợp lệ."\n'
        '      : "Kích thước ảnh không hợp lệ (tối đa 8MB).",',
        '? await apiT("videoTooLarge")\n'
        '      : await apiT("imageTooLarge"),',
    )

    # ensure apiT import when used
    if "await apiT(" in text:
        text = text.replace(
            'import { jsonError } from "@/lib/api-error";',
            'import { apiT, jsonError } from "@/lib/api-error";',
        )
        text = text.replace(
            'import { jsonError, makeRequestId } from "@/lib/api-error";',
            'import { apiT, jsonError, makeRequestId } from "@/lib/api-error";',
        )
        # already has apiT,jsonError — ok
        if "apiT" not in text.split("from \"@/lib/api-error\"")[0][-80:]:
            pass

    return text


def main() -> None:
    n = 0
    for p in sorted(API.rglob("route.ts")):
        orig = p.read_text(encoding="utf-8")
        text = fix_text(orig)
        if text != orig:
            p.write_text(text, encoding="utf-8")
            n += 1
            print("fixed", p.relative_to(ROOT).as_posix())
    print("files", n)


if __name__ == "__main__":
    main()
