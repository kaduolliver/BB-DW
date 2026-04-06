import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copyFallback = txt => {
    const textarea = document.createElement('textarea');
    textarea.value = txt;
    textarea.style.position = 'fixed'; // evita scroll
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopy = async () => {
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        copyFallback(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
      copyFallback(text); 
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className="ml-1 rounded hover:bg-zinc-700/80 active:scale-95 transition"
    >
      {copied ? (
        <span className="text-xs text-emerald-400">Copiado!</span>
      ) : (
        <Copy size={14} className="text-zinc-400" />
      )}
    </button>
  );
}
