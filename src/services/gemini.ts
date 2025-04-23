import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealthResponse, Question } from "@/types/health";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a medical AI assistant. Your task is to:
1. Generate a series of relevant medical questions based on the user's initial complaint
2. For each question, specify the type (multiple-choice, yes-no, slider, text, or checkbox)
3. Provide appropriate options for multiple-choice questions
4. Include min/max/step values for slider questions
5. Generate 7-8 questions that a doctor would typically ask
6. After all questions are answered, provide a preliminary assessment and recommendations
7. Prepare those questions based on the users previous answers
8. please include any icons for options generated in the options array related to the question

IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.

Example response format:
{
  "questions": [
    {
      "id": "q1",
      "type": "yes-no",
      "text": "Have you had a fever in the last 24 hours?"
    },
    {
      "id": "q2",
      "type": "multiple-choice",
      "text": "How long have you been experiencing these symptoms?",
      "options": ["Less than 24 hours", "1-3 days", "4-7 days", "More than a week"]
    }
  ]
}`;

export const generateHealthQuestions = async (complaint: string): Promise<HealthResponse> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const prompt = `${SYSTEM_PROMPT}\n\nUser's complaint: ${complaint}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's valid JSON
    const cleanedText = text
      .replace(/```json/g, '')  // Remove markdown code block markers
      .replace(/```/g, '')      // Remove any remaining backticks
      .trim();                  // Remove whitespace
    
    // Parse the JSON response
    const healthResponse: HealthResponse = JSON.parse(cleanedText);
    return healthResponse;
  } catch (error) {
    console.error("Error generating health questions:", error);
    throw error;
  }
};

export const generateFinalAssessment = async (
  complaint: string,
  answers: Record<string, any>
): Promise<{ diagnosis: string; recommendations: string[] }> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const prompt = `Based on the following information, provide a preliminary medical assessment and recommendations:
    
Initial Complaint: ${complaint}
Answers: ${JSON.stringify(answers, null, 2)}

IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.

Format as JSON:
{
  "diagnosis": "your assessment",
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's valid JSON
    const cleanedText = text
      .replace(/```json/g, '')  // Remove markdown code block markers
      .replace(/```/g, '')      // Remove any remaining backticks
      .trim();                  // Remove whitespace
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating final assessment:", error);
    throw error;
  }
};