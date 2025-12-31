import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

export default function LightboxListener() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setSrc(e.detail?.src || null);
    };
    window.addEventListener('openLightbox', handler as EventListener);
    return () => window.removeEventListener('openLightbox', handler as EventListener);
  }, []);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-w-[90%] max-h-[90%] bg-transparent rounded-md overflow-hidden">
        <img src={src} alt="preview" className="w-full h-full object-contain" />
        <div className="absolute top-3 right-3 flex gap-2">
          <a href={src} download className="p-2 rounded bg-white/90 hover:bg-white/100">
            <Download className="w-4 h-4 text-gray-800" />
          </a>
          <button
            className="p-2 rounded bg-white/90 hover:bg-white/100"
            onClick={() => setSrc(null)}
            aria-label="关闭"
          >
            <X className="w-4 h-4 text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
}


