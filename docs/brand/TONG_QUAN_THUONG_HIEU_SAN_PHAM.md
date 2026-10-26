# Tổng quan thương hiệu và sản phẩm DeepMatch

Định hướng cập nhật ngày 11 tháng 10 năm 2026

> Nguồn: Founder paste 2026-10-12 (Google Doc). Lưu trong repo để thay file `Tổng quan.docx` còn thiếu trong Design Package.

DeepMatch kết hợp kết nối có chọn lọc, bản đồ kỷ niệm riêng dành cho cặp đôi và dịch vụ đồng hành cá nhân. Tài liệu xác định định vị thương hiệu, cấu trúc sản phẩm, phạm vi phiên bản đầu tiên và nguyên tắc triển khai. Định hướng phát triển là xây sản phẩm bản đồ cặp đôi, đồng thời thử nghiệm dịch vụ ghép đôi có tuyển chọn; mở rộng tính năng hẹn hò trong ứng dụng khi đủ nguồn hồ sơ và năng lực vận hành.

## I. Định vị thương hiệu DeepMatch

| Thành tố | Mô tả chi tiết |
|---|---|
| Tên thương hiệu | DeepMatch |
| Tagline | Kết nối có chiều sâu. Cùng viết câu chuyện của chúng mình. |
| Thông điệp cốt lõi | Nền tảng dành cho người mong muốn mối quan hệ nghiêm túc, kết hợp khám phá bản thân, kết nối có chọn lọc và không gian riêng để hai người lưu giữ, phát triển câu chuyện của mình. |
| Định vị cảm xúc | Giúp người dùng hiểu điều mình tìm kiếm, chủ động tìm hiểu người khác và cùng nhau tạo thêm trải nghiệm có ý nghĩa. Tôn trọng quyền lựa chọn và nhịp phát triển của từng mối quan hệ. |
| Tệp khách hàng chính | Người độc thân trưởng thành tìm kiếm quan hệ nghiêm túc; người đang tìm hiểu nhau; cặp đôi muốn lưu giữ kỷ niệm và lên kế hoạch chung. Dịch vụ tư vấn riêng dành cho khách hàng có nhu cầu hỗ trợ cá nhân. Thành đạt là một hướng phân khúc tiếp thị, không phải thước đo giá trị con người. |
| Giá trị khác biệt | Kết nối hành trình trước và sau khi thành đôi: hồ sơ có chiều sâu, gợi ý có giải thích, bản đồ trải nghiệm với góc nhìn của cả hai và hỗ trợ cá nhân tùy chọn. Công nghệ hỗ trợ sàng lọc; chuyên viên đồng hành trong phạm vi năng lực và dịch vụ đã công bố. |

## II. Hệ thống bản sắc thương hiệu DeepMatch

### 1. Giọng nói thương hiệu (Brand Voice)

| Thành phần | Mô tả |
|---|---|
| Tông giọng | Chuyên nghiệp, ấm áp, thấu hiểu, giàu trí tuệ cảm xúc |
| Câu từ ưu tiên | “Điều bạn đang tìm kiếm”, “kết nối có chọn lọc”, “tôn trọng hành trình yêu”, “nơi chúng mình đã đến”, “điều mình nhớ nhất”. Ưu tiên câu chữ dễ hiểu; giải thích thuật ngữ chuyên môn khi cần. |
| Không nên dùng | Tránh ngôn ngữ phán xét, thúc ép hoặc bảo đảm kết quả: “ế”, “chốt đơn tình yêu”, “chắc chắn đúng người”, “không lặp lại sai lầm cũ”. Không gắn nhãn tâm lý hoặc chấm điểm giá trị con người. |

### 2. Hình ảnh thương hiệu và bảng màu đã chốt

Bảng màu nhận diện đã chốt ngày 11/10/2026:

| Tên | HEX | Dụng |
|---|---|---|
| Peony Pink | `#E95383` | Chủ đạo — logo, icon, điểm nhấn |
| Petal Pink | `#F6C1D2` | Nền phụ, thẻ, ấn phẩm |
| Soft White | `#FFF8FA` | Nền chính UI / tài liệu |
| Raspberry | `#822D4C` | Chữ, tiêu đề, tương phản |

Ưu tiên chữ Raspberry trên nền sáng; Peony tạo điểm nhấn.

- Phong cách ảnh: ấm áp, tối giản, ánh sáng tự nhiên, tập trung ánh mắt và tương tác hai người.
- Biểu tượng gợi ý: hai đường nét kết nối / xoắn tròn đồng tâm + điểm ghim; cần kiểm chứng trước khi chốt.

