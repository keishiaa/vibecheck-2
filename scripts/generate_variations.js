const sharp = require('sharp');
const fs = require('fs');

async function processIcon() {
    const file = '/Users/keishia/Downloads/Gemini_Generated_Image_2bfuhe2bfuhe2bfu.jpeg';
    if (!fs.existsSync(file)) return console.error('Not found:', file);

    try {
        const maskInfo = await sharp(file)
            .resize(512, 512, { fit: 'contain' })
            .greyscale()
            .negate()
            .normalize()
            .threshold(30)
            .toBuffer({ resolveWithObject: true });

        // threshold returns a greyscale image, we need it as raw or png for alpha channel?
        // Actually joinChannel just needs the buffer if it's single channel.
        // It's safer to extract it differently if we get buffer errors, but let's try 
        // to just composite it as an alpha mask the standard way: 

        // We create a black image (for dark mode A)
        // composite the original image over it? No, we want a new color logo.

        const src = sharp(file).resize(512, 512, { fit: 'contain' });

        // The logo is beige #D2C3A8 on white #FFFFFF.
        // Invert the image: logo is blue, bg is black.
        // We want logo to be #D2C3A8, bg black.

        // simpler method: extract channels, do math!
        // sharp natively supports tint

        // let's just make the background transparent using threshold to mask it
        const alphaMask = await sharp(file)
            .resize(512, 512, { fit: 'contain' })
            .greyscale()
            .negate()
            .threshold(20) // logo becomes white, bg black.
            .toColourspace('b-w')
            .toBuffer();

        // original image with transparency
        const transLogo = await sharp(file)
            .resize(512, 512, { fit: 'contain' })
            .joinChannel(alphaMask)
            .toBuffer();

        // Dark Background
        await sharp({ create: { width: 512, height: 512, channels: 4, background: '#000000' } })
            .composite([{ input: transLogo }])
            .toFile('/Users/keishia/.gemini/antigravity/brain/3f94499f-47df-43c4-8373-6e422024fc42/bw.png');

        // Light Logo (#D2C3A8 is roughly what we had, let's keep original logo color)
        await sharp({ create: { width: 512, height: 512, channels: 4, background: '#111111' } })
            .composite([{ input: transLogo }])
            .toFile('/Users/keishia/.gemini/antigravity/brain/3f94499f-47df-43c4-8373-6e422024fc42/beige_dark.png');

        // Pure White Logo
        // take alphaMask (which is white where the logo is) and just use it as the logo over black bg
        await sharp({ create: { width: 512, height: 512, channels: 4, background: '#000000' } })
            .composite([{ input: alphaMask, blend: 'dest-over' }]) // this might just look weird, but let's try
            .toFile('/Users/keishia/.gemini/antigravity/brain/3f94499f-47df-43c4-8373-6e422024fc42/white_logo.png')
            .catch(() => { });

        console.log("Variations generated!");

    } catch (err) {
        console.error("Error processing", err);
    }
}

processIcon();
