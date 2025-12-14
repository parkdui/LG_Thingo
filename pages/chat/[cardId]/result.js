import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getCardNickname, getSystemPrompt, getProductGroup } from "@/config/systemPrompts";

export default function ChatResult() {
  const router = useRouter();
  const { cardId } = router.query;
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cardId) return;

    // 대화 내용을 분석하여 성공/실패 판단
    const analyzeConversation = async () => {
      // sessionStorage에서 대화 내용 가져오기
      let messages = [];
      if (typeof window !== 'undefined') {
        const storedMessages = sessionStorage.getItem(`chat_${cardId}`);
        if (storedMessages) {
          messages = JSON.parse(storedMessages);
        }
      }

      // 시스템 프롬프트를 기반으로 판단 로직 구현
      const systemPrompt = getSystemPrompt(cardId);
      
      // 대화 내용 분석 (간단한 키워드 기반 판단)
      // 실제로는 AI API를 통해 더 정교한 분석이 가능
      const userMessages = messages.filter(msg => msg.role === "user");
      const assistantMessages = messages.filter(msg => msg.role === "assistant");
      
      // 긍정적인 키워드 확인
      const positiveKeywords = ["좋아", "괜찮", "맞", "필요", "원해", "좋겠", "궁금", "알고 싶", "더", "괜찮아"];
      const negativeKeywords = ["싫", "안", "아니", "별로", "필요 없", "괜찮지 않"];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      userMessages.forEach(msg => {
        const content = msg.content.toLowerCase();
        positiveKeywords.forEach(keyword => {
          if (content.includes(keyword)) positiveCount++;
        });
        negativeKeywords.forEach(keyword => {
          if (content.includes(keyword)) negativeCount++;
        });
      });
      
      // 대화 길이와 긍정/부정 비율로 판단
      const isSuccess = userMessages.length >= 2 && positiveCount >= negativeCount;
      
      setResult({
        isSuccess,
        message: isSuccess 
          ? "입양 성공! 당신과 잘 맞는 제품이에요." 
          : "입양 실패. 다른 제품을 찾아보세요.",
      });
      setIsLoading(false);
    };

    analyzeConversation();
  }, [cardId]);

  const nickname = cardId ? getCardNickname(cardId) : "";
  const productGroup = cardId ? getProductGroup(cardId) : "";
  const videoRef = useRef(null);

  // 영상 파일 경로 가져오기
  const getVideoPath = (isSuccess) => {
    if (!productGroup) return null;
    return isSuccess 
      ? `/videos/${productGroup}_success.mp4`
      : `/videos/${productGroup}_fail.mp4`;
  };

  useEffect(() => {
    if (result && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Video play error:", err);
      });
    }
  }, [result]);

  if (isLoading) {
    return (
      <>
        <Head>
          <title>대화 결과 - Thingo</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          fontFamily: "Pretendard, sans-serif",
        }}>
          <p>결과를 분석 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>대화 결과 - Thingo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/thingo_favicon.png" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
          backgroundColor: "#000",
          overflow: "hidden",
        }}
      >
        {/* 영상 재생 */}
        {result && getVideoPath(result.isSuccess) && (
          <video
            ref={videoRef}
            src={getVideoPath(result.isSuccess)}
            autoPlay
            loop
            muted
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 1,
            }}
          />
        )}
        
        {/* 결과 텍스트 오버레이 (영상 위에 표시) */}
        {result && (
          <div
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              textAlign: "center",
              fontFamily: "Pretendard, sans-serif",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "1.5rem 2rem",
              borderRadius: "16px",
              maxWidth: "90%",
            }}
          >
            <h1
              style={{
                fontSize: "24pt",
                fontWeight: 600,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              {result.isSuccess ? "입양 성공!" : "입양 실패"}
            </h1>
            <p
              style={{
                fontSize: "14pt",
                color: "#fff",
                marginBottom: "1.5rem",
              }}
            >
              {result.message}
            </p>
            <button
              onClick={() => router.back()}
              style={{
                padding: "14px 28px",
                borderRadius: "14px",
                background: "linear-gradient(91deg, #C4F434 -2.42%, #D8F69D 50.99%, #C4F434 104.41%)",
                border: "none",
                cursor: "pointer",
                fontFamily: "Pretendard, sans-serif",
                fontSize: "12pt",
                fontWeight: 600,
                color: "#000",
              }}
            >
              돌아가기
            </button>
          </div>
        )}
      </div>
    </>
  );
}

