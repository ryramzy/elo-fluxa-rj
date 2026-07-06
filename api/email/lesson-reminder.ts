import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getFirestoreAccessToken } from '../utils/googleAuth';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    // Find all lessons scheduled in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const queryUrl = `${baseRestUrl}:runQuery`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'bookings' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'status' },
                  op: 'EQUAL',
                  value: { stringValue: 'confirmed' }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'date' },
                  op: 'GREATER_THAN_OR_EQUAL',
                  value: { stringValue: todayStr }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'date' },
                  op: 'LESS_THAN_OR_EQUAL',
                  value: { stringValue: tomorrowStr }
                }
              }
            ]
          }
        }
      }
    };

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    const queryResults = await queryResponse.json();
    const bookings = Array.isArray(queryResults)
      ? queryResults
          .filter((item: any) => item.document)
          .map((item: any) => {
            const fields = item.document.fields;
            return {
              id: item.document.name.split('/').pop(),
              userId: fields.userId?.stringValue || fields.uid?.stringValue,
              userName: fields.userName?.stringValue || fields.studentName?.stringValue || 'Estudante',
              userEmail: fields.userEmail?.stringValue || fields.studentEmail?.stringValue,
              date: fields.date?.stringValue,
              time: fields.time?.stringValue,
              duration: parseInt(fields.duration?.integerValue || '60', 10),
              meetLink: fields.meetLink?.stringValue || null,
              notes: fields.notes?.stringValue || null
            };
          })
      : [];

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No lessons to remind' });
    }

    // Send reminder for each booking
    const results = await Promise.allSettled(
      bookings.map(async (booking: any) => {
        const { userId, userName, userEmail, date, time, duration, meetLink, notes } = booking;
        if (!userEmail) return { skipped: true, reason: 'No email address' };

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

          if (!error && userId) {
            try {
              const notificationsUrl = `${baseRestUrl}/users/${userId}/notifications`;
              const notificationBody = {
                fields: {
                  title: { stringValue: 'Lembrete de Aula! ⏰' },
                  message: { stringValue: `Sua aula está agendada para amanhã (${formattedDate}) às ${time}.` },
                  read: { booleanValue: false },
                  createdAt: { timestampValue: new Date().toISOString() }
                }
              };
              await fetch(notificationsUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationBody)
              });
            } catch (notifErr) {
              console.error('Error creating reminder notification:', notifErr);
            }
          }

          return { bookingId: booking.id, success: !error, error };
        }
        
        return { bookingId: booking.id, skipped: true, reason: 'Outside reminder window' };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && !(r.value as any).skipped && (r.value as any).success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !(r.value as any).skipped && (r.value as any).error)).length;
    const skipped = results.filter(r => r.status === 'fulfilled' && (r.value as any).skipped).length;

    res.status(200).json({ 
      message: 'Lesson reminders processed',
      total: bookings.length,
      successful,
      failed,
      skipped
    });

  } catch (error: any) {
    console.error('Lesson reminder error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
