import fetch from 'node-fetch';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Brak imienia użytkownika' });
    }

    const fileId = '1PnC_eDERRjwbV74M0OCS9UcpuYVbTOTy';
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    return res.status(200).json({ 
      success: true, 
      downloadUrl: directDownloadUrl,
      message: 'Pobieranie rozpoczęte' 
    });

  } catch (error) {
    console.error('Błąd:', error);
    return res.status(500).json({ error: 'Wystąpił błąd serwera.' });
  }
}
