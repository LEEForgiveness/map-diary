import { Photo, Mood } from "@/app/types/photoType";

// 좌표 기반 장소 키 (약 100m 단위)
export function getPlaceKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

export interface PlaceGroup {
  placeKey: string;
  lat: number;
  lng: number;
  photos: Photo[];
  representative: Photo; // 가장 최근 사진
}

export interface MonthGroup {
  label: string; // "2025년 5월"
  yearMonth: string; // "2025-05"
  photos: Photo[];
}

export interface FilterState {
  sharedOnly: boolean;
  years: number[]; // 빈 배열이면 전체
  tags: string[]; // 빈 배열이면 전체
  moods: Mood[]; // 빈 배열이면 전체
  placeKeys: string[]; // 빈 배열이면 전체
}

export const DEFAULT_FILTER: FilterState = {
  sharedOnly: false,
  years: [],
  tags: [],
  moods: [],
  placeKeys: [],
};

// 장소별 그룹
export function groupPhotosByPlace(photos: Photo[]): PlaceGroup[] {
  const map = new Map<string, Photo[]>();

  for (const photo of photos) {
    const key = getPlaceKey(photo.latitude, photo.longitude);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(photo);
  }

  const groups: PlaceGroup[] = [];
  map.forEach((groupPhotos, placeKey) => {
    const sorted = [...groupPhotos].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const [latStr, lngStr] = placeKey.split(":");
    groups.push({
      placeKey,
      lat: parseFloat(latStr),
      lng: parseFloat(lngStr),
      photos: sorted,
      representative: sorted[0],
    });
  });

  // 대표 사진 최신순 정렬
  return groups.sort(
    (a, b) =>
      new Date(b.representative.created_at).getTime() -
      new Date(a.representative.created_at).getTime()
  );
}

// 월별 그룹 (최신순)
export function groupPhotosByMonth(photos: Photo[]): MonthGroup[] {
  const sorted = [...photos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const map = new Map<string, Photo[]>();
  for (const photo of sorted) {
    const d = new Date(photo.created_at);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(yearMonth)) map.set(yearMonth, []);
    map.get(yearMonth)!.push(photo);
  }

  const groups: MonthGroup[] = [];
  map.forEach((groupPhotos, yearMonth) => {
    const [y, m] = yearMonth.split("-");
    groups.push({
      label: `${y}년 ${parseInt(m)}월`,
      yearMonth,
      photos: groupPhotos,
    });
  });

  return groups;
}

// 필터 적용
export function filterPhotos(
  photos: Photo[],
  filter: FilterState
): Photo[] {
  return photos.filter((photo) => {
    if (filter.sharedOnly && !photo.shared) return false;

    if (filter.years.length > 0) {
      const year = new Date(photo.created_at).getFullYear();
      if (!filter.years.includes(year)) return false;
    }

    if (filter.tags.length > 0) {
      const photoTags = photo.tags ?? [];
      if (!filter.tags.some((t) => photoTags.includes(t))) return false;
    }

    if (filter.moods.length > 0) {
      if (!photo.mood || !filter.moods.includes(photo.mood)) return false;
    }

    if (filter.placeKeys.length > 0) {
      const key = getPlaceKey(photo.latitude, photo.longitude);
      if (!filter.placeKeys.includes(key)) return false;
    }

    return true;
  });
}

// 전체 태그 목록 추출 (중복 제거)
export function extractAllTags(photos: Photo[]): string[] {
  const set = new Set<string>();
  for (const photo of photos) {
    for (const tag of photo.tags ?? []) set.add(tag);
  }
  return Array.from(set);
}

// 전체 연도 목록 추출
export function extractAllYears(photos: Photo[]): number[] {
  const set = new Set<number>();
  for (const photo of photos) {
    set.add(new Date(photo.created_at).getFullYear());
  }
  return Array.from(set).sort((a, b) => b - a);
}
