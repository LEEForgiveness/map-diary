import { Session } from "@supabase/supabase-js";
import supabase from "../utils/supabaseConfig";
import { AddPhotoType, Mood } from "../types/photoType";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "";
const PHOTO_FOLDER = "photos";

async function getUniqueFileName(fileName: string) {
  const hasNonEnglish = /[^a-zA-Z0-9._-]/.test(fileName);
  console.log("hasNonEnglish:", hasNonEnglish);
  
  if (hasNonEnglish) {
    // 파일명을 영문으로 변환 (예: timestamp 사용)
    const dotIndex = fileName.lastIndexOf(".");
    const extension = dotIndex === -1 ? "" : fileName.slice(dotIndex);
    fileName = `photo-${Date.now()}${extension}`;
  }


  const dotIndex = fileName.lastIndexOf(".");
  const base = dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
  const extension = dotIndex === -1 ? "" : fileName.slice(dotIndex);
  let candidate = fileName;
  let suffix = 1;

  while (true) {
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(PHOTO_FOLDER, { search: candidate, limit: 1 });

    if (listError) {
      const message = (listError as { message?: string })?.message ?? "";
      if (!message.toLowerCase().includes("not found")) {
        console.error("Error checking existing file name:", listError);
        throw listError;
      }
      return candidate;
    }

    const alreadyExists =
      existingFiles?.some((storedFile) => storedFile.name === candidate) ??
      false;

    if (!alreadyExists) {
      return candidate;
    }

    candidate = `${base}-${suffix}${extension}`;
    suffix += 1;
  }
}

export async function AddPhoto(
  session: Session,
  file: File,
  addPhoto: AddPhotoType
) {
  try {
    const uniqueFileName = await getUniqueFileName(file.name);
    const { data: storageData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(`${PHOTO_FOLDER}/${uniqueFileName}`, file, {
        upsert: false,
      });
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from(`${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}`)
      .getPublicUrl(`photos/${uniqueFileName}`);
    const { data, error } = await supabase.from("photo").insert([
      {
        photo_url: publicUrlData.publicUrl,
        uuid: session?.user?.id,
        description: addPhoto.description,
        latitude: addPhoto.lat,
        longitude: addPhoto.lng,
        date: addPhoto.date,
        shared: addPhoto.shared,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error("Error inserting photo metadata:", error);
      return null;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function UpdatePhoto(
  session: Session,
  photoId: number,
  update: {
    description: string;
    lat: number;
    lng: number;
    date: string;
    shared: boolean;
    tags?: string[];
    mood?: Mood;
  },
  file?: File
) {
  if (!session?.user?.id) {
    throw new Error("세션 정보가 없습니다.");
  }

  const payload: Record<string, any> = {
    description: update.description,
    latitude: update.lat,
    longitude: update.lng,
    date: update.date,
    shared: update.shared,
    tags: update.tags ?? [],
    mood: update.mood ?? null,
  };

  if (file) {
    const uniqueFileName = await getUniqueFileName(file.name);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(`${PHOTO_FOLDER}/${uniqueFileName}`, file, {
        upsert: false,
      });
    if (uploadError) {
      console.error("Error uploading replacement file:", uploadError);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from(`${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}`)
      .getPublicUrl(`photos/${uniqueFileName}`);
    payload.photo_url = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("photo")
    .update(payload)
    .eq("id", photoId)
    .eq("uuid", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating photo metadata:", error);
    return null;
  }

  return data;
}

export async function GetPhotos() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 비로그인 상태: 공개 사진만 조회
  if (!session) {
    const { data, error } = await supabase
      .from("photo")
      .select("*")
      .eq("shared", true)
      .order("date", { ascending: false });
    if (error) {
      console.error("Error fetching photos:", error);
      return null;
    }
    return data;
  }

  // 로그인 상태: 내 사진만 조회
  const { data, error } = await supabase
    .from("photo")
    .select("*")
    .eq("uuid", session.user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    return null;
  }
  return data;
}

export async function DeletePhotos(photoId: number, photoUrl: string) {
  const fileName = photoUrl.substring(photoUrl.lastIndexOf("/") + 1); // "abc123.jpg"
  try {
  const responseStorage = await supabase.storage.from(BUCKET).remove([`${PHOTO_FOLDER}/${fileName}`]);
  console.log("Storage deletion response:", responseStorage);
  const response = await supabase.from("photo").delete().eq("id", photoId);
  return response;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
}