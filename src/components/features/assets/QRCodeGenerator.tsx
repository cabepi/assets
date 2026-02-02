'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    className?: string;
    showDownload?: boolean;
}

export const QRCodeGenerator = ({ value, size = 128, className, showDownload = false }: QRCodeGeneratorProps) => {
    const qrRef = useRef<HTMLDivElement>(null);

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-code-${value.split('/').pop()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div ref={qrRef} className={`flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
            <QRCodeCanvas
                value={value}
                size={size}
                level={"H"}
                includeMargin={true}
            />
            <p className="mt-2 text-xs font-mono text-slate-500 font-bold">{value.split('/').pop()}</p>

            {showDownload && (
                <button
                    onClick={downloadQR}
                    className="mt-3 text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-bold"
                >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Descargar PNG
                </button>
            )}
        </div>
    );
};
