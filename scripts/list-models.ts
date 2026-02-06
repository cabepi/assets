
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    try {
        // Not all SDK versions expose listModels directly on client, 
        // but let's try via the model manager if available or just try a standard request if needed.
        // Actually the error message suggested calling ListModels.
        // The SDK doesn't always have a direct helper for this in older versions, but let's try.
        // Error said: "Call ListModels".

        // Use REST if SDK fails or assumes specific endpoint.
        // But let's try a simple fetch to the endpoint with the key manually to be sure.
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("Error listing models:", data);
        }

    } catch (e) {
        console.error(e);
    }
}

listModels();
