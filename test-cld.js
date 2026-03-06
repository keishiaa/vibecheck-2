const formData = new FormData();
formData.append("upload_preset", "vibecheck");
formData.append("file", "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");

fetch("https://api.cloudinary.com/v1_1/dzzv2vmy3/image/upload", {
  method: "POST",
  body: formData
}).then(r => r.json()).then(console.log);
