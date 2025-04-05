import { supabase } from "../../supabaseClient";

export const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("images") 
      .upload(filePath, blob, {
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Image upload error:", error.message);
      return null;
    }

    // Get the public URL for this image
    const { data: publicUrlData } = supabase
      .storage
      .from("images")
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
};
