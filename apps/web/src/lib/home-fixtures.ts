/** Home dashboard content cards (curated suggestions & activity). */

export type HomeSuggest = {
  id: string;
  name: string;
  age: number;
  city: string;
  distanceKm: number;
  matchPct: number;
  interests: string[];
  bio: string;
  photo: string;
};

export type HomeActivity = {
  id: string;
  text: string;
  time: string;
  avatar: string;
};

export type HomeMapCard = {
  id: string;
  title: string;
  photo: string;
  href: string;
};

export type HomeArticle = {
  id: string;
  title: string;
  photo: string;
  href: string;
};

export const HOME_SUGGESTS: HomeSuggest[] = [
  {
    id: "fx-minh-hoang",
    name: "Minh Hoàng",
    age: 28,
    city: "TP. Hồ Chí Minh",
    distanceKm: 3,
    matchPct: 92,
    interests: ["Du lịch", "Ẩm thực", "Điện ảnh"],
    bio: "Thích những buổi tối yên tĩnh và những chuyến đi bất chợt.",
    photo: "/fixtures/home/suggest-1.jpg",
  },
  {
    id: "fx-lan-anh",
    name: "Lan Anh",
    age: 26,
    city: "Hà Nội",
    distanceKm: 5,
    matchPct: 88,
    interests: ["Đọc sách", "Cà phê", "Nhiếp ảnh"],
    bio: "Tin vào kết nối chân thành và những cuộc trò chuyện sâu.",
    photo: "/fixtures/home/suggest-2.jpg",
  },
  {
    id: "fx-khoa-nam",
    name: "Khoa Nam",
    age: 30,
    city: "Đà Nẵng",
    distanceKm: 12,
    matchPct: 85,
    interests: ["Thể thao", "Âm nhạc", "Nấu ăn"],
    bio: "Muốn tìm người cùng viết những chương đời nhẹ nhàng.",
    photo: "/fixtures/home/suggest-3.jpg",
  },
];

export const HOME_ACTIVITY: HomeActivity[] = [
  {
    id: "a1",
    text: "Minh Hoàng đã thích hồ sơ của bạn",
    time: "2 giờ trước",
    avatar: "/fixtures/home/suggest-1.jpg",
  },
  {
    id: "a2",
    text: "Lan Anh đã gửi lời chào",
    time: "5 giờ trước",
    avatar: "/fixtures/home/suggest-2.jpg",
  },
  {
    id: "a3",
    text: "Có 3 gợi ý mới hôm nay",
    time: "Hôm nay",
    avatar: "/fixtures/home/avatar-1.jpg",
  },
  {
    id: "a4",
    text: "Bạn đã hoàn thiện thêm hồ sơ",
    time: "Hôm qua",
    avatar: "/fixtures/home/avatar-3.jpg",
  },
];

export const HOME_MAP_CARDS: HomeMapCard[] = [
  {
    id: "m1",
    title: "Địa điểm hẹn hò lãng mạn",
    photo: "/fixtures/home/map-1.jpg",
    href: "/places/map",
  },
  {
    id: "m2",
    title: "Trải nghiệm ẩm thực cao cấp",
    photo: "/fixtures/home/map-2.jpg",
    href: "/places/top",
  },
  {
    id: "m3",
    title: "Kỷ niệm ngoài trời",
    photo: "/fixtures/home/map-3.jpg",
    href: "/couple/map",
  },
  {
    id: "m4",
    title: "Hành trình cuối tuần",
    photo: "/fixtures/home/map-4.jpg",
    href: "/places/map",
  },
];

export const HOME_ARTICLES: HomeArticle[] = [
  {
    id: "art1",
    title: "Làm thế nào để nhận biết một mối quan hệ lành mạnh?",
    photo: "/fixtures/home/article-1.jpg",
    href: "/ai",
  },
  {
    id: "art2",
    title: "Nghệ thuật lắng nghe trong kết nối sâu",
    photo: "/fixtures/home/article-2.jpg",
    href: "/ai",
  },
  {
    id: "art3",
    title: "Khi nào nên mở không gian Sánh đôi?",
    photo: "/fixtures/home/article-3.jpg",
    href: "/couple/invite",
  },
];

export const HOME_JOURNEY_STEPS = [
  "Hoàn thiện hồ sơ",
  "Khám phá phù hợp",
  "Kết nối chân thành",
  "Trò chuyện sâu hơn",
  "Sánh đôi bền vững",
] as const;

export const HOME_CONCIERGE_PROMPTS = [
  "Gợi ý người phù hợp với tôi",
  "Cách bắt chuyện ấn tượng",
  "Địa điểm hẹn hò thú vị ở Hà Nội",
  "Lời khuyên về mối quan hệ",
] as const;

export const HOME_STAT_AVATARS = [
  "/fixtures/home/avatar-1.jpg",
  "/fixtures/home/avatar-2.jpg",
  "/fixtures/home/avatar-3.jpg",
];
