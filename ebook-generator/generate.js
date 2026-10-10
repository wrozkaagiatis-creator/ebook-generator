const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Brakuje imienia lub e-maila.' });
    }

    const pdfPath = path.join(process.cwd(), 'base-ebook.pdf');
    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ error: 'Brak pliku bazowego e-booka na serwerze.' });
    }

    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText(`Egzemplarz przygotowany dla: ${name} (${email})`, {
      x: 50,
      y: 80,
      size: 10,
      color: rgb(0.77, 0.62, 0.35),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="spersonalizowany-ebook.pdf"`);
    return res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Wystąpił błąd podczas generowania pliku.' });
  }
}