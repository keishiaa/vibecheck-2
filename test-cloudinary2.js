const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  // using a simple base64 1x1 gif
  const b64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  formData.append("file", b64);
  formData.append("upload_preset", "vibecheck");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dzzv2vmy3/image/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    console.log(data);
  } catch(e) { console.error(e); }
}

testUpload();
