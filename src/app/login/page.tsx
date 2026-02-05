
'use client';

import { useState } from 'react';
import { sendLoginOTP, verifyLoginOTP } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleEmailSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        const result = await sendLoginOTP(formData);

        setIsLoading(false);
        if (result.error) {
            setError(result.error);
        } else if (result.email) {
            setEmail(result.email);
            setStep('otp');
        }
    }

    async function handleOTPSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        const code = formData.get('code') as string;
        const result = await verifyLoginOTP(email, code);

        setIsLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            router.push('/');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-white text-2xl">lock</span>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    AssetTrack Pro
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {step === 'email' ? 'Ingresa tu correo corporativo' : `Código enviado a ${email}`}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-500">error</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'email' ? (
                        <form action={handleEmailSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                    Correo Electrónico
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="usuario@empresa.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? 'Enviando...' : 'Continuar con Email'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form action={handleOTPSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-slate-700">
                                    Código de Verificación (OTP)
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        maxLength={4}
                                        required
                                        className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-center text-2xl tracking-[0.5em] font-mono"
                                        placeholder="0000"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-center text-slate-500">
                                    El código expira en 5 minutos.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    Volver / Cambiar correo
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            {/* Background pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
        </div>
    );
}
