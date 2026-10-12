/**
 * Seed Master tab32 7 companion packages into service_offerings (service role).
 */
const packages = [
  {
    code: "CMP-01",
    title: "CMP-01 · Lắng nghe",
    sale: 498000,
    list: 598000,
    duration: "1 buổi × 45 phút",
    suitable: "Người muốn chia sẻ chuyện đời sống/công việc/cảm xúc.",
    benefits:
      "Chọn người; chọn chủ đề; gọi thoại/video; lời nhắn trước buổi; đánh giá sau buổi.",
    process:
      "Chọn gói → xem hồ sơ và lịch → gửi nhu cầu → xác nhận → thanh toán sandbox → gọi → phản hồi.",
    limits:
      "Không trị liệu, chẩn đoán, hỗ trợ khẩn cấp hoặc trò chuyện không giới hạn.",
  },
  {
    code: "CMP-02",
    title: "CMP-02 · Cùng trải nghiệm",
    sale: 1498000,
    list: 1798000,
    duration: "1 buổi × 2 giờ",
    suitable: "Cùng cà phê, đi dạo, triển lãm hoặc hoạt động công cộng.",
    benefits:
      "Chọn người; đề xuất hoạt động/địa điểm; thống nhất lịch; check-in/out.",
    process: "Chọn người → đề xuất → hai bên xác nhận → thanh toán sandbox → gặp → đánh giá.",
    limits: "Không gồm ăn/vé/quà/di chuyển ngoài phạm vi; không bảo vệ hay cam kết tình cảm.",
  },
  {
    code: "CMP-03",
    title: "CMP-03 · Đồng hành mục tiêu",
    sale: 3380000,
    list: 3980000,
    duration: "4 tuần; 4 buổi × 45 phút",
    suitable: "Duy trì mục tiêu học tập, giao tiếp hoặc thói quen.",
    benefits: "Kế hoạch tuần; 4 buổi online; tiến độ riêng; tối đa 3 trao đổi ngắn/tuần.",
    process: "Khai nhu cầu → xác nhận → thanh toán sandbox → 4 buổi → tổng kết.",
    limits: "Không cam kết đạt mục tiêu; không trị liệu.",
  },
  {
    code: "CMP-04",
    title: "CMP-04 · Đồng hành riêng",
    sale: 9980000,
    list: 11980000,
    duration: "4 tuần; tổng 8 giờ",
    suitable: "Cần lịch ổn định và hỗ trợ điều phối.",
    benefits: "Kế hoạch cá nhân; 8 giờ; đổi lịch/thay thế; tối đa 5 trao đổi ngắn/tuần.",
    process: "Trao đổi nhu cầu → xác nhận → thanh toán sandbox → lịch → buổi → tổng kết.",
    limits: "Không 24/7, không độc quyền.",
  },
  {
    code: "MAT-01",
    title: "MAT-01 · Tìm người phù hợp",
    sale: 4980000,
    list: 5980000,
    duration: "30 ngày",
    suitable: "Muốn tuyển chọn hồ sơ rồi chủ động tìm hiểu.",
    benefits: "1 buổi 60 phút; tối đa 5 hồ sơ; 3 lời mời; 1 lần chỉnh tiêu chí.",
    process: "Nhu cầu → tiếp nhận → thanh toán sandbox → tuyển chọn → đồng thuận hai chiều → kết nối.",
    limits: "Lời mời ≠ kết nối thành công; không cam kết người yêu.",
  },
  {
    code: "MAT-02",
    title: "MAT-02 · Tìm bạn đời",
    sale: 16980000,
    list: 19800000,
    duration: "90 ngày",
    suitable: "Mục tiêu nghiêm túc hướng tới hôn nhân.",
    benefits: "2 buổi tìm hiểu; tối đa 8 hồ sơ, 5 lời mời, 3 buổi gặp có đồng thuận.",
    process: "Đánh giá → tiếp nhận → thanh toán sandbox → khai thác → giới thiệu → gặp → tổng kết.",
    limits: "Không cam kết kết hôn; không tự liên hệ gia đình.",
  },
  {
    code: "MAT-03",
    title: "MAT-03 · Mai mối riêng",
    sale: 43800000,
    list: 49800000,
    duration: "180 ngày",
    suitable: "Muốn chuyên viên theo sát hành trình.",
    benefits: "Tối đa 12 hồ sơ, 8 lời mời, 6 buổi gặp; 6 buổi cá nhân; rà soát tháng.",
    process: "Đánh giá → tiếp nhận → thanh toán sandbox → kế hoạch → tuyển chọn/gặp → rà soát → tổng kết.",
    limits: "Không cam kết hôn nhân, độc quyền, 24/7.",
  },
];

const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!u || !k) {
  console.error("Missing Supabase service role env");
  process.exit(1);
}

const headers = {
  apikey: k,
  Authorization: `Bearer ${k}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const existing = await fetch(
  `${u}/rest/v1/service_offerings?select=id,title,active`,
  { headers },
).then((r) => r.json());

const byTitle = new Map(existing.map((r) => [r.title, r]));

for (const pkg of packages) {
  const description = [
    pkg.duration,
    `Giá mở bán: ${pkg.sale.toLocaleString("vi-VN")} ₫`,
    `Giá niêm yết: ${pkg.list.toLocaleString("vi-VN")} ₫`,
    pkg.suitable,
    `Quyền lợi: ${pkg.benefits}`,
    `Quy trình: ${pkg.process}`,
    `Giới hạn: ${pkg.limits}`,
    "Sandbox — chưa thu tiền / PSP thật.",
  ].join("\n\n");

  const row = byTitle.get(pkg.title);
  if (row) {
    const res = await fetch(`${u}/rest/v1/service_offerings?id=eq.${row.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ description, active: true }),
    });
    console.log("update", pkg.title, res.status);
  } else {
    const res = await fetch(`${u}/rest/v1/service_offerings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: pkg.title, description, active: true }),
    });
    console.log("insert", pkg.title, res.status, await res.text());
  }
}

for (const row of existing) {
  if (!/^(CMP|MAT)-\d{2}/.test(row.title) && row.active) {
    const res = await fetch(`${u}/rest/v1/service_offerings?id=eq.${row.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: false }),
    });
    console.log("deactivate legacy", row.title, res.status);
  }
}

console.log("done");
