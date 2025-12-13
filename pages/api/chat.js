import OpenAI from "openai";
import { getSystemPrompt } from "@/config/systemPrompts";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cardId, messages } = req.body;

  if (!cardId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // OpenAI API 키 확인
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key not found in environment variables");
    return res.status(500).json({ 
      error: "OpenAI API key not configured",
      details: "Please check your .env file contains OPENAI_API_KEY"
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // System prompt 가져오기
    const systemPrompt = getSystemPrompt(cardId);

    // 메시지 배열 구성 (system prompt 포함)
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "응답을 생성할 수 없습니다.";

    return res.status(200).json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({
      error: "OpenAI API 호출 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}




