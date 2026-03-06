const fs = require('fs');
async function test() {
  const fileData = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  const formData = new FormData();
  formData.append("file", fileData);
  formData.append("upload_preset", "vibecheck");

  const res = await fetch(`https://api.cloudinary.com/v1_1/dzzv2vmy3/image/upload`, {
      method: "POST",
      body: formData,
  });
  console.log(res.status, await res.text());
}
test();
