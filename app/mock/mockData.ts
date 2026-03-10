// Mock 모드 플래그 — true면 Supabase/API 완전 우회
export const MOCK_MODE = true;

// Mock 사용자 ID (로그인된 사용자로 가정)
export const MOCK_USER_ID = "mock-user-00000001";

export const MOCK_SESSION = {
  user: {
    id: MOCK_USER_ID,
    email: "traveler@example.com",
    user_metadata: { name: "지도여행자" },
    created_at: "2024-03-01T00:00:00.000Z",
  },
};

export const MOCK_PHOTOS = [
  {
    id: 1,
    uuid: MOCK_USER_ID,
    latitude: 37.5665,
    longitude: 126.978,
    photo_url:
      "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&q=80",
    description: "서울 광화문 광장 — 봄날의 나들이",
    date: "2025-04-10",
    shared: true,
    created_at: "2025-04-10T10:00:00.000Z",
    tags: ["봄", "나들이", "광화문"],
    mood: "happy",
  },
  {
    id: 2,
    uuid: MOCK_USER_ID,
    latitude: 37.5796,
    longitude: 126.9770,
    photo_url:
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80",
    description: "경복궁 — 단풍이 물들던 그날",
    date: "2024-11-03",
    shared: true,
    created_at: "2024-11-03T14:00:00.000Z",
    tags: ["가을", "단풍", "궁궐"],
    mood: "nostalgic",
  },
  {
    id: 3,
    uuid: MOCK_USER_ID,
    latitude: 37.5512,
    longitude: 126.9882,
    photo_url:
      "https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=400&q=80",
    description: "남산타워 야경 — 도시의 불빛",
    date: "2025-01-15",
    shared: false,
    created_at: "2025-01-15T20:00:00.000Z",
    tags: ["야경", "남산", "도시"],
    mood: "calm",
  },
  {
    id: 4,
    uuid: MOCK_USER_ID,
    latitude: 37.5172,
    longitude: 127.0473,
    photo_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
    description: "강남 — 점심 한 끼",
    date: "2025-02-20",
    shared: false,
    created_at: "2025-02-20T12:30:00.000Z",
    tags: ["맛집", "강남"],
    mood: "happy",
  },
  {
    id: 5,
    uuid: MOCK_USER_ID,
    latitude: 37.5703,
    longitude: 126.9831,
    photo_url:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80",
    description: "인사동 골목 — 엽서 한 장",
    date: "2025-03-08",
    shared: true,
    created_at: "2025-03-08T15:00:00.000Z",
    tags: ["인사동", "골목", "엽서"],
    mood: "reflective",
  },
  {
    id: 6,
    uuid: MOCK_USER_ID,
    latitude: 37.5400,
    longitude: 126.9921,
    photo_url:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
    description: "한강 공원 — 노을 지는 저녁",
    date: "2025-05-02",
    shared: true,
    created_at: "2025-05-02T18:30:00.000Z",
    tags: ["한강", "노을", "산책"],
    mood: "calm",
  },
  {
    id: 7,
    uuid: MOCK_USER_ID,
    latitude: 37.6171,
    longitude: 126.9895,
    photo_url:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80",
    description: "북한산 등산 — 정상에서 본 서울",
    date: "2024-09-14",
    shared: false,
    created_at: "2024-09-14T09:00:00.000Z",
    tags: ["등산", "북한산", "자연"],
    mood: "excited",
  },
  {
    id: 8,
    uuid: MOCK_USER_ID,
    latitude: 37.5145,
    longitude: 127.1058,
    photo_url:
      "https://images.unsplash.com/photo-1559762705-2123aa9b467f?w=400&q=80",
    description: "올림픽공원 — 장미축제",
    date: "2025-05-25",
    shared: true,
    created_at: "2025-05-25T11:00:00.000Z",
    tags: ["꽃", "축제", "공원"],
    mood: "excited",
  },
];
