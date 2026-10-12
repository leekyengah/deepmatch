# DEEPMATCH UX Writing Guidelines

## Buttons & CTAs

Use the verb that matches the real action.

| Prefer | Avoid when inaccurate |
|---|---|
| Lưu thay đổi / Save changes | Xác nhận / Confirm |
| Gửi lời mời / Send invitation | Tiếp tục / Continue |
| Xem gợi ý / See suggestions | Khám phá ngay!!! |
| Yêu cầu đặt lịch / Request booking | Đặt thành công / Booked |

No emoji, all-caps shouting, or excessive exclamation marks.

## Empty states

Explain the state and suggest a next step. Never blame the user.

Example (vi): “Chưa có hồ sơ nào phù hợp với bộ lọc hiện tại. Bạn có thể điều chỉnh tiêu chí để khám phá thêm.”

## Errors

What happened · impact · what to do next.

Example (vi): “Chưa thể gửi tin nhắn. Vui lòng kiểm tra kết nối và thử lại.”

Map API codes via `errors.*` keys when possible; never leak internals.

## Success

Confirm the completed action accurately.

Example (vi): “Lời mời đã được gửi. Không gian chung sẽ được tạo khi người nhận đồng ý.”

## Confirmations

For disconnect, delete account, cancel service, or privacy changes: state consequences before the irreversible action.

## Premium & commerce

- Show price, term, benefits, renewal, cancel, refund clearly.
- No false scarcity or relationship-outcome promises tied to payment.
- DEMO / sandbox items must stay labeled.

## Microcopy checklist

- Navigation labels fit both locales (VI often longer).
- Form labels over vague placeholders alone.
- Validation errors are specific.
- Disabled controls explained when helpful.
- Toasts/dialogs use glossary terms.
- Permission, loading, empty, a11y labels localized.
- Push/email subjects follow the same voice (templates TBD → `notifications.*`).

## Message keys

UI copy lives in `@deepmatch/i18n` under namespace keys (`discovery.emptyBody`). Do not hardcode user-facing strings in JSX except documented technical exceptions (brand SVG alt that is the word DeepMatch, raw user content, debug-only staging badges when intentional).
