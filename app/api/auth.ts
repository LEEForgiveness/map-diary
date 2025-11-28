import { create } from "domain";
import supabase from "../utils/supabaseConfig";

export async function registerUser(signupData: { email: string; password: string; name: string }) {
    const {data, error} = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
            data: {
                name: signupData.name,
            }
        }
    });
    console.log(data);
    console.log(error);

    if (error) {
        console.error('Error registering user:', error);
    }

    return { data, error };
}

export async function loginUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    return {data, error};
}
