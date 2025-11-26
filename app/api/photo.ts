import { Session } from "@supabase/supabase-js";
import supabase from "../utils/supabaseConfig";
import { AddPhotoType } from "../types/photoType";
import { create } from "domain";

export async function AddPhoto(session: Session, file: File, AddPhoto: AddPhotoType) {
    const checked = await supabase.from('photo').select('latitude, longitude').eq('latitude', AddPhoto.lat).eq('longitude', AddPhoto.lng);
    console.log(checked);
    if (checked) {
        console.log('중복된 위치에 사진을 추가할 수 없습니다.');
        return null;
    }
    try {
        const { data: storageData, error: uploadError } = await supabase.storage.from(`${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}`).upload('photos/' + file.name, file, {
  upsert: true,
});
    if (uploadError) {
        console.error('Error uploading file:', uploadError);
    }

    const { data: publicUrlData } = supabase.storage.from(`${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}`).getPublicUrl(`photos/${file.name}`);
    const{data, error} = await supabase.from('photo').insert([
        {
            photo_url: publicUrlData.publicUrl,
            uuid: session?.user?.id,
            description: AddPhoto.description,
            latitude: AddPhoto.lat,
            longitude: AddPhoto.lng,
            date: AddPhoto.date,
            shared: AddPhoto.shared,
            created_at: new Date().toISOString(),
        },
    ]);
    if (error) {
        console.error('Error inserting photo metadata:', error);
    }
    return data;

    } catch (error) {
        throw error;
    }
}

export async function GetPhotos() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        const { data, error } = await supabase.from('photo').select('*').eq('shared', true);
        if (error) {
            console.error('Error fetching photos:', error);
            return null;
        }
        return data;
    } else {
        const { data, error } = await supabase.from('photo').select('*').or(`shared.eq.true,uuid.eq.${session?.user.id}`);
    if (error) {
        console.error('Error fetching photos:', error);
        return null;
    }
    return data;
    }
}