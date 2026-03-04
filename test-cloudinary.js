const formData = new FormData();
formData.append("file", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
formData.append("upload_preset", "vibecheck");

fetch("https://api.cloudinary.com/v1_1/dzzv2vmy3/image/upload", {
    method: "POST",
    body: formData
}).then(r => r.json()).then(console.log).catch(console.error);
