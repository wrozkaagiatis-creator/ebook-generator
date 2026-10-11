import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileId = '1DKmahSlZaQw26WM8jf4yc9oewIp7pwBK';
    let pdfUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let response = await fetch(pdfUrl);

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const confirmCode = setCookie.match(/download_warning[^\=]*\=([^;]+)/);
      if (confirmCode) {
        pdfUrl += `&confirm=${confirmCode[1]}`;
        response = await fetch(pdfUrl, {
          headers: { Cookie: setCookie }
        });
      }
    }

    if (!response.ok) {
      throw new Error('Nie udało się pobrać pliku z Dysku Google.');
    }

    const pdfBytes = await response.arrayBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Ebook-Tarocistki-Agiatis.pdf"`
    );
    return res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Błąd pobierania:', error);
    return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania pliku.' });
  }
}
