import { GoogleGenerativeAI } from "@google/generative-ai";
import { Config } from "../constants/Config";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
// Note: Can be switched to "gemini-1.5-flash" if 2.0 hits rate limits again.
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AnalysisResult {
    score: number;
    // UPDATED: Now supports severity levels for nuanced warnings
    redFlags: { clause: string; severity: "critical" | "moderate" | "minor" }[];
    summary: string;
}

const GENERATION_CONFIG = {
    temperature: 0.1,
    responseMimeType: "application/json",
};

// --- MODIFIED INSTRUCTIONS BELOW ---
const SYSTEM_PROMPT = `
You are a highly experienced legal auditor. Your job is to protect the user from predatory terms while recognizing standard business practices.

INSTRUCTIONS:
1. Analyze the contract text/document for risks.
2. Categorize risks by SEVERITY:
    - "CRITICAL": Deal-breakers (e.g., IP theft, indefinite liability, selling personal data, non-cancellable for years, massive hidden fees, etc).
    - "MODERATE": Unfavorable but common (e.g., short notice periods, arbitration clauses, unilateral modification rights, etc).
    - "MINOR": Standard inconveniences (e.g., specific jurisdiction like Delaware, standard liability caps, etc).

3. SCORING ALGORITHM:
    - Start at 0.
    - Add 25-30 points for every CRITICAL risk.
    - Add 10-15 points for every MODERATE risk.
    - Add 0-5 points for MINOR risks.
    - Max score is 100.

Return a STRICT JSON object with this structure:
{
  "score": number (0-100),
  "redFlags": [
      { "clause": "Explanation of the risk...", "severity": "critical" | "moderate" | "minor" }
  ],
  "summary": "A balanced executive summary of the contract."
}
`;

export const analyzeContract = async (text: string): Promise<AnalysisResult> => {
    try {
        const prompt = `${SYSTEM_PROMPT}\n\nContract Text:\n${text.substring(0, 30000)}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const textResponse = response.text();

        return parseResponse(textResponse);

    } catch (error) {
        console.error("Analysis Failed:", error);
        throw error;
    }
};

export const analyzeContractFromFile = async (base64Data: string, mimeType: string = "application/pdf"): Promise<AnalysisResult> => {
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: SYSTEM_PROMPT },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const textResponse = response.text();

        return parseResponse(textResponse);
    } catch (error) {
        console.error("File Analysis Failed:", error);
        throw error;
    }
};

const parseResponse = (content: string): AnalysisResult => {
    try {
        // Clean up markdown code blocks if present
        const cleaned = content.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        const result = JSON.parse(cleaned);

        return {
            score: result.score || 0,
            // Fallback for empty array
            redFlags: result.redFlags || [],
            summary: result.summary || "Analysis complete.",
        };
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return {
            score: 0,
            redFlags: [{ clause: "Analysis failed to parse.", severity: "minor" }],
            summary: "Error parsing the analysis results.",
        };
    }
};