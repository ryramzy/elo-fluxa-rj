import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, studentEmail, courseName, courseLink } = req.body;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const { error } = await resend.emails.send({
      from: 'Elo! <noreply@elospeak.com.br>',
      replyTo: 'matt@elospeak.com.br',
      to: studentEmail,
      subject: `You're enrolled in ${courseName}!`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">Elo!</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Hi <strong>${studentName}</strong>,
          </p>
          <p style="margin:0 0 20px 0">
            Welcome to <strong>${courseName}</strong>! Your enrollment was successful and you can start learning right away.
          </p>
          
          <div style="background:#f0fdf4;border-left:4px solid #22c55e;
                      padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:15px;line-height:1.5">
              <strong>Enrollment Date:</strong> ${formattedDate}<br/>
              <strong>Account Email:</strong> ${studentEmail}<br/>
            </p>
          </div>

          <a href="${courseLink}" 
             style="display:inline-block;background:#2563eb;color:white;
                    padding:12px 24px;border-radius:6px;
                    text-decoration:none;font-weight:bold;margin:16px 0">
            Start Learning Now
          </a>

          <p style="color:#64748b;font-size:13px;margin-top:24px">
            If you have any questions, 
            <a href="https://wa.me/5521999999999" style="color:#2563eb">
              chat with Matt on WhatsApp
            </a>.
          </p>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px;
                    padding-top:16px;border-top:1px solid #e2e8f0">
            <strong>Elo!</strong><br/>
            Real American English<br/>
            elospeak.com.br · matt@elospeak.com.br
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Enrollment confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
