function maybeSetSciHeader(res, finalUrlOrPath) {
  if (!finalUrlOrPath) return;

  let pathname = finalUrlOrPath;
  try {
    // Works if we have a full URL
    pathname = new URL(finalUrlOrPath).pathname;
  } catch {
    // Otherwise assume we were given a path like "/cp/..."
  }

  if (pathname?.startsWith('/cp/')) {
    // /cp/<sci>/<emote>/<size>.png
    res.setHeader('sci', pathname.split('/')[2]);
  }
}

let axios;
try {
  // Axios v1+ node build. Referencing this path helps some serverless bundlers include it.
  // In older axios (e.g. 0.25.x) this path does not exist, so we fall back.
  // eslint-disable-next-line global-require, import/no-unresolved
  axios = require('axios/dist/node/axios.cjs');
} catch {
  // eslint-disable-next-line global-require
  axios = require('axios');
}
axios = axios?.default ?? axios;

function getFinalUrlFromAxiosResponse(response) {
  return (
    response?.request?.res?.responseUrl ||
    response?.request?._redirectable?._currentUrl ||
    response?.config?.url ||
    response?.request?.path ||
    null
  );
}

const petProxy = async (req, res) => {
  try {
    const { name, sci, emote, size } = req.query;
    let PET_IMG_URL;

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      TE: 'Trailers',
    };

    const emoteValue = emote || 1;
    const sizeValue = size || 1;

    const isSciRequest = name === undefined;
    if (isSciRequest) {
      if (!sci) {
        res.status(400);
        return res.send('Missing required query param: sci');
      }

      PET_IMG_URL = `https://pets.neopets.com/cp/${sci}/${emoteValue}/${sizeValue}.png`;

      // Only aggressively cache if this is a sci image
      res.setHeader('Cache-Control', 's-maxage=43200');
    } else {
      PET_IMG_URL = `https://pets.neopets.com/cpn/${name}/${emoteValue}/${sizeValue}.png`;
    }

    // Special-case HEAD: we only need the final redirected URL to extract `sci`.
    // Use a streaming response and immediately destroy it so we don't download full image bytes.
    if (req.method === 'HEAD') {
      const headResponse = await axios.get(PET_IMG_URL, {
        headers,
        responseType: 'stream',
        maxRedirects: 8,
        validateStatus: () => true,
      });

      res.setHeader(
        'content-type',
        headResponse.headers?.['content-type'] || 'application/octet-stream'
      );

      const finalUrl = getFinalUrlFromAxiosResponse(headResponse);
      maybeSetSciHeader(res, finalUrl);

      // Ensure we don't keep the upstream stream open
      headResponse.data?.destroy?.();

      res.status(headResponse.status || 200);
      return res.end();
    }

    const imageResponse = await axios.get(PET_IMG_URL, {
      headers,
      responseType: 'arraybuffer',
      maxRedirects: 8,
      validateStatus: () => true,
    });

    if (imageResponse.status < 200 || imageResponse.status >= 300) {
      if (imageResponse.status === 404) {
        res.status(404);
        return res.send('Not found');
      }
      res.status(imageResponse.status);
      return res.send(`Upstream error: ${imageResponse.status}`);
    }

    res.status(imageResponse.status || 200);
    res.setHeader(
      'content-type',
      imageResponse.headers?.['content-type'] || 'application/octet-stream'
    );

    const imageFinalUrl = getFinalUrlFromAxiosResponse(imageResponse);
    maybeSetSciHeader(res, imageFinalUrl);

    res.send(Buffer.from(imageResponse.data));
  } catch (error) {
    const status = error?.response?.status;
    res.status(status || 500);
    res.send(error?.message || 'Request failed');
  }
};

module.exports = petProxy;
