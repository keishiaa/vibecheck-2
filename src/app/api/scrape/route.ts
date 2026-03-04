import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(8000), // 8 seconds timeout
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 500 });
        }

        const html = await response.text();

        // Very robust regexes to grab any og:image or twitter:image from meta tags
        // Handle varying attribute orders (property="og:image" vs content="..." first)
        const matchMetaImage = (html: string): string | null => {
            // Check for og:image
            let regex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
            let match = html.match(regex);
            if (match && match[1]) return match[1];

            regex = /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i;
            match = html.match(regex);
            if (match && match[1]) return match[1];

            // Check for twitter:image
            regex = /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
            match = html.match(regex);
            if (match && match[1]) return match[1];

            regex = /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i;
            match = html.match(regex);
            if (match && match[1]) return match[1];

            return null;
        };

        let imageUrl = matchMetaImage(html);

        // Fallback: If no meta image, grab the first large-looking image loosely
        if (!imageUrl) {
            const imgRegex = /<img[^>]*src=["']([^"']+)["']/i;
            const imgMatch = html.match(imgRegex);
            if (imgMatch && imgMatch[1]) {
                imageUrl = imgMatch[1];
            }
        }

        if (imageUrl) {
            // Handle relative URLs (e.g. /images/hero.jpg)
            if (imageUrl.startsWith('/')) {
                const urlObj = new URL(url);
                imageUrl = `${urlObj.origin}${imageUrl}`;
            } else if (!imageUrl.startsWith('http')) {
                const urlObj = new URL(url);
                imageUrl = `${urlObj.origin}/${imageUrl}`;
            }

            return NextResponse.json({ imageUrl });
        }

        return NextResponse.json({ error: 'No image found on page' }, { status: 404 });

    } catch (error) {
        console.error('Error fetching link preview:', error);
        return NextResponse.json({ error: 'Error processing URL' }, { status: 500 });
    }
}
