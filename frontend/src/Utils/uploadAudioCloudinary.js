const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
const cloud_name = import.meta.env.VITE_CLOUD_NAME;

const uploadAudioToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', upload_preset);
    uploadData.append('resource_type', 'video'); // Specify the resource type to handle audio

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`, {
        method: 'POST',
        body: uploadData
    });

    const data = await res.json();
    return data;
}

export default uploadAudioToCloudinary;