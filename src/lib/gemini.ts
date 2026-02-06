
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@vercel/postgres";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Tool Definition
export const searchToolDeclaration = {
    name: "queryDatabase",
    parameters: {
        type: "OBJECT", // Use string literal "OBJECT"
        description: "Execute a READ-ONLY SQL query against the 'asset' schema to answer user questions about data.",
        properties: {
            query: {
                type: "STRING", // Use string literal "STRING"
                description: "The SQL SELECT query to execute. Must use 'asset.' schema prefix (e.g. asset.users).",
            },
        },
        required: ["query"],
    },
};

export const functions = {
    queryDatabase: async ({ query }: { query: string }) => {
        console.log(`🤖 AI SQL Attempt: ${query}`);

        // Basic Security
        const lowerQ = query.toLowerCase();
        if (!lowerQ.trim().startsWith("select")) {
            return { error: "Security Alert: Only SELECT queries are permitted." };
        }
        if (lowerQ.includes("drop") || lowerQ.includes("delete") || lowerQ.includes("update") || lowerQ.includes("insert") || lowerQ.includes("alter")) {
            return { error: "Security Alert: Modification or destructive commands are blocked." };
        }

        let client;
        try {
            client = await db.connect();
            const result = await client.query(query); // Execute raw query string
            return { result: result.rows.slice(0, 10) };
        } catch (error: any) {
            console.error("SQL Tool Error:", error);
            return { error: `Database Error: ${error.message}` };
        } finally {
            if (client) client.release();
        }
    }
};

export async function getGeminiModel(systemInstruction: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: {
            parts: [{ text: systemInstruction }],
            role: "system"
        }
    });
    return model;
}
