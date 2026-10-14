/** Voluntary DeepMind questionnaire — non-clinical (EXT-008). */

export type DeepMindQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export const DEEPMIND_QUESTIONS: DeepMindQuestion[] = [
  {
    id: "values",
    prompt: "Giá trị nào quan trọng nhất với bạn trong mối quan hệ?",
    options: [
      "Tôn trọng & trung thực",
      "Không gian riêng",
      "Đồng hành phát triển",
      "Ổn định & an toàn cảm xúc",
    ],
  },
  {
    id: "pace",
    prompt: "Nhịp độ tìm hiểu bạn thấy thoải mái?",
    options: [
      "Chậm, sâu từng bước",
      "Vừa phải, đều đặn",
      "Nhanh nhưng rõ ràng",
      "Tùy người / tùy giai",
    ],
  },
  {
    id: "communication",
    prompt: "Cách giao tiếp bạn thích?",
    options: [
      "Trò chuyện trực tiếp",
      "Nhắn tin trước, gặp sau",
      "Ít nhưng chất lượng",
      "Linh hoạt theo ngữ cảnh",
    ],
  },
  {
    id: "expectation",
    prompt: "Bạn đang hướng tới điều gì?",
    options: [
      "Kết nối nghiêm túc dài hạn",
      "Làm quen & xem hợp không",
      "Bạn đồng hành trước",
      "Chưa chắc — đang khám phá",
    ],
  },
  {
    id: "boundary",
    prompt: "Ranh giới quan trọng với bạn?",
    options: [
      "Không thúc ép tiền bạc",
      "Không chia sẻ ảnh nhạy cảm",
      "Tôn trọng lịch làm việc",
      "Không đọc tin nhắn riêng",
    ],
  },
  {
    id: "date_style",
    prompt: "Buổi hẹn đầu bạn thích kiểu nào?",
    options: [
      "Café ban ngày",
      "Đi bộ / công viên",
      "Ăn nhẹ buổi tối",
      "Hoạt động ngắn (triển lãm…)",
    ],
  },
];

export const DEEPMIND_DISCLAIMER =
  "DeepMind chỉ hỗ trợ tự phản ánh. Không phải chẩn đoán tâm lý, EQ hay bệnh lý. Bạn có thể sửa/xóa câu trả lời bất cứ lúc nào.";
