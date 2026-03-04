const url = 'https://bananarepublic.gap.com/browse/product.do?pid=873154032&vid=1&pcid=48422&cid=3042887#pdp-page-content';
fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    .then(res => res.text())
    .then(html => {
        const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
        console.log(match ? match[1] : "No og:image found");
    }).catch(console.error);
