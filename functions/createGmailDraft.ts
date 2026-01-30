import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body, pdfUrl } = await req.json();

    if (!to || !subject || !pdfUrl) {
      return Response.json({ 
        error: 'Missing required fields: to, subject, pdfUrl' 
      }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Fetch the PDF file
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Create email with attachment
    const boundary = '----=_Part_' + Math.random().toString(36).substring(2);
    
    const emailLines = [
      'Content-Type: multipart/mixed; boundary="' + boundary + '"',
      'MIME-Version: 1.0',
      'To: ' + to,
      'Subject: ' + subject,
      '',
      '--' + boundary,
      'Content-Type: text/html; charset=UTF-8',
      '',
      body || '',
      '',
      '--' + boundary,
      'Content-Type: application/pdf; name="document.pdf"',
      'Content-Disposition: attachment; filename="document.pdf"',
      'Content-Transfer-Encoding: base64',
      '',
      pdfBase64,
      '--' + boundary + '--'
    ];

    const email = emailLines.join('\r\n');
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Create Gmail draft
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          raw: encodedEmail
        }
      })
    });

    if (!gmailResponse.ok) {
      const error = await gmailResponse.text();
      return Response.json({ error: `Gmail API error: ${error}` }, { status: 500 });
    }

    const draft = await gmailResponse.json();

    return Response.json({ 
      success: true, 
      draftId: draft.id,
      message: 'Draft created successfully'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});