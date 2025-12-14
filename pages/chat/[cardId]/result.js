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
  
  // 성공/실패에 따른 랜덤 메시지
  const getSuccessMessage = () => {
    const messages = [
      "저, 당신의 집으로 가고 싶어요!",
      "저, 당신이 마음에 들었어요!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getFailureMessage = () => {
    const messages = [
      "흠, 저 말고 다른 제품이랑 이야기해보세요.",
      "음...저와는 잘 맞지 않는 것 같아요. 아쉽네요."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // 영상 파일 경로 가져오기
  const getVideoPath = (isSuccess) => {
    if (!productGroup) return null;
    return isSuccess 
      ? `/result videos/${productGroup}/${productGroup}_success.mp4`
      : `/result videos/${productGroup}/${productGroup}_fail.mp4`;
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
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/png" href="/thingo_favicon.png" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          minHeight: "-webkit-fill-available",
          width: "100vw",
          position: "relative",
          backgroundColor: "#000",
          overflow: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* 영상 재생 */}
        {result && getVideoPath(result.isSuccess) && (
          <video
            ref={videoRef}
            src={getVideoPath(result.isSuccess)}
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 1,
            }}
            onEnded={() => {
              // 영상이 끝나면 멈춤
              if (videoRef.current) {
                videoRef.current.pause();
              }
            }}
          />
        )}
        
        {/* 결과 텍스트 오버레이 (영상 위에 표시) */}
        {result && (
          <>
            {/* 상단 텍스트들 (성공/실패 공통) */}
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                textAlign: "center",
                fontFamily: "Pretendard, sans-serif",
                width: "100%",
                padding: "0 1rem",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(10pt, 3vw, 12pt)",
                  color: "#fff",
                  marginBottom: "0.5rem",
                  fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                대화를 마쳤어요!
              </p>
              <p
                style={{
                  fontSize: "clamp(14pt, 4vw, 16pt)",
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  marginBottom: "2rem",
                  padding: "0 1rem",
                  wordBreak: "keep-all",
                }}
              >
                {result.isSuccess ? getSuccessMessage() : getFailureMessage()}
              </p>
            </div>

            {/* 제품 nickname (화면 중앙) */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                textAlign: "center",
                fontFamily: "Pretendard, sans-serif",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  msBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(12pt, 3.5vw, 14pt)",
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {nickname}
                </span>
              </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div
              style={{
                position: "absolute",
                bottom: "2rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                textAlign: "center",
                fontFamily: "Pretendard, sans-serif",
                width: "calc(100% - 2rem)",
                maxWidth: "500px",
                padding: "0 1rem",
              }}
            >
              {result.isSuccess && (
                <p
                  style={{
                    fontSize: "clamp(10pt, 3vw, 12pt)",
                    color: "#fff",
                    marginBottom: "1rem",
                    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                    wordBreak: "keep-all",
                  }}
                >
                  책상에 있는 입양 신청서를 작성해보세요
                </p>
              )}
              <button
                onClick={() => {
                  // 제품 그룹에 따라 해당 제품 선택 페이지로 이동
                  if (productGroup) {
                    router.push(`/${productGroup}`);
                  } else {
                    router.back();
                  }
                }}
                style={{
                  width: "100%",
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
          </>
        )}
      </div>
    </>
  );
}

