import axios from 'axios';

export default async (req, res) => {
    try {
        const { name, sci, emote, size } = req.query;
        let PET_IMG_URL;
        let imageRequest;

        if (name === undefined) {
            PET_IMG_URL = `http://pets.neopets.com/cp/${sci}/${emote || 1}/${size || 1}.png`;
            imageRequest = axios.get(PET_IMG_URL, { responseType: "arraybuffer" });

            // only aggressively cache if this is a sci image
            res.setHeader('Cache-Control', 's-maxage=43200');

        } else {
            PET_IMG_URL = `http://pets.neopets.com/cpn/${name}/${emote || 1}/${size || 1}.png`;
            imageRequest = axios.head(PET_IMG_URL);
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