import { PDFDocument, rgb } from 'pdf-lib';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Pełne nagłówki CORS zezwalające na zapytanie z dowolnej strony (w tym Webnode)
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
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Brak imienia użytkownika' });
    }

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

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const watermarkText = `Egzemplarz spersonalizowany dla: ${name}${email ? ` (${email})` : ''}`;
    
    firstPage.drawText(watermarkText, {
      x: 40,
      y: 20,
      size: 9,
      color: rgb(0.4, 0.4, 0.4),
    });

    const modifiedPdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Ebook-Tarocistki-Agiatis.pdf"`
    );
    return res.send(Buffer.from(modifiedPdfBytes));

  } catch (error) {
    console.error('Błąd generowania:', error);
    return res.status(500).json({ error: 'Wystąpił błąd podczas generowania pliku.' });
  }
}
