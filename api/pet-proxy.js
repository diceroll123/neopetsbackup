import axios from 'axios';

export default async (req, res) => {
    try {
        const { name, sci, emote, size } = req.query;
        let PET_IMG_URL;
        let imageRequest;

        const headers = {
            "Host": "pets.neopets.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "TE": "Trailers",
        };

        if (name === undefined) {
            PET_IMG_URL = `http://pets.neopets.com/cp/${sci}/${emote || 1}/${size || 1}.png`;
            imageRequest = axios.get(PET_IMG_URL, { responseType: "arraybuffer", headers: headers });

            // only aggressively cache if this is a sci image
            res.setHeader('Cache-Control', 's-maxage=43200');

        } else {
            PET_IMG_URL = `http://pets.neopets.com/cpn/${name}/${emote || 1}/${size || 1}.png`;
            imageRequest = axios.get(PET_IMG_URL, { headers: headers });
        }

        const imageResponse = await imageRequest;

        res.setHeader('content-type', imageResponse.headers['content-type']);

        // extra logic for head request for initial pet image
        // adds pet sci to header
        const finalURL = imageResponse.request?.path || null;
        if (finalURL?.startsWith('/cp/')) {
            res.setHeader('sci', finalURL.split('/')[2]);
        }

        res.send(imageResponse.data);
    } catch (error) {
        if (error.message.includes('404')) {
            res.status(404);
            return res.send('Not found');
        }

        res.status(500);
        res.send(error.message);
    }
};
