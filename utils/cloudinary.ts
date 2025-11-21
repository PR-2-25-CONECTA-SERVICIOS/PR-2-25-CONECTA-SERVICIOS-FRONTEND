const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload";

const CLOUDINARY_PRESET = "imagescloudexp";

export const uploadToCloudinary = async (uri: string) => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);

    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,   // ❗ NO headers
    });

    const json = await res.json();
    console.log("Cloudinary response:", json);

    return json.secure_url ?? null;
  } catch (err) {
    console.log("Error Cloudinary mobile:", err);
    return null;
  }
};
