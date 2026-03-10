export type Mood = "happy" | "calm" | "nostalgic" | "excited" | "reflective";

export interface AddPhotoType {
  description?: string;
  lat: string;
  lng: string;
  date?: string;
  shared: boolean;
  tags?: string[];
  mood?: Mood;
}

export interface Photo {
  id: number;
  uuid: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  description?: string;
  date?: string;
  shared: boolean;
  created_at: string;
  tags?: string[];
  mood?: Mood;
}