export const uploadImageToCloudinary = async (imageFileOrBase64) => {
  const formData = new FormData();
  formData.append("file", imageFileOrBase64);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const getOptimizedUrl = (url, width = 800) => {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return url;
  
  // Injects f_auto (format), q_auto (quality), and c_limit (resize if larger than width)
  // This helps stay in the free tier by reducing bandwidth usage.
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
};
