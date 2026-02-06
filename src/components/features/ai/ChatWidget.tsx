"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatMessage {
    role: "user" | "model";
    text: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([{ role: "model", text: "¡Hola! Soy tu asistente de Activos. ¿En qué puedo ayudarte hoy?" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);

        try {
            // Prepare history for API (excluding the last user message we just added visually)
            // Gemini API expects history... we can send full history or just context. 
            // Simple approach: Send last few messages.
            // Prepare history for API
            // Filter out system greeting if it's the first message
            const history = messages
                .filter((_, i) => i > 0 || messages[0].role !== "model")
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg, history }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to fetch");
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: "model", text: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "model", text: "Lo siento, tuve un problema al procesar tu solicitud." }]);
        } finally {
            setLoading(false);
        }
    };

    // Note: We'll assume the parent component checks permissions to render this widget.

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-primary px-4 py-3 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">smart_toy</span>
                            <span className="font-semibold text-sm">Asset Assistant</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMessages([{ role: "model", text: "¡Hola! Soy tu asistente de Activos. ¿En qué puedo ayudarte hoy?" }])}
                                className="hover:bg-white/20 rounded p-1 transition-colors"
                                title="Borrar conversación"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1 transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-white"
                                        : "bg-white text-slate-800 border border-slate-200"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-500 text-xs px-3 py-2 rounded-lg border border-slate-200 animate-pulse">
                                    Escribiendo...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pregunta sobre activos..."
                            className="flex-1 bg-slate-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Float Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="size-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
                >
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">chat_bubble</span>
                </button>
            )}
        </div>
    );
}
