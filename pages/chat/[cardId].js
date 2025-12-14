import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getCardNickname, getProductGroup, getInitialGreeting } from "@/config/systemPrompts";
import SplitText from "@/components/SplitText";

const MAX_CONVERSATIONS = 5; // 제품 1개당 최대 대화 횟수

export default function Chat() {
  const router = useRouter();
  const { cardId } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 제품별 대화 횟수 계산 (user 메시지 개수)
  const conversationCount = messages.filter(msg => msg.role === "user").length;
  const remainingQuestions = Math.max(0, MAX_CONVERSATIONS - conversationCount);
  const isLimitReached = conversationCount >= MAX_CONVERSATIONS;
  const canShowResult = conversationCount >= 2; // 2번 이상 질문했을 경우
  
  // Nickname 가져오기
  const nickname = cardId ? getCardNickname(cardId) : "";
  
  // 제품 이미지 경로 가져오기
  const getProductImage = (cardId) => {
    if (!cardId) return null;
    const productGroup = getProductGroup(cardId);
    const imageMap = {
      gram: "/gram.png",
      hydrotower: "/hydrotower.png",
      puricare: "/puricare.png",
      xboom: "/xboom.png",
    };
    return imageMap[productGroup] || null;
  };
  
  const productImage = getProductImage(cardId);
  
  // 진자운동 애니메이션을 위한 state
  const [animationOffset, setAnimationOffset] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // 진자운동 애니메이션
  useEffect(() => {
    if (!productImage) return;
    
    let animationFrame;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // 초 단위
      // sin 함수를 사용하여 -10px ~ +10px 범위로 진자운동
      const offset = Math.sin(elapsed * 2) * 10; // 2는 속도 조절
      setAnimationOffset(offset);
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [productImage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (cardId) {
      // 제품별 초기 인사 메시지
      const greeting = getInitialGreeting(cardId);
      setMessages([
        {
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [cardId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !cardId || isLimitReached) return;

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

      const data = await response.json();

      if (!response.ok) {
        // API에서 반환한 에러 메시지 사용
        const errorMessage = data.error || data.details || "API 요청 실패";
        throw new Error(errorMessage);
      }

      // 응답 데이터 검증
      if (!data || !data.message) {
        throw new Error("응답 형식이 올바르지 않습니다.");
      }

      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: error.message || "죄송해요, 오류가 발생했어요. 다시 시도해주세요.",
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

  const handleTransitionToResult = (messagesToSave) => {
    setIsTransitioning(true);
    
    // 1. 말풍선들이 서서히 사라짐 (opacity 애니메이션)
    // 2. 제품 이미지가 상단으로 이동
    // 3. 화면 전체가 흰색으로 fade-in
    // 4. 결과 페이지로 전환
    
    setTimeout(() => {
      // 대화 내용을 sessionStorage에 저장
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`chat_${cardId}`, JSON.stringify(messagesToSave || messages));
      }
      router.push(`/chat/${cardId}/result`);
    }, 1500); // 1.5초 transition
  };

  const handleSuggestedQuestion = (question) => {
    if (isLoading || isLimitReached) return;
    setInput(question);
    // 입력 후 자동 전송
    setTimeout(() => {
      const userMessage = { role: "user", content: question };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId,
          messages: newMessages,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.message) {
            const assistantMessage = { role: "assistant", content: data.message };
            const finalMessages = [...newMessages, assistantMessage];
            setMessages(finalMessages);
            
            // 5번째 질문 후 자동으로 결과 페이지로 전환
            const newConversationCount = finalMessages.filter(msg => msg.role === "user").length;
            if (newConversationCount >= MAX_CONVERSATIONS) {
              setTimeout(() => {
                handleTransitionToResult(finalMessages);
              }, 1000); // 1초 대기
            }
          } else {
            throw new Error("응답 형식이 올바르지 않습니다.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content: error.message || "죄송해요, 오류가 발생했어요. 다시 시도해주세요.",
            },
          ]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 0);
  };

  const suggestedQuestions = [
    "네가 선호하는 공간은?",
    "어떤 무드가 좋아?",
    "어떤 주인을 원해?",
  ];


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
            borderBottom: "1px solid #e0e0e0",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
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
              {nickname || "대화하기"}
            </h1>
            <div style={{ width: "60px" }}></div>
          </div>
          {/* 남은 질문 횟수 표시 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              paddingTop: "0",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#C4F434",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "12pt",
                  fontWeight: 600,
                  color: "#252525",
                }}
              >
                {remainingQuestions}
              </span>
            </div>
            <span
              style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "10pt",
                color: "#252525",
                letterSpacing: "-0.02em",
              }}
            >
              궁금한 것을 앞으로 {remainingQuestions}번 물어볼 수 있어요
            </span>
          </div>
        </div>

        {/* Product Image - Floating in center */}
        {productImage && (
          <div
            style={{
              position: "fixed",
              top: isTransitioning ? "-100px" : "50%",
              left: "50%",
              transform: isTransitioning 
                ? `translate(-50%, 0)` 
                : `translate(-50%, calc(-50% + ${animationOffset}px))`,
              width: "200px",
              height: "200px",
              aspectRatio: "1/1",
              zIndex: isTransitioning ? 200 : 0, // transition 중에는 최상단
              pointerEvents: "none",
              transition: isTransitioning ? "top 1.5s ease-in, transform 1.5s ease-in, opacity 1.5s ease-in" : "none",
              opacity: isTransitioning ? 0 : 1,
            }}
          >
            <img
              src={productImage}
              alt={nickname || "제품"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {/* Transition Overlay - 흰색 fade-in */}
        {isTransitioning && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#fff",
              zIndex: 150,
              opacity: 0,
              animation: "fadeInWhite 1.5s ease-in forwards",
            }}
          />
        )}

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            paddingTop: "calc(1rem + 100px)", // 헤더 높이를 위한 여백 (남은 횟수 표시 포함)
            paddingBottom: "200px", // 하단 고정 요소를 위한 여백
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "relative",
            zIndex: 1, // 이미지보다 높은 z-index
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 1.5s ease-in",
          }}
        >
          {messages.map((msg, index) => {
            return (
              <div
                key={`msg-${index}-${msg.content.substring(0, 20)}`}
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
                    position: "relative",
                    zIndex: 2, // 이미지보다 확실히 위에 표시
                  }}
                >
                  <SplitText
                    text={msg.content}
                    delay={msg.role === "user" ? 20 : 30}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 5 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="0px"
                    textAlign="left"
                  />
                </div>
              </div>
            );
          })}
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
          {isLimitReached && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "14px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                대화 횟수 제한에 도달했습니다. (최대 {MAX_CONVERSATIONS}번)
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 대화 결과 보러가기 버튼 */}
        {canShowResult && !isLimitReached && (
          <div
            style={{
              position: "fixed",
              bottom: "140px", // 추천 질문 위에 위치
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 2rem)",
              maxWidth: "500px",
              zIndex: 10,
              padding: "0 1rem",
            }}
          >
            <button
              onClick={() => {
                handleTransitionToResult(messages);
              }}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "20px",
                background: "linear-gradient(150deg, #D8F69D -1.73%, #FBFFF4 31.89%, #D8F69D 74.48%, #FBFFF4 113.7%)",
                border: "1px solid #fff",
                color: "#252525",
                fontFamily: "Pretendard, sans-serif",
                fontSize: "12pt",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "140%",
                letterSpacing: "-0.32px",
                cursor: "pointer",
                outline: "none",
                whiteSpace: "nowrap",
              }}
            >
              대화 결과 보러가기
            </button>
          </div>
        )}

        {/* Suggested Questions - Fixed at bottom */}
        {!isLimitReached && (
          <div
            style={{
              backgroundColor: "transparent",
              padding: "0.75rem 1rem",
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              position: "fixed",
              bottom: canShowResult ? "80px" : "80px", // 입력창 위
              left: 0,
              right: 0,
              zIndex: 10,
            }}
            className="suggested-questions-container"
          >
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                minWidth: "fit-content",
              }}
            >
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading || isLimitReached}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    background: "linear-gradient(150deg, #D8F69D -1.73%, #FBFFF4 31.89%, #D8F69D 74.48%, #FBFFF4 113.7%)",
                    border: "1px solid #fff",
                    color: "#252525",
                    fontFamily: "Pretendard, sans-serif",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "140%",
                    letterSpacing: "-0.32px",
                    cursor: isLoading || isLimitReached ? "not-allowed" : "pointer",
                    opacity: isLoading || isLimitReached ? 0.5 : 1,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    outline: "none",
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - Fixed at bottom */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: "0.5rem",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLimitReached ? "대화 횟수 제한에 도달했습니다" : "메시지를 입력하세요..."}
            disabled={isLoading || isLimitReached}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              border: "1px solid #e0e0e0",
              borderRadius: "24px",
              fontSize: "14px",
              fontFamily: "Pretendard, sans-serif",
              outline: "none",
              backgroundColor: isLimitReached ? "#f5f5f5" : "#fff",
              color: isLimitReached ? "#999" : "#000",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isLimitReached}
            style={{
              padding: "0",
              backgroundColor: "#C4F434",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isLoading || !input.trim() || isLimitReached ? "not-allowed" : "pointer",
              opacity: isLoading || !input.trim() || isLimitReached ? 0.5 : 1,
            }}
          >
            <img
              src="/send.svg"
              alt="전송"
              style={{
                width: "24px",
                height: "24px",
              }}
            />
          </button>
        </div>
      </div>
      <style jsx global>{`
        .suggested-questions-container::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fadeInWhite {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}




