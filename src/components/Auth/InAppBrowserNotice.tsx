import { useState } from 'react';

export function InAppBrowserNotice() {
  const [copied, setCopied] = useState(false);
  const ua = navigator.userAgent;
  const embedded = /WhatsApp|FBAN|FBAV|Instagram|; wv\)/i.test(ua) ||
    (/iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua) &&
      !/Safari|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua));
  if (!embedded) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div role="note" className="mb-4 rounded-xl border border-blue-400/30 bg-blue-950/50 p-4 text-sm text-blue-100">
      <p>Abriu pelo WhatsApp? Para entrar com o Google, abra esta página no Chrome ou Safari pelo menu do aplicativo. Você também pode usar email e senha aqui.</p>
      <button type="button" onClick={copyLink} className="mt-2 min-h-[44px] underline font-semibold">
        {copied ? 'Link copiado' : 'Copiar link para abrir no navegador'}
      </button>
    </div>
  );
}
