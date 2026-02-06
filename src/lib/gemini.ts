
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "@vercel/postgres";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Tool Definition
// Tool Definition for the Model
export const searchToolDeclaration = {
    name: "queryDatabase",
    parameters: {
        type: "OBJECT",
        description: "Execute a READ-ONLY SQL query against the 'asset' schema to answer user questions about data.",
        properties: {
            query: {
                type: "STRING",
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

        try {
            // Unsafe query execution (Parameterization is hard with dynamic SQL, but read-only pg user is best practice. 
            // Here we rely on Regex + Logic).
            const result = await sql.query(query); // Warning: SQL Injection risk if input not sanitized, but this is Internal AI.
            // Limiting results
            return { result: result.rows.slice(0, 10) };
        } catch (error: any) {
            return { error: error.message };
        }
    }
};


export async function getGeminiModel(systemInstruction: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: {
            parts: [{ text: systemInstruction }],
            role: "system"
        }
    });
    return model;
}
