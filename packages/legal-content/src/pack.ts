import type { LegalDocument, LegalPackMeta } from "./types";

/** User-facing policy pack v1.1 — Vietnamese source of truth (founder-provided). */
export const LEGAL_PACK_META: LegalPackMeta = {
  version: "1.1",
  contentUpdatedLabel: "12/10/2026",
  contentUpdatedIso: "2026-10-12",
  locale: "vi-VN",
  title: "Bộ chính sách dành cho người dùng",
  intro: [
    {
      type: "p",
      text: "Bộ chính sách này quy định cách sử dụng DEEPMATCH, bảo vệ thông tin cá nhân, tương tác an toàn và thực hiện giao dịch. Các điều kiện riêng tại thời điểm đăng ký hoặc đặt dịch vụ là một phần của thỏa thuận tương ứng, nhưng không được làm giảm quyền bắt buộc của người dùng.",
    },
    {
      type: "p",
      text: "Ngày cập nhật nội dung không đồng nghĩa ngày một dịch vụ được mở bán. Chính sách áp dụng khi được công bố trong dịch vụ; thay đổi cần chấp thuận sẽ được trình bày để bạn quyết định trước khi áp dụng. Chỉ những tính năng đang được cung cấp cho tài khoản và khu vực của bạn mới thuộc phạm vi sử dụng.",
    },
  ],
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "terms",
    path: "/legal/terms",
    title: "Điều khoản sử dụng",
    navLabel: "Điều khoản sử dụng",
    sourcePart: "I",
    blocks: [
      { type: "h2", id: "i-1", text: "1. Phạm vi và bên cung cấp" },
      {
        type: "p",
        text: "DEEPMATCH là tên dịch vụ kết nối, hẹn hò và hỗ trợ hành trình cặp đôi. Trong bộ chính sách, “chúng tôi” chỉ bên vận hành DEEPMATCH; “bạn” chỉ người sử dụng. Tên thương hiệu không thay thế danh tính pháp lý của bên cung cấp.",
      },
      {
        type: "p",
        text: "Thông tin nhận diện bên vận hành và kênh liên hệ là thành phần của thông báo dịch vụ, phải được cung cấp cho bạn trước khi đăng ký. Với giao dịch có đối tác, thông tin bên cung cấp, bên nhận thanh toán và trách nhiệm của mỗi bên phải được trình bày trước khi bạn đặt mua.",
      },
      { type: "h2", id: "i-2", text: "2. Điều kiện tham gia" },
      {
        type: "p",
        text: "Toàn bộ DEEPMATCH trong phạm vi phát hành này chỉ dành cho người từ đủ 18 tuổi và có năng lực giao kết phù hợp. Bạn phải khai đúng ngày sinh, thông tin tài khoản và không dùng danh tính của người khác.",
      },
      {
        type: "p",
        text: "Tài khoản có thể được xác minh qua email hoặc số điện thoại. Việc xác minh quyền kiểm soát email/điện thoại không chứng minh đầy đủ danh tính, độ tuổi, tình trạng hôn nhân hoặc mức độ an toàn của một người. Khi có nghi vấn về tuổi hoặc gian lận, DEEPMATCH có thể yêu cầu kiểm tra bổ sung tương xứng, hạn chế tính năng hoặc tạm dừng tài khoản trong thời gian xem xét.",
      },
      { type: "h2", id: "i-3", text: "3. Chấp thuận và quyền lựa chọn" },
      {
        type: "p",
        text: "Bạn chấp thuận Điều khoản sử dụng bằng hành động xác nhận rõ ràng. Việc đọc hoặc xác nhận đã nhận Chính sách quyền riêng tư không đồng nghĩa đồng ý mọi mục đích xử lý dữ liệu.",
      },
      {
        type: "p",
        text: "Đồng ý quảng cáo cá nhân hóa, dữ liệu nhạy cảm, quyền dùng vị trí và gửi nội dung cho AI được quản lý riêng khi cần. Bạn được biết mục đích, phạm vi và hệ quả của lựa chọn. Không dùng sự đồng ý của một người để thay thế quyền quyết định của người còn lại.",
      },
      { type: "h2", id: "i-4", text: "4. Tài khoản và tương tác" },
      {
        type: "p",
        text: "Bạn có trách nhiệm bảo vệ thông tin đăng nhập và báo cáo nghi vấn chiếm quyền. Không mua bán tài khoản, né lệnh chặn, mạo danh hoặc dùng hồ sơ giả để tạo tương tác.",
      },
      {
        type: "p",
        text: "Lượt thích, kết quả ghép đôi hoặc lời mời trò chuyện không bảo đảm quan hệ ngoài đời và không đồng nghĩa chấp thuận mọi liên hệ. Không gian cặp đôi chỉ được hình thành khi cả hai xác nhận; mỗi người có quyền ngắt kết nối.",
      },
      { type: "h2", id: "i-5", text: "5. Nội dung và sở hữu trí tuệ" },
      {
        type: "p",
        text: "Bạn giữ các quyền mình có đối với nội dung tải lên. Bạn phải có quyền sử dụng nội dung và tôn trọng quyền riêng tư, hình ảnh của người khác.",
      },
      {
        type: "p",
        text: "Bạn cho phép DEEPMATCH lưu trữ, sao lưu, định dạng, truyền tải và hiển thị nội dung trong phạm vi cần thiết để cung cấp tính năng theo lựa chọn chia sẻ. Giấy phép không độc quyền này không chuyển quyền sở hữu và không tự cho phép dùng ảnh của bạn để quảng cáo, bán nội dung riêng tư hoặc huấn luyện AI ngoài mục đích được đồng ý riêng.",
      },
      {
        type: "p",
        text: "Khi nội dung được xóa, quyền sử dụng phục vụ dịch vụ chấm dứt, trừ phần lưu có căn cứ hợp pháp. Nhãn hiệu, mã nguồn và tài sản riêng của dịch vụ thuộc các chủ thể có quyền; bạn không được sao chép hoặc khai thác trái phép.",
      },
      { type: "h2", id: "i-6", text: "6. Kiểm duyệt và kết thúc sử dụng" },
      {
        type: "p",
        text: "DEEPMATCH có thể hạn chế hiển thị, gỡ nội dung, tạm khóa hoặc chấm dứt tài khoản khi có căn cứ vi phạm, rủi ro an toàn hoặc yêu cầu hợp pháp. Biện pháp phải phù hợp mức độ; lý do và cách khiếu nại được thông báo khi pháp luật cho phép và không gây nguy hiểm cho người khác.",
      },
      {
        type: "p",
        text: "Bạn có thể ngừng sử dụng hoặc yêu cầu xóa tài khoản. Các nghĩa vụ thanh toán đã phát sinh hợp pháp, giải quyết tranh chấp và bảo vệ quyền liên quan tiếp tục trong phạm vi cần thiết.",
      },
      { type: "h2", id: "i-7", text: "7. Trách nhiệm và tranh chấp" },
      {
        type: "p",
        text: "DEEPMATCH không bảo đảm mọi hồ sơ đúng tuyệt đối, mọi gợi ý phù hợp hoặc mọi cuộc gặp an toàn. Điều này không loại bỏ trách nhiệm cung cấp dịch vụ với sự cẩn trọng hợp lý hoặc trách nhiệm bắt buộc theo pháp luật.",
      },
      {
        type: "p",
        text: "Không điều khoản nào loại trừ trách nhiệm không được phép loại trừ, hợp pháp hóa gian lận hoặc tước quyền của người tiêu dùng. Luật Việt Nam điều chỉnh phạm vi dịch vụ này, đồng thời tôn trọng quy định bắt buộc khác nếu áp dụng.",
      },
      {
        type: "p",
        text: "Bạn có thể yêu cầu hỗ trợ, thương lượng hoặc sử dụng quyền khiếu nại, khởi kiện tại cơ quan có thẩm quyền. Việc liên hệ DEEPMATCH trước không phải điều kiện bắt buộc để thực hiện quyền luật định.",
      },
    ],
  },
  {
    id: "privacy",
    path: "/legal/privacy",
    title: "Chính sách quyền riêng tư và công cụ theo dõi",
    navLabel: "Quyền riêng tư & cookies/SDK",
    sourcePart: "II",
    blocks: [
      { type: "h2", id: "ii-1", text: "1. Nguyên tắc xử lý" },
      {
        type: "p",
        text: "DEEPMATCH xử lý dữ liệu cho mục đích cụ thể, trong phạm vi cần thiết và trên căn cứ phù hợp pháp luật áp dụng. Thông tin về bên chịu trách nhiệm, đầu mối riêng tư, nhà cung cấp có liên quan và việc xử lý cụ thể phải được cung cấp cùng thông báo dịch vụ trước khi thu thập.",
      },
      {
        type: "p",
        text: "Không coi mọi thông tin bạn cung cấp là công khai. Không coi quan hệ cặp đôi là quyền truy cập toàn bộ dữ liệu của người kia. Dữ liệu nhạy cảm cần được bảo vệ và thông báo phù hợp với tính chất của nó.",
      },
      { type: "h2", id: "ii-2", text: "2. Nhóm dữ liệu và mục đích" },
      {
        type: "ul",
        items: [
          "Tài khoản: thông tin liên hệ, ngày sinh, định danh đăng nhập, trạng thái xác minh và lịch sử lựa chọn để đăng ký, kiểm tra điều kiện tuổi, bảo vệ và quản lý tài khoản.",
          "Hồ sơ: tên hiển thị, ảnh, mô tả, sở thích, tiêu chí tìm kiếm và phần bạn lựa chọn chia sẻ để khám phá và gợi ý kết nối.",
          "Tương tác: lượt thích, kết nối, tin nhắn, tệp gửi, chặn và báo cáo để cung cấp trò chuyện, kiểm soát liên hệ, phòng chống lạm dụng và giải quyết vụ việc.",
          "Cặp đôi: ghim, ảnh/video, mốc thời gian, ghi chú và nhật ký theo phạm vi riêng hoặc chung để lưu kỷ niệm và sử dụng tính năng bạn chọn.",
          "Vị trí: dữ liệu thiết bị khi bạn đang dùng tính năng tìm gần đây hoặc tạo ghim và đã cho phép. Phạm vi này không bao gồm theo dõi nền. Việc lưu một ghim địa điểm do bạn chủ động tạo khác với việc liên tục theo dõi vị trí thiết bị.",
          "AI: dữ liệu bạn lựa chọn hoặc dữ liệu thuộc phạm vi quyền được cấp để thực hiện tác vụ cụ thể, cùng đầu ra và phản hồi liên quan.",
          "Giao dịch: tên gói, mã đơn, lịch đặt, biên nhận, trạng thái thanh toán/hoàn tiền và thông tin cần để cung cấp dịch vụ. Không gửi số thẻ đầy đủ, mã bảo mật hoặc OTP qua kênh hỗ trợ.",
          "Kỹ thuật và an toàn: thông tin thiết bị, phiên, địa chỉ mạng, lỗi và sự kiện cần thiết để vận hành, phát hiện truy cập trái phép và bảo vệ dịch vụ.",
        ],
      },
      {
        type: "p",
        text: "Các trường tùy chọn và trường cần thiết được phân biệt tại nơi thu thập. Nếu một tính năng cần thêm dữ liệu, bạn phải được thông báo trước.",
      },
      { type: "h2", id: "ii-3", text: "3. Dữ liệu nhạy cảm và mục đích riêng" },
      {
        type: "p",
        text: "Thông tin hồ sơ, trò chuyện hoặc tư vấn có thể chứa dữ liệu nhạy cảm. DEEPMATCH không mặc nhiên yêu cầu bạn cung cấp thông tin về sức khỏe, đời sống tình dục hoặc các nội dung thân mật để dùng mọi tính năng.",
      },
      {
        type: "p",
        text: "Khi mục đích xử lý cần sự đồng ý, bạn được lựa chọn riêng và rút lại. Việc từ chối có thể làm tính năng phụ thuộc dữ liệu không hoạt động, nhưng không được dùng để gây bất lợi cho phần dịch vụ không liên quan. Rút đồng ý không làm mất tính hợp pháp của việc xử lý đã thực hiện trước đó.",
      },
      { type: "h2", id: "ii-4", text: "4. Ai có thể nhận dữ liệu" },
      {
        type: "p",
        text: "Người dùng khác nhận phần hồ sơ hoặc nội dung bạn chia sẻ đúng phạm vi. Người cùng cặp không có quyền mặc định với nhật ký riêng.",
      },
      {
        type: "p",
        text: "Nhà cung cấp kỹ thuật có thể xử lý dữ liệu cần thiết cho lưu trữ, xác thực, bản đồ, thông báo, thanh toán, AI hoặc các chức năng được cung cấp. Thông tin bên nhận, vai trò, mục đích và nơi xử lý liên quan phải được thông báo trước khi áp dụng.",
      },
      {
        type: "p",
        text: "Đối tác tư vấn, trị liệu hoặc đồng hành chỉ được nhận thông tin cần cho dịch vụ đặt cụ thể. Không tự động cung cấp lịch sử hẹn hò, toàn bộ chat hoặc nhật ký cho đối tác.",
      },
      {
        type: "p",
        text: "Dữ liệu có thể được cung cấp khi có nghĩa vụ pháp lý hợp lệ; phạm vi yêu cầu được xem xét và giới hạn phù hợp. Chuyển giao hoạt động kinh doanh không cho phép bỏ qua nghĩa vụ bảo vệ và thông báo về dữ liệu.",
      },
      { type: "h2", id: "ii-5", text: "5. AI, vị trí và quảng cáo" },
      {
        type: "p",
        text: "AI tuân theo Chính sách trợ lý AI. Nội dung chung chỉ thuộc phạm vi AI khi cả hai đã cho phép; nhật ký riêng không trở thành nội dung chung chỉ vì đang ghép cặp.",
      },
      {
        type: "p",
        text: "Quyền vị trí có thể được điều chỉnh trên thiết bị. Vị trí chính xác không mặc nhiên được công khai cho người lạ; việc hiển thị địa điểm/ghim phụ thuộc lựa chọn chia sẻ.",
      },
      {
        type: "p",
        text: "Quảng cáo cá nhân hóa chỉ dựa trên nhóm sở thích bạn chủ động khai và đồng ý riêng cho quảng cáo. DEEPMATCH không dùng nội dung chat, nhật ký, dữ liệu trị liệu, xu hướng tính dục hoặc vị trí chính xác để nhắm quảng cáo. Từ chối cá nhân hóa không đồng nghĩa không còn quảng cáo; quảng cáo chung có thể được hiển thị.",
      },
      { type: "h2", id: "ii-6", text: "6. Cookies và SDK" },
      {
        type: "p",
        text: "Công cụ thiết yếu phục vụ đăng nhập, bảo mật và chức năng được yêu cầu. Công cụ đo lường hoặc quảng cáo tùy chọn phải được phân biệt và chỉ hoạt động khi có căn cứ phù hợp; nơi cần đồng ý, không kích hoạt trước lựa chọn.",
      },
      {
        type: "p",
        text: "Danh mục công cụ áp dụng phải giải thích tên/đơn vị, mục đích, dữ liệu, thời hạn và cách quản lý lựa chọn. Quy tắc bao gồm cookie, lưu trữ trình duyệt, pixel và SDK di động. Bạn có thể thay đổi lựa chọn; việc rút đồng ý phải ngăn việc sử dụng tùy chọn tiếp theo.",
      },
      { type: "h2", id: "ii-7", text: "7. Nơi xử lý và thời gian lưu" },
      {
        type: "p",
        text: "Nếu dữ liệu được xử lý ở nước ngoài, DEEPMATCH phải thông báo nơi xử lý, người nhận và biện pháp bảo đảm liên quan, đồng thời thực hiện các yêu cầu chuyển dữ liệu áp dụng. Việc bạn sử dụng dịch vụ không tự thay thế các yêu cầu đó.",
      },
      {
        type: "p",
        text: "Dữ liệu tài khoản được giữ trong thời gian cần để duy trì tài khoản và thực hiện mục đích đã thông báo. Nội dung được lưu theo tính năng, lựa chọn xóa và quyền của người liên quan. Log an toàn, hồ sơ vụ việc và chứng từ giao dịch chỉ được giữ trong thời gian cần cho mục đích hợp pháp tương ứng.",
      },
      {
        type: "p",
        text: "Khi mục đích chấm dứt, dữ liệu được xóa hoặc ẩn danh thực sự, trừ phần cần giữ theo nghĩa vụ pháp lý hoặc căn cứ hợp lệ khác. Với dữ liệu được giữ lại, bạn được thông báo loại dữ liệu, mục đích và thời hạn hoặc tiêu chí xác định thời hạn. Bản sao lưu không được dùng để đưa tài khoản đã xóa trở lại hoạt động.",
      },
      {
        type: "p",
        text: "Thông tin thời hạn áp dụng cho từng tính năng và bên nhận phải được cung cấp trước xử lý; không dùng quy tắc chung này để giữ dữ liệu vô thời hạn.",
      },
      { type: "h2", id: "ii-8", text: "8. Quyền và bảo vệ dữ liệu" },
      {
        type: "p",
        text: "Bạn có thể yêu cầu biết, truy cập, sửa, xóa, rút đồng ý, hạn chế hoặc phản đối xử lý và thực hiện quyền khác theo pháp luật áp dụng. Xác minh yêu cầu phải tương xứng, ưu tiên kênh đã có. Không yêu cầu bạn biết tên điều luật.",
      },
      {
        type: "p",
        text: "Bản xuất dữ liệu phải bảo vệ người khác; có thể cần che hoặc loại trừ nội dung không thuộc quyền nhận của bạn. Nếu yêu cầu bị giới hạn, bạn được giải thích căn cứ và cách khiếu nại.",
      },
      {
        type: "p",
        text: "DEEPMATCH có trách nhiệm áp dụng biện pháp phù hợp để giới hạn truy cập và bảo vệ dữ liệu. Không cam kết rủi ro bằng không hoặc mã hóa đầu cuối cho mọi nội dung. Sự cố thuộc diện thông báo được xử lý và thông báo theo pháp luật.",
      },
      { type: "h2", id: "ii-9", text: "9. Gợi ý ghép đôi" },
      {
        type: "p",
        text: "Gợi ý hỗ trợ lựa chọn, không quyết định thay bạn. Thông tin giải thích phải phản ánh tín hiệu thực tế được dùng; không tuyên bố tỷ lệ tình yêu được bảo đảm hoặc suy luận thuộc tính nhạy cảm từ ảnh.",
      },
      {
        type: "p",
        text: "Bạn có thể điều chỉnh lựa chọn, dừng khám phá và từ chối kết nối. Quyết định hạn chế tài khoản có kênh yêu cầu xem xét; không coi đầu ra tự động là bằng chứng tuyệt đối.",
      },
    ],
  },
  {
    id: "community",
    path: "/legal/community",
    title: "Quy tắc cộng đồng",
    navLabel: "Quy tắc cộng đồng",
    sourcePart: "III",
    blocks: [
      { type: "h2", id: "iii-1", text: "1. Tôn trọng và đồng thuận" },
      {
        type: "p",
        text: "Tôn trọng lời từ chối, việc chặn và ngắt cặp. Không tạo tài khoản khác để tiếp cận người đã từ chối. Không đe dọa, xúc phạm, theo dõi, tống tiền, công khai địa chỉ hoặc dữ liệu riêng.",
      },
      {
        type: "p",
        text: "Không đăng hình ảnh thân mật khi chưa có quyền và sự đồng ý cần thiết. Việc từng có quan hệ hoặc từng nhận ảnh không cho phép phát tán ảnh đó.",
      },
      { type: "h2", id: "iii-2", text: "2. Hành vi bị cấm" },
      {
        type: "p",
        text: "Cấm mạo danh, ảnh đánh cắp, tài khoản giả, lừa đảo tình cảm/đầu tư, spam, yêu cầu OTP, thao túng tương tác, thu thập hồ sơ hàng loạt và truy cập trái phép.",
      },
      {
        type: "p",
        text: "Cấm mua bán người, bóc lột, dịch vụ tình dục trả tiền, nội dung khiêu dâm, ảnh tình dục không đồng thuận, kích động thù hận/bạo lực và hành vi vi phạm pháp luật. Các quy tắc áp dụng cho hồ sơ, chat, media, ghim và nội dung AI.",
      },
      { type: "h2", id: "iii-4", text: "4. Báo cáo, chặn và khiếu nại" },
      {
        type: "p",
        text: "Bạn có thể sử dụng công cụ báo cáo, chặn hoặc kênh hỗ trợ được công bố. Chặn không phụ thuộc việc báo cáo đã được giải quyết. Báo cáo được xem xét theo tính khẩn cấp, dữ liệu và ngữ cảnh; không công khai tùy tiện danh tính người báo cáo.",
      },
      {
        type: "p",
        text: "Bạn có thể yêu cầu xem xét lại quyết định, cung cấp mã vụ việc và lý do. Quy trình phải có xem xét phù hợp của con người. Biện pháp bảo vệ khẩn cấp có thể được áp dụng trong khi kiểm tra.",
      },
      { type: "h2", id: "iii-5", text: "5. An toàn ngoài đời" },
      {
        type: "p",
        text: "Cân nhắc gặp nơi công cộng, chủ động phương tiện và thông báo người tin cậy. Không gửi tiền hoặc thông tin đăng nhập cho người mới quen.",
      },
      {
        type: "p",
        text: "Nếu nguy hiểm tức thời, liên hệ cơ quan khẩn cấp tại nơi bạn đang ở. Công cụ báo cáo của DEEPMATCH không thay cơ quan khẩn cấp. Các khuyến nghị này không chuyển trách nhiệm gây hại sang nạn nhân.",
      },
      {
        type: "p",
        text: "Tiêu chuẩn bảo vệ trẻ em được nêu riêng tại trang Bảo vệ trẻ em.",
      },
    ],
  },
  {
    id: "child-safety",
    path: "/legal/child-safety",
    title: "Tiêu chuẩn bảo vệ trẻ em",
    navLabel: "Bảo vệ trẻ em",
    sourcePart: "III.3",
    blocks: [
      { type: "h2", id: "iii-3", text: "3. Tiêu chuẩn an toàn trẻ em" },
      {
        type: "p",
        text: "DEEPMATCH nghiêm cấm xâm hại và bóc lột tình dục trẻ em (CSAE), nội dung xâm hại tình dục trẻ em (CSAM), dụ dỗ tình dục trẻ em, tống tiền tình dục và hành vi hỗ trợ các hoạt động này, kể cả nội dung tổng hợp bất hợp pháp.",
      },
      {
        type: "p",
        text: "Tài khoản nghi chưa đủ tuổi có thể bị hạn chế để xác minh. Nội dung vi phạm được hạn chế/gỡ bỏ và vụ việc được chuyển xử lý phù hợp; báo cáo tới NCMEC hoặc cơ quan có thẩm quyền tại khu vực được thực hiện khi nghĩa vụ pháp luật áp dụng.",
      },
      {
        type: "p",
        text: "Khi báo cáo, cung cấp mã nội dung hoặc vị trí trong dịch vụ và ngữ cảnh cần thiết; không tải xuống hoặc chuyển tiếp nội dung xâm hại. Kênh hỗ trợ chung tiếp nhận và chuyển vụ việc tới người phụ trách an toàn trẻ em.",
      },
    ],
  },
  {
    id: "couple-data",
    path: "/legal/couple-data",
    title: "Chính sách dữ liệu cặp đôi",
    navLabel: "Dữ liệu cặp đôi",
    sourcePart: "IV",
    blocks: [
      { type: "h2", id: "iv-1", text: "1. Nội dung riêng và chung" },
      {
        type: "p",
        text: "Nhật ký riêng chỉ thuộc phạm vi cá nhân. Ảnh, ghim và kỷ niệm chỉ được chia sẻ theo lựa chọn hiển thị. Kết nối cặp đôi không cấp quyền sở hữu nội dung của người kia.",
      },
      {
        type: "p",
        text: "Người tạo giữ quyền đối với phần mình có quyền; người xuất hiện trong nội dung vẫn có quyền riêng tư liên quan. Nội dung chung không đồng nghĩa một người được tự công khai, bán hoặc đưa vào AI không giới hạn.",
      },
      { type: "h2", id: "iv-2", text: "2. Quyền AI với nội dung chung" },
      {
        type: "p",
        text: "Cả hai phải chủ động bật quyền cho phạm vi cụ thể trước khi AI dùng nội dung chung. Mỗi người được xem phạm vi đã cấp và rút lại. Thay đổi mục đích hoặc mở rộng phạm vi cần lựa chọn mới phù hợp.",
      },
      {
        type: "p",
        text: "Khi một người rút quyền, tác vụ mới và tác vụ chưa gửi dữ liệu phụ thuộc quyền đó phải dừng. Dữ liệu đã gửi và đầu ra liên quan được xử lý theo chính sách xóa, quyền của các chủ thể và thông tin về nhà cung cấp; không hứa có thể thu hồi mọi bản sao ngoài quyền kiểm soát.",
      },
      { type: "h2", id: "iv-3", text: "3. Ngắt cặp" },
      {
        type: "p",
        text: "Mỗi người có thể ngắt cặp mà không cần bên kia chấp thuận. Ngắt cặp đóng quyền truy cập chung; dữ liệu quan hệ cũ không tự chuyển sang cặp mới.",
      },
      {
        type: "p",
        text: "Yêu cầu giữ/xóa từng nội dung được xem xét riêng theo quyền, sự đồng ý và nghĩa vụ áp dụng. Ngắt cặp không tự động chuyển quyền sở hữu cho một bên hoặc cho phép tải toàn bộ dữ liệu của bên kia.",
      },
      { type: "h2", id: "iv-4", text: "4. Tranh chấp, xuất và xóa" },
      {
        type: "p",
        text: "Người có dữ liệu trong ảnh/nội dung có thể yêu cầu xem xét dù không phải người tải lên. Nội dung tranh chấp có thể bị hạn chế hiển thị trong thời gian xử lý.",
      },
      {
        type: "p",
        text: "Bản xuất chỉ bao gồm thông tin người yêu cầu có quyền nhận. Dữ liệu cần giữ làm chứng cứ phải giới hạn truy cập và có căn cứ/thời hạn. Không giữ toàn bộ nội dung chung vô thời hạn chỉ vì một người muốn giữ.",
      },
      {
        type: "p",
        text: "Bản sao người khác đã tải ngoài hệ thống không thể được bảo đảm thu hồi, nhưng không được phép dùng để quấy rối hoặc công bố trái phép.",
      },
    ],
  },
  {
    id: "subscriptions",
    path: "/legal/subscriptions",
    title: "Thuê bao, thanh toán và hoàn tiền",
    navLabel: "Thuê bao & hoàn tiền",
    sourcePart: "V",
    blocks: [
      { type: "h2", id: "v-1", text: "1. Quyền lợi và giá" },
      {
        type: "p",
        text: "Gói trả phí có thể gồm tính năng hẹn hò nâng cao hoặc gói thành viên kết hợp; quyền lợi cụ thể, giới hạn, giá, tiền tệ, thuế/phí và tổng tiền được thể hiện trước thanh toán. Không mặc định mọi tính năng AI hoặc cặp đôi đều nằm trong gói.",
      },
      {
        type: "p",
        text: "Bạn chỉ thanh toán sau khi được cung cấp đầy đủ điều kiện. Không áp dụng mức phí không được công bố trước hoặc quảng cáo quyền lợi chưa được cung cấp.",
      },
      { type: "h2", id: "v-2", text: "2. Gia hạn tháng/năm" },
      {
        type: "p",
        text: "Thuê bao tự gia hạn theo chu kỳ tháng hoặc năm được lựa chọn, trừ khi bạn hủy theo điều kiện của kênh mua. Màn hình mua phải nêu chu kỳ, giá, thời điểm thu/gia hạn và cách hủy.",
      },
      {
        type: "p",
        text: "Nếu có dùng thử, thời lượng, giá sau dùng thử và hạn hủy phải rõ trước khi bắt đầu. Thay đổi giá hoặc quyền lợi thực hiện theo quy định của kênh thanh toán và luật áp dụng, với thông báo/chấp thuận cần thiết.",
      },
      { type: "h2", id: "v-3", text: "3. Hủy thuê bao" },
      {
        type: "p",
        text: "Quản lý thuê bao tại kênh đã mua. Hủy gia hạn ngăn lần gia hạn tiếp theo theo điều kiện kênh đó; thời điểm kết thúc quyền lợi được thể hiện khi hủy.",
      },
      {
        type: "p",
        text: "Gỡ ứng dụng không hủy thuê bao. Xóa tài khoản không tự hủy thuê bao do cửa hàng quản lý. Luồng xóa phải hướng dẫn quản lý thuê bao và vẫn cho phép yêu cầu xóa.",
      },
      { type: "h2", id: "v-4", text: "4. Hoàn tiền" },
      {
        type: "p",
        text: "Giao dịch qua cửa hàng ứng dụng sử dụng cơ chế hoàn tiền của cửa hàng, cùng quyền bắt buộc theo luật; DEEPMATCH hỗ trợ kiểm tra giao dịch và quyền lợi. Không bảo đảm thay quyết định của cửa hàng.",
      },
      {
        type: "p",
        text: "Giao dịch trực tiếp được xem xét khi thu trùng, không cung cấp quyền lợi, sai mô tả hoặc có căn cứ hoàn khác. Người dùng cung cấp mã giao dịch và lý do; không gửi số thẻ đầy đủ hoặc OTP.",
      },
      {
        type: "p",
        text: "Không áp dụng tuyên bố “không hoàn trong mọi trường hợp”. Quyền khiếu nại giao dịch và quyền bắt buộc được bảo lưu. Hủy/hoàn lịch dịch vụ con người áp dụng thêm Điều kiện tư vấn, đồng hành và đối tác.",
      },
    ],
  },
  {
    id: "ai",
    path: "/legal/ai",
    title: "Chính sách trợ lý AI",
    navLabel: "Trợ lý AI",
    sourcePart: "VI",
    blocks: [
      { type: "h2", id: "vi-1", text: "1. Nhận diện và giới hạn" },
      {
        type: "p",
        text: "Khi dùng AI, bạn phải được nhận diện rõ đang tương tác với công cụ tự động. AI hỗ trợ hồ sơ, gợi ý phản hồi, kế hoạch hoặc nội dung kỷ niệm theo tính năng được cung cấp.",
      },
      {
        type: "p",
        text: "Đầu ra có thể sai, thiếu ngữ cảnh hoặc không phù hợp. AI không phải người trị liệu, không chẩn đoán, không thay tư vấn chuyên môn và không bảo đảm kết quả tình cảm. Bạn cần xem lại trước khi sử dụng.",
      },
      { type: "h2", id: "vi-2", text: "2. Dữ liệu và quyền kiểm soát" },
      {
        type: "p",
        text: "AI chỉ dùng dữ liệu bạn chọn hoặc phạm vi đã được cho phép rõ ràng. Chat và kỷ niệm chung áp dụng quyền của cả hai theo Chính sách dữ liệu cặp đôi; không tự dùng nhật ký riêng của người kia.",
      },
      {
        type: "p",
        text: "Trước gửi dữ liệu, thông báo phải nêu dữ liệu, mục đích, bên nhận, nơi xử lý, thời hạn và việc sử dụng cho huấn luyện nếu có. Việc dùng tính năng AI không đồng nghĩa cho phép dùng nội dung cho mọi hoạt động huấn luyện.",
      },
      {
        type: "p",
        text: "Bạn được rút quyền cho tác vụ tùy chọn. Không tự gửi tin nhắn, công bố ảnh, tạo quan hệ hoặc đặt dịch vụ thay bạn khi chưa có xác nhận.",
      },
      { type: "h2", id: "vi-3", text: "3. Sử dụng có trách nhiệm" },
      {
        type: "p",
        text: "Cấm dùng AI để mạo danh, tạo bằng chứng giả, lừa đảo, xâm hại trẻ em hoặc tạo nội dung tình dục không đồng thuận. Không suy luận thuộc tính nhạy cảm từ hình ảnh để phân loại con người.",
      },
      {
        type: "p",
        text: "Đầu ra không được bảo đảm độc quyền hoặc không xâm phạm quyền bên thứ ba. Khi dùng hình ảnh/nội dung về người khác, bạn vẫn phải có quyền phù hợp. Bạn có thể báo cáo kết quả gây hại hoặc yêu cầu xem xét.",
      },
    ],
  },
  {
    id: "services",
    path: "/legal/services",
    title: "Điều kiện tư vấn, đồng hành và đối tác",
    navLabel: "Tư vấn & đối tác",
    sourcePart: "VII",
    blocks: [
      { type: "h2", id: "vii-1", text: "1. Hai hình thức dịch vụ" },
      {
        type: "p",
        text: "Với quà tặng/hàng hóa, nhà hàng, trải nghiệm và du lịch được giới thiệu: bạn chuyển sang đối tác để giao kết và thanh toán trực tiếp. Điều kiện của đối tác phải được xem trước giao dịch; DEEPMATCH vẫn chịu trách nhiệm đối với thông tin và hoạt động thuộc phạm vi mình thực hiện.",
      },
      {
        type: "p",
        text: "Với tư vấn, trị liệu hoặc đồng hành được đặt qua DEEPMATCH: DEEPMATCH tiếp nhận đặt lịch, thu tiền sau xác nhận của đối tác và thanh toán cho đối tác. Trước đặt, bạn phải được biết bên thực hiện, vai trò mỗi bên, nội dung, giá và cơ chế xử lý sự cố.",
      },
      { type: "h2", id: "vii-2", text: "2. Phân biệt chuyên môn" },
      {
        type: "p",
        text: "Hướng dẫn hồ sơ, giao tiếp và lắng nghe hỗ trợ không được trình bày như chẩn đoán hoặc điều trị. Dịch vụ tư vấn chuyên môn/trị liệu chỉ được cung cấp trong phạm vi mà người hoặc đơn vị thực hiện có đủ điều kiện.",
      },
      {
        type: "p",
        text: "Tên người/đơn vị cung cấp, chuyên môn phù hợp, giới hạn dịch vụ và hình thức thực hiện phải được thể hiện trước khi đặt. DEEPMATCH không bảo đảm kết quả điều trị hoặc kết quả hẹn hò.",
      },
      { type: "h2", id: "vii-3", text: "3. Đồng hành và bảo vệ" },
      {
        type: "p",
        text: "Đồng hành có thể gồm hỗ trợ giao tiếp, tham gia sự kiện, đi cùng tại địa điểm công cộng hoặc điều phối buổi hẹn theo gói đã công bố.",
      },
      {
        type: "p",
        text: "Bảo vệ chuyên nghiệp là dịch vụ riêng do đối tác thực hiện, không mặc nhiên bao gồm trong mọi gói đồng hành. Phạm vi, người cung cấp, thời gian, địa bàn, điều kiện và đầu mối xử lý sự cố phải rõ trước khi đặt. Không được hiểu là bảo đảm an toàn tuyệt đối hoặc thay cơ quan khẩn cấp.",
      },
      { type: "h2", id: "vii-4", text: "4. Xác nhận và thu tiền" },
      {
        type: "p",
        text: "Yêu cầu gửi đi chưa phải lịch được xác nhận. Sau khi đối tác xác nhận và bạn nhận đủ thông tin, DEEPMATCH thu toàn bộ phí trước thực hiện. Xác nhận giao dịch phải nêu mã đặt, người cung cấp, thời gian, phạm vi, tổng tiền và điều kiện hủy.",
      },
      {
        type: "p",
        text: "Không thay người cung cấp, thời gian hoặc nội dung quan trọng mà không thông báo và có lựa chọn phù hợp cho bạn.",
      },
      { type: "h2", id: "vii-5", text: "5. Hủy, đổi và hoàn" },
      {
        type: "p",
        text: "Bạn được hủy miễn phí trước mốc được thông báo cho dịch vụ. Sau mốc đó, chỉ áp dụng phí hủy đã công bố rõ và được chấp thuận trước thanh toán, trong phạm vi pháp luật cho phép. Mỗi dịch vụ có thể có mốc khác nhau; mốc và mức phí là phần bắt buộc của xác nhận đặt.",
      },
      {
        type: "p",
        text: "Nếu phí hủy không được thông báo trước, không được tự bổ sung hồi tố. Khi đối tác hủy hoặc không cung cấp, bạn có thể lựa chọn lịch thay thế hoặc yêu cầu hoàn phần chưa được cung cấp; không bị ép nhận phiếu sử dụng thay hoàn tiền.",
      },
      {
        type: "p",
        text: "Với dịch vụ thực hiện một phần, sai mô tả, khách không đến hoặc bất khả kháng, xem xét chứng cứ và điều kiện đã chấp thuận, cùng quyền luật định. Không áp dụng miễn trách nhiệm toàn bộ chỉ vì có sự kiện ngoài ý muốn.",
      },
      {
        type: "p",
        text: "Kết quả yêu cầu hoàn phải nêu số tiền, căn cứ khấu trừ nếu có, phương thức và thời gian dự kiến. Thời gian ghi có có thể phụ thuộc kênh thanh toán và phải được giải thích.",
      },
      { type: "h2", id: "vii-6", text: "6. Dữ liệu và khiếu nại đối tác" },
      {
        type: "p",
        text: "Chỉ chuyển dữ liệu cần cho lịch đã đặt và đã được thông báo. Không tự dùng hồ sơ trị liệu cho ghép đôi, AI hoặc quảng cáo.",
      },
      {
        type: "p",
        text: "Kênh hỗ trợ chung tiếp nhận và phối hợp phân định lỗi, giải pháp và trách nhiệm; không yêu cầu khách tự giải quyết mọi vấn đề chỉ vì có đối tác tham gia. Quyền bắt buộc không bị giảm bởi thỏa thuận nội bộ giữa DEEPMATCH và đối tác.",
      },
    ],
  },
  {
    id: "delete-account",
    path: "/legal/delete-account",
    title: "Xóa tài khoản",
    navLabel: "Xóa tài khoản",
    sourcePart: "VIII.1",
    blocks: [
      { type: "h2", id: "viii-1", text: "1. Yêu cầu xóa" },
      {
        type: "p",
        text: "DEEPMATCH phải cung cấp cách yêu cầu xóa trong ứng dụng và qua kênh trực tuyến ngoài ứng dụng. Bạn được xác minh ở mức cần thiết, xem phạm vi xóa và nhận xác nhận. Việc chỉ tạm khóa hoặc ẩn hồ sơ không thay thế xóa tài khoản.",
      },
      {
        type: "p",
        text: "Xóa bao gồm dữ liệu liên quan trong phạm vi trách nhiệm của DEEPMATCH, trừ phần cần giữ có căn cứ. Thông báo phải nêu ngoại lệ, lý do và thời hạn/tiêu chí lưu. Yêu cầu đối với nội dung chung được xử lý theo quyền mỗi người, không giữ lại mặc nhiên toàn bộ.",
      },
      {
        type: "p",
        text: "Gỡ ứng dụng không hủy thuê bao. Xóa tài khoản không tự hủy thuê bao do cửa hàng ứng dụng quản lý. Hãy quản lý hoặc hủy thuê bao tại kênh đã mua trước hoặc song song với yêu cầu xóa.",
      },
      {
        type: "p",
        text: "Trên web: đăng nhập rồi mở trang yêu cầu xóa tài khoản, gõ DELETE để xác nhận. Trên app: Me → Xóa tài khoản (hoặc mở trang web tương ứng).",
      },
    ],
  },
  {
    id: "support",
    path: "/support",
    title: "Hỗ trợ và khiếu nại",
    navLabel: "Hỗ trợ & khiếu nại",
    sourcePart: "VIII.2–4",
    blocks: [
      { type: "h2", id: "viii-2", text: "2. Hỗ trợ chung" },
      {
        type: "p",
        text: "DEEPMATCH sử dụng một kênh hỗ trợ chung và phân loại nội bộ tới bộ phận phù hợp: tài khoản, thanh toán, quyền riêng tư, nội dung và an toàn trẻ em.",
      },
      {
        type: "p",
        text: "Đội ngũ tiếp nhận có người trực 24/7. Việc có người trực không phải cam kết mọi vụ việc được giải quyết ngay hoặc có lực lượng đến hiện trường. Mức khẩn cấp và thời gian xử lý được thông báo theo từng yêu cầu.",
      },
      {
        type: "p",
        text: "Thông tin liên hệ và cơ chế gửi yêu cầu phải được công bố rõ tại điểm truy cập hỗ trợ. Nếu không thể đăng nhập, bạn vẫn phải có cách liên hệ ngoài tài khoản.",
      },
      { type: "h2", id: "viii-3", text: "3. Nội dung yêu cầu" },
      {
        type: "p",
        text: "Cung cấp mô tả, mã tài khoản/giao dịch/vụ việc khi có và phương thức phản hồi. Chỉ cung cấp bằng chứng cần thiết, không gửi mật khẩu, OTP hoặc thông tin tài chính đầy đủ.",
      },
      {
        type: "p",
        text: "Yêu cầu được ghi nhận, phân loại và phản hồi về tiến trình/kết quả. Việc cần thêm thông tin phải tương xứng. Khi từ chối hoặc giới hạn, nêu lý do và cách đề nghị xem xét lại trong phạm vi được phép.",
      },
      { type: "h2", id: "viii-4", text: "4. Cập nhật chính sách" },
      {
        type: "p",
        text: "Thay đổi quan trọng được thông báo trước khi áp dụng khi cần; xử lý mới đòi hỏi đồng ý thì phải lấy lựa chọn phù hợp. Lưu phiên bản để tra cứu; không dùng “tiếp tục sử dụng” thay mọi loại đồng ý.",
      },
      {
        type: "p",
        text: "Nếu một điều khoản không có hiệu lực, các phần còn lại tiếp tục trong phạm vi có thể thực hiện hợp pháp. Mọi phần của bộ chính sách được hiểu theo hướng bảo lưu quyền bắt buộc của người dùng.",
      },
    ],
  },
];
