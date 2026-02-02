'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onChange: (dataUrl: string) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
        onChange('');
    };

    const handleEnd = () => {
        if (sigCanvas.current) {
            setIsEmpty(sigCanvas.current.isEmpty());
            onChange(sigCanvas.current.toDataURL());
        }
    };

    return (
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative">
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                    className: 'signature-canvas w-full h-40'
                }}
                onEnd={handleEnd}
            />
            {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <span className="text-4xl font-black text-slate-400">FIRME AQUÍ</span>
                </div>
            )}
            <button
                type="button"
                onClick={clear}
                className="absolute top-2 right-2 text-xs font-bold text-primary hover:text-primary/80 bg-white/80 px-2 py-1 rounded"
            >
                LIMPIAR LIENZO
            </button>
        </div>
    );
}
