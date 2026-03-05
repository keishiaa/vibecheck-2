const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processIcon() {
    const images = [
        '/Users/keishia/Downloads/Gemini_Generated_Image_odmbzwodmbzwodmb.png',
        '/Users/keishia/Downloads/Gemini_Generated_Image_2bfuhe2bfuhe2bfu.jpeg'
    ];

    for (const imgPath of images) {
        if (fs.existsSync(imgPath)) {
            const parsed = path.parse(imgPath);

            // We will make 3 versions: 
            // 1. Inverted colors (dark background, inverted logo)
            // 2. Extracted (transparent background if possible - requires a threshold, we can try to turn white into transparent)

            try {
                await sharp(imgPath)
                    .negate({ alpha: false }) // Invert colors
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
                    .png()
                    .toFile(`public/icon-512x512-dark-${parsed.name}.png`);

                console.log(`Processed: public/icon-512x512-dark-${parsed.name}.png`);
            } catch (err) {
                console.error("Error processing", imgPath, err);
            }
        }
    }
}

processIcon();