## III. Dịch vụ cốt lõi

1. **Deep Profile 1:1** — hồ sơ ngắn + phỏng vấn tùy chọn; phân quyền công khai/tư vấn; không chẩn đoán tâm lý / tự chấm EQ.
2. **Matching Strategy** — lọc theo điều kiện khai báo, gợi ý có giải thích; người dùng quyết định; không bảo đảm thành đôi / điểm “xác suất yêu”.
3. **Private Date Curation** — thống nhất địa điểm/thời gian/ngân sách; công khai phí, hủy/hoàn.
4. **After-Match Coaching** — kỳ vọng, giao tiếp; công bố phạm vi; chuyển chuyên gia khi vượt phạm vi.

## IV. Cấu trúc ứng dụng và hành trình

Ba phần: **Tìm nhau**, **Chúng mình**, **Đồng hành** (tùy chọn). Người đã có đôi vào thẳng Chúng mình bằng lời mời.

1. **Tìm nhau** — hồ sơ, điều kiện, gợi ý có giải thích, cùng thích, trò chuyện, đề xuất cuộc hẹn.
2. **Chúng mình** — bản đồ, kỷ niệm, media, cảm nhận từng người, timeline, wishlist. Nav: Bản đồ · Kỷ niệm · Thêm mới · Hẹn ước · Hai đứa.
3. **Đồng hành** — bốn dịch vụ trên; không bắt buộc để dùng bản đồ/kết nối.
4. **Chuyển trạng thái** — cùng thích chỉ mở chat; couple space chỉ sau lời mời hai phía; ẩn discovery khi thành đôi; ngắt kết nối một phía; không gian mới không mang lịch sử cũ.

## V. Bản đồ tình yêu và kỷ niệm

Ba lớp: Đã cùng đến · Muốn cùng đến · Dấu mốc. Ghim: địa điểm/thời gian, trải nghiệm, ăn uống tùy chọn, media, cảm nhận riêng, dấu mốc/kế hoạch. Ba lớp quyền xem (chung / chia sẻ khi chọn / nhật ký mặc định riêng). Không suy chất lượng quan hệ từ số ảnh/hẹn/thời gian dùng app.

## VI. Hồ sơ và gợi ý

Ba nhóm trường: điều kiện cần · đặc điểm tìm hiểu · thông tin tư vấn (có đồng ý). Gợi ý có lý do từ dữ liệu chủ động; không dùng nhật ký/GPS/tư vấn để xếp hạng/quảng cáo mặc định; không % tương hợp như xác suất yêu. Tham chiếu Joel et al. 2017 (DOI trong bản gốc).

## VII. Quyền riêng tư và an toàn

Couple private mặc định; fuzzy location; không tracking nền; age-gate; block/report free; RBAC; consent/export/delete rules công bố trước phát hành.

## VIII. Phạm vi phiên bản đầu và lộ trình

1. Kiểm chứng nhu cầu (phỏng vấn, prototype).
2. Bản đầu: tài khoản, invite, map, pins, media limits, journals, timeline, wishlist, connection mgmt + concierge đăng ký tối giản.
3. In-app matching khi đủ pool + moderation.
4. Mở rộng: reminders, album export, premium, partners — khi có bằng chứng.

**Chưa đưa vào bản đầu:** AI cảm xúc, điểm tương hợp tự động, live location, social công khai, booking phức tạp.

## IX. Doanh thu và chi phí

Couple freemium storage/map/export; phí dịch vụ cá nhân theo phạm vi; trải nghiệm/đối tác công khai phí. Chưa chốt bảng giá khi chưa có dữ liệu thử nghiệm.

## X. Chỉ số kiểm chứng (định nghĩa, không phải target)

Đơn vị đo: **cặp đôi**. Cặp kích hoạt = cả hai xác nhận + kỷ niệm đầu. Các tỷ lệ: chấp nhận lời mời, cùng đóng góp, duy trì tuần 4, cuộc hẹn xác nhận, CSAT, chi phí chuyên viên/khách. Không lấy swipe/time-in-app làm mục tiêu chính.

## XI. Truyền thông và chuẩn bị triển khai

- CTA chính: **Tìm kết nối phù hợp** · **Tạo bản đồ của chúng mình**; tư vấn là bổ sung.
- Email chào mừng: giải thích mode, privacy, một hành động đầu (hồ sơ hoặc mời).
- Ưu tiên triển khai: bản đồ cặp đôi + thử nghiệm ghép đôi tuyển chọn.
