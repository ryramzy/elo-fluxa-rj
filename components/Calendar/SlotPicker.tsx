/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth.ts';
import {
  bookLesson,
  CALENDAR_OAUTH_SCOPES,
  getClientId,
  getInstructorCalendarId,
  listAvailableSlots,
  type CalendarSlot,
} from '../../services/calendarService.ts';

const SlotPicker: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<CalendarSlot | null>(null);

  const clientConfigured = Boolean(getClientId());
  const calendarConfigured = Boolean(getInstructorCalendarId());

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: CALENDAR_OAUTH_SCOPES,
    onSuccess: (res) => {
      setAccessToken(res.access_token);
      setError(null);
      setSuccess(null);
    },
    onError: () => {
      setError('Não foi possível autorizar o Google Calendar. Tente de novo.');
    },
    prompt: 'consent',
  });

  const loadSlots = useCallback(async () => {
    if (!accessToken) return;
    setLoadingSlots(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await listAvailableSlots(accessToken);
      setSlots(next);
    } catch (e) {
      setSlots([]);
      setError(e instanceof Error ? e.message : 'Erro ao buscar horários livres.');
    } finally {
      setLoadingSlots(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      void loadSlots();
    } else {
      setSlots([]);
    }
  }, [accessToken, loadSlots]);

  const studentEmail = user?.email ?? '';
  const studentName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'Aluno';

  const handlePickSlot = (slot: CalendarSlot) => {
    setSuccess(null);
    setError(null);
    const ok = window.confirm(
      `Reservar aula em ${slot.summary}?\n\nUm convite será enviado para você e para o instrutor por e-mail.`
    );
    if (!ok) return;
    void confirmBook(slot);
  };

  const confirmBook = async (slot: CalendarSlot) => {
    if (!accessToken) return;
    if (!studentEmail) {
      setError('Sua conta não tem e-mail. Não é possível enviar o convite.');
      return;
    }
    setBookingSlot(slot);
    setLoadingSlots(true);
    setError(null);
    try {
      const created = await bookLesson(accessToken, slot, studentEmail, studentName);
      
      // Send email confirmation via serverless function
      if (created.meetLink) {
        await fetch('/api/confirm-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName,
            studentEmail,
            slot: slot.start,
            meetLink: created.meetLink,
            googleEventId: created.id
          }),
        });
      }

      setSuccess(
        `Aula agendada com sucesso! ${created.meetLink ? 'Link do Google Meet enviado por e-mail.' : 'Verifique seu e-mail para o convite do Google Calendar.'}`
      );
      setBookingId(created.id ?? null);
      await loadSlots();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao criar o evento.');
    } finally {
      setBookingSlot(null);
      setLoadingSlots(false);
    }
  };

  if (authLoading) {
    return (
      <div className="rounded-sm border border-slate-100 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
        Carregando sessão…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-sm border border-slate-200 bg-white p-6 md:p-10 shadow-sm text-left">
        <h4 className="font-serif text-2xl font-bold text-slate-900 mb-2">
          Agendar pelo Google Calendar
        </h4>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Conecte sua conta Google para ver horários livres do instrutor e reservar.
        </p>
        <button
          type="button"
          onClick={() => {
            const loginBtn = document.querySelector('[data-login-trigger="true"]') as HTMLButtonElement;
            if (loginBtn) loginBtn.click();
          }}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all"
        >
          Faça Login para Agendar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-slate-200 bg-white p-6 md:p-10 shadow-sm text-left">
      <h4 className="font-serif text-2xl font-bold text-slate-900 mb-2">
        Agendar pelo Google Calendar
      </h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        Conecte sua conta Google para ver horários livres do instrutor e reservar. O convite será
        enviado para <span className="font-semibold text-slate-700">{studentEmail}</span> e para o
        Matthew. O evento é criado na sua agenda principal do Google; o instrutor recebe o convite
        como participante.
      </p>

      {!clientConfigured && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 px-4 py-3 mb-4">
          Defina <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> no{' '}
          <code className="text-xs">.env.local</code> e reinicie o Vite.
        </p>
      )}

      {!calendarConfigured && clientConfigured && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 px-4 py-3 mb-4">
          Defina <code className="text-xs">VITE_INSTRUCTOR_EMAIL</code> ou{' '}
          <code className="text-xs">VITE_INSTRUCTOR_CALENDAR_ID</code> para o calendário do
          instrutor.
        </p>
      )}

      {!accessToken ? (
        <button
          type="button"
          onClick={() => login()}
          disabled={!clientConfigured || !calendarConfigured}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          Conectar Google Calendar
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-green-600">
            Google conectado
          </span>
          <button
            type="button"
            onClick={() => {
              setAccessToken(null);
              setSlots([]);
              setSuccess(null);
              setError(null);
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
          >
            Desconectar
          </button>
          <button
            type="button"
            onClick={() => void loadSlots()}
            disabled={loadingSlots}
            className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Atualizar horários
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-sm border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900">
          {success}
          {bookingId && (
            <span className="block mt-2 text-xs text-green-800/80">ID do evento: {bookingId}</span>
          )}
        </div>
      )}

      {accessToken && loadingSlots && (
        <p className="text-sm text-slate-500 mb-4 animate-pulse">Carregando horários…</p>
      )}

      {accessToken && !loadingSlots && slots.length === 0 && !error && (
        <p className="text-sm text-slate-500">
          Nenhum horário livre encontrado nos próximos 7 dias (segunda a sexta, 9h–18h, horário do
          Rio).
        </p>
      )}

      {accessToken && slots.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot) => (
            <li key={slot.start}>
              <button
                type="button"
                disabled={loadingSlots && bookingSlot?.start === slot.start}
                onClick={() => handlePickSlot(slot)}
                className="w-full text-left rounded-sm border border-slate-100 bg-slate-50 px-4 py-4 hover:border-blue-300 hover:bg-white transition-all disabled:opacity-50"
              >
                <span className="block text-sm font-bold text-slate-800">{slot.summary}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Toque para reservar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SlotPicker;
