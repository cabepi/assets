
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { getGeminiModel, searchToolDeclaration, functions } from "@/lib/gemini"; // Fixed import

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const token = req.cookies.get('session_token')?.value;
        const session = await verifySession(token || "");
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Fetch Capabilities
        const capResult = await sql`
            SELECT * FROM asset.ai_role_caps WHERE role_id = ${session.role_id}
        `;

        if (capResult.rowCount === 0) {
            return NextResponse.json({ error: "Access Denied: Role not configured for AI." }, { status: 403 });
        }

        const caps = capResult.rows[0];
        if (!caps.can_general_chat) {
            return NextResponse.json({ error: "Chat disabled for this role." }, { status: 403 });
        }

        const { message, history } = await req.json();

        // 3. Prepare Model with Tools
        // Enable Tools only if role allows DB Query
        const tools = caps.can_db_query ? [searchToolDeclaration] : undefined;

        const schemaContext = `
        Database Schema (Schema: asset):
        - users (user_id, full_name, role_id, job_title, email)
        - roles (role_id, name)
        - assets (asset_id, name, description, status, current_value, acquisition_date, serial_number, category_id)
        - categories (category_id, name)
        - assignments (assignment_id, asset_id, user_id, assigned_at)
        
        Instructions:
        - If the user asks for data involving these tables, USE the 'queryDatabase' tool.
        - ALWAYS verify the schema before querying.
        - 'active' status in assets means it's in use.
        - IMPORTANT: If the user asks "how many" (cuantos), use 'SELECT COUNT(*) ...'. Do NOT select all rows because results are limited to 10.
        `;

        const fullInstruction = `${caps.personality_instruction}\n${schemaContext}`;

        // Note: For now, we are creating a new model instance per request.
        // In a real app, you might cache this, but for Next.js Serverless this is standard.
        // We need to pass tools to the model config if we want it to know about them.
        // 'getGeminiModel' wrapper needs update or we instantiate here.
        // Let's modify 'getGeminiModel' in gemini.ts to accept tools optionally.
        // Or just instantiate here for full control.

        const genAI = new (await import("@google/generative-ai")).GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

        // Cast tool definition to satisfy TS
        const modelTools = tools ? [{ functionDeclarations: tools as any }] : undefined;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: { parts: [{ text: fullInstruction }], role: "system" },
            tools: modelTools
        });

        // 4. Start Chat
        const chat = model.startChat({
            history: history || [],
        });

        // 5. Send Message & Handle Function Calling Loop
        let result = await chat.sendMessage(message);
        let response = result.response;

        // Loop to handle potential multiple function calls (Max 5 turns)
        let maxTurns = 5;

        while (maxTurns > 0) {
            const functionCalls = response.functionCalls();

            if (!functionCalls || functionCalls.length === 0) {
                break; // No more function calls, we have text
            }

            const call = functionCalls[0]; // Handle first call
            if (call.name === 'queryDatabase') {
                const args = call.args as any;
                const toolResult = await functions.queryDatabase({ query: args.query });

                // Send result back to model
                result = await chat.sendMessage([{
                    functionResponse: {
                        name: 'queryDatabase',
                        response: { content: toolResult }
                    }
                }]);
                response = result.response;
            } else {
                break; // Unknown tool or handling logic not implemented
            }
            maxTurns--;
        }

        // Final check for text
        let replyText = response.text();
        if (!replyText) {
            // Fallback if model refuses to speak after tool use (rare but possible with some safety filters or model quirks)
            replyText = "He consultado la base de datos, pero no he generado una respuesta textual. Por favor, reformula la pregunta.";
        }

        return NextResponse.json({ reply: replyText });

    } catch (e: any) {
        console.error("Chat Error:", e);
        // Handle "safety" blocks gracefully
        if (e.message?.includes("SAFETY")) {
            return NextResponse.json({ reply: "Lo siento, no puedo responder a eso por políticas de seguridad." });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
