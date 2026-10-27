-- W4 part 1/3: add booking_status enum values only (must commit before use).
alter type booking_status add value if not exists 'refund_requested';
alter type booking_status add value if not exists 'refunded_sandbox';
