import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getSystemPrompt } from "@/config/systemPrompts";

export default function Chat() {
  const router = useRouter();
  const { cardId } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (cardId) {
      // 초기 인사 메시지
      setMessages([
        {
          role: "assistant",
          content: "안녕하세요! 반가워요. 무엇을 도와드릴까요?",
        },
      ]);
    }
  }, [cardId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !cardId) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId,
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "죄송해요, 오류가 발생했어요. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Head>
        <title>대화하기 - Thingo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/thingo_favicon.png" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              padding: "0.5rem",
              color: "#373737",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            ← 뒤로
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#000",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            대화하기
          </h1>
          <div style={{ width: "60px" }}></div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "0.75rem 1rem",
                  borderRadius: "16px",
                  backgroundColor: msg.role === "user" ? "#C4F434" : "#fff",
                  color: msg.role === "user" ? "#000" : "#000",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "14px",
                }}
              >
                입력 중...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: "0.5rem",
            position: "sticky",
            bottom: 0,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              border: "1px solid #e0e0e0",
              borderRadius: "24px",
              fontSize: "14px",
              fontFamily: "Pretendard, sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#C4F434",
              border: "none",
              borderRadius: "24px",
              color: "#000",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "Pretendard, sans-serif",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              opacity: isLoading || !input.trim() ? 0.5 : 1,
            }}
          >
            전송
          </button>
        </div>
      </div>
    </>
  );
}



