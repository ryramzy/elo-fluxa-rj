import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getDocs, query, collection, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Find all lessons scheduled in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('status', '==', 'confirmed'),
      where('date', '>=', now.toISOString().split('T')[0]),
      where('date', '<=', tomorrow.toISOString().split('T')[0]),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No lessons to remind' });
    }

    // Send reminder for each booking
    const results = await Promise.allSettled(
      bookings.map(async (booking: any) => {
        const { userName, userEmail, date, time, duration, meetLink, notes } = booking;
        
        // Check if lesson is within 24 hours
        const lessonDateTime = new Date(`${date}T${time}:00-03:00`);
        const hoursUntilLesson = (lessonDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Only send if lesson is within 24 hours but more than 30 minutes away
        if (hoursUntilLesson <= 24 && hoursUntilLesson > 0.5) {
          const formattedDate = new Date(date + 'T00:00:00')
            .toLocaleDateString('pt-BR', {
              weekday: 'long', day: 'numeric', month: 'long'
            });

          const { error } = await resend.emails.send({
            from: 'Elo! <noreply@elospeak.com.br>',
            replyTo: 'matt@elospeak.com.br',
            to: userEmail,
            subject: `Lembrete: Sua aula é amanhã - ${formattedDate}`,
            html: `
              <div style="font-family:sans-serif;max-width:520px;
                          margin:0 auto;color:#1a1a1a">
                <h2 style="color:#2563eb;margin-bottom:8px">Elo!</h2>
                <p style="margin:0 0 24px 0;font-size:16px">
                  Olá, <strong>${userName}</strong>!
                </p>
                
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;
                            padding:16px;border-radius:4px;margin:20px 0">
                  <h3 style="margin:0 0 8px 0;color:#92400e;font-size:16px">
                    Lembrete de Aula
                  </h3>
                  <p style="margin:0;font-size:15px;line-height:1.5">
                    <strong>${formattedDate}</strong> às ${time}<br/>
                    Duração: ${duration} minutos<br/>
                    Professor: Matt
                  </p>
                  ${notes ? `<p style="margin:8px 0 0 0;font-size:14px;color:#92400e">
                    <strong>Seu tema:</strong> ${notes}
                  </p>` : ''}
                </div>

                ${meetLink ? `
                <a href="${meetLink}" 
                   style="display:inline-block;background:#22c55e;color:white;
                          padding:12px 24px;border-radius:6px;
                          text-decoration:none;font-weight:bold;margin:16px 0">
                  Entrar no Google Meet
                </a>` : `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;
                            padding:12px;border-radius:4px;margin:16px 0">
                  <p style="margin:0;font-size:14px;color:#64748b">
                    Link do Google Meet será enviado 1 hora antes
                  </p>
                </div>`}

                <div style="background:#f0f9ff;border:1px solid #3b82f6;
                            padding:12px;border-radius:4px;margin:20px 0">
                  <h4 style="margin:0 0 8px 0;color:#1e40af;font-size:14px">
                    Checklist para sua aula:
                  </h4>
                  <ul style="margin:8px 0 0 0;padding-left:16px;font-size:13px;color:#1e40af">
                    <li>Testar microfone e câmera</li>
                    <li>Conexão internet estável</li>
                    <li>Ambiente tranquilo</li>
                    <li>Chegar 5 minutos antes</li>
                  </ul>
                </div>

                <div style="text-align:center;margin:24px 0">
                  <p style="color:#64748b;font-size:13px">
                    Precisa remarcar? 
                    <a href="mailto:matt@elospeak.com.br" style="color:#2563eb">
                      Avise com 2h de antecedência
                    </a>
                  </p>
                </div>

                <p style="color:#94a3b8;font-size:12px;margin-top:32px;
                          padding-top:16px;border-top:1px solid #e2e8f0">
                  <strong>Elo!</strong><br/>
                  Inglês americano sem pressão<br/>
                  elospeak.com.br · matt@elospeak.com.br
                </p>
              </div>
            `,
          });

          return { bookingId: booking.id, success: !error, error };
        }
        
        return { bookingId: booking.id, skipped: true, reason: 'Outside reminder window' };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length;
    const skipped = results.filter(r => r.status === 'fulfilled' && r.value.skipped).length;

    res.status(200).json({ 
      message: 'Lesson reminders processed',
      total: bookings.length,
      successful,
      failed,
      skipped
    });

  } catch (error) {
    console.error('Lesson reminder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
