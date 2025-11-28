import { Session } from "@supabase/supabase-js";
import supabase from "../utils/supabaseConfig";
import { AddPhotoType } from "../types/photoType";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "";
const PHOTO_FOLDER = "photos";

async function getUniqueFileName(fileName: string) {
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
    const { data: checked, error: checkError } = await supabase
      .from("photo")
      .select("id")
      .eq("latitude", addPhoto.lat)
      .eq("longitude", addPhoto.lng);

    if (checkError) {
      console.error("Error checking duplicate photo:", checkError);
      throw checkError;
    }

    if ((checked?.length ?? 0) == 0) {
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
      const { data: publicUrlData } = supabase.storage.from(`${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}`).getPublicUrl(`photos/${uniqueFileName}`);
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
    } else {
        console.log("중복된 위치에 사진을 추가할 수 없습니다.");
        return null;
    }
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
  if (!session) {
    const { data, error } = await supabase
      .from("photo")
      .select("*")
      .eq("shared", true);
    if (error) {
      console.error("Error fetching photos:", error);
      return null;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from("photo")
      .select("*")
      .or(`shared.eq.true,uuid.eq.${session?.user.id}`);
    if (error) {
      console.error("Error fetching photos:", error);
      return null;
    }
    return data;
  }
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