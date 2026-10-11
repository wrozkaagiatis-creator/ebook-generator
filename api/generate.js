import fetch from 'node-fetch';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
    const { name, email } = req.body || {};

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

    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const watermarkText = `Egzemplarz spersonalizowany dla: ${name || 'Czytelnik'} (${email || ''})`;

    pages.forEach((page) => {
      page.drawText(watermarkText, {
        x: 30,
        y: 20,
        size: 9,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Ebook-Tarocistki-Agiatis.pdf"`
    );
    return res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Błąd generowania PDF:', error);
    return res.status(500).json({ error: 'Wystąpił błąd podczas generowania e-booka.' });
  }
}
