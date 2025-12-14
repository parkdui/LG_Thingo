import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getCardId } from "@/config/systemPrompts";

export default function Gram() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [cardSvgs, setCardSvgs] = useState([]);
  const carouselRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const cardCount = 5;
  
  // 클라이언트에서만 랜덤하게 SVG 할당 (각 SVG가 최소 한 번씩 포함되도록 보장)
  useEffect(() => {
    const svgs = ['/arch_1.svg', '/arch_2.svg', '/arch_3.svg'];
    const result = [...svgs];
    
    // 나머지 카드에 대해 랜덤 SVG 추가
    for (let i = svgs.length; i < cardCount; i++) {
      const randomNum = Math.floor(Math.random() * 3) + 1;
      result.push(`/arch_${randomNum}.svg`);
    }
    
    // 배열을 섞어서 순서를 랜덤하게 만듦
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    
    setCardSvgs(result);
  }, []);
  
  const greetings = [
    "안녕하세요! 반가워요",
    "안녕! 만나서 기뻐요",
    "반갑습니다! 잘 부탁해요",
    "안녕하세요! 즐거운 하루 되세요",
    "반가워요! 함께해요"
  ];

  const nicknames = [
    "그램린",
    "루나",
    "픽셀",
    "그램그램",
    "래미"
  ];

  // nickname에 해당하는 이미지 파일 경로 배열 반환
  const getImagesForNickname = (nickname, productGroup) => {
    const imageMap = {
      gram: {
        "그램린": ["/object images/gram/그램린_1.png"],
        "루나": ["/object images/gram/루나_1.png", "/object images/gram/루나_2.png", "/object images/gram/루나_3.png"],
        "픽셀": ["/object images/gram/픽셀_1.png", "/object images/gram/픽셀_2.png"],
        "그램그램": ["/object images/gram/그램그램_1.png", "/object images/gram/그램그램_2.png", "/object images/gram/그램그램_3.png"],
        "래미": ["/object images/gram/래미_1.png", "/object images/gram/래미_2.png", "/object images/gram/래미_3.png"],
      },
    };
    return imageMap[productGroup]?.[nickname] || [];
  };

  // nickname에 해당하는 이미지 개수 반환
  const getImageCountForNickname = (nickname, productGroup) => {
    return getImagesForNickname(nickname, productGroup).length;
  };

  // nickname에 해당하는 이미지 파일 경로 배열 반환
  const getImagesForNickname = (nickname, productGroup) => {
    const imageMap = {
      gram: {
        "그램린": ["/object images/gram/그램린_1.png"],
        "루나": ["/object images/gram/루나_1.png", "/object images/gram/루나_2.png", "/object images/gram/루나_3.png"],
        "픽셀": ["/object images/gram/픽셀_1.png", "/object images/gram/픽셀_2.png"],
        "그램그램": ["/object images/gram/그램그램_1.png", "/object images/gram/그램그램_2.png", "/object images/gram/그램그램_3.png"],
        "래미": ["/object images/gram/래미_1.png", "/object images/gram/래미_2.png", "/object images/gram/래미_3.png"],
      },
    };
    return imageMap[productGroup]?.[nickname] || [];
  };

  // nickname에 해당하는 이미지 개수 반환
  const getImageCountForNickname = (nickname, productGroup) => {
    return getImagesForNickname(nickname, productGroup).length;
  };

  // 활성화된 카드의 SVG에 따라 배경 색상 결정
  const getBackgroundGradient = () => {
    if (cardSvgs.length === 0 || activeIndex >= cardSvgs.length) {
      return "linear-gradient(180deg, #61B3EF 0%, #DAEFFF 100%)";
    }
    
    const activeSvg = cardSvgs[activeIndex];
    
    if (activeSvg === '/arch_1.svg') {
      return "linear-gradient(180deg, #67FF21 0%, #D4FFB8 100%)";
    } else if (activeSvg === '/arch_3.svg') {
      return "linear-gradient(180deg, #18E59D 0%, #B8F5E5 100%)";
    } else {
      // arch_2.svg 또는 기본값
      return "linear-gradient(180deg, #61B3EF 0%, #DAEFFF 100%)";
    }
  };

  // 오버레이 배경 색상 (변경되는 부분만)
  const getOverlayGradient = () => {
    if (cardSvgs.length === 0 || activeIndex >= cardSvgs.length) {
      return null;
    }
    
    const activeSvg = cardSvgs[activeIndex];
    
    if (activeSvg === '/arch_1.svg') {
      return "linear-gradient(180deg, #67FF21 0%, rgba(212, 255, 184, 0) 100%)";
    } else if (activeSvg === '/arch_3.svg') {
      return "linear-gradient(180deg, #18E59D 0%, rgba(184, 245, 229, 0) 100%)";
    } else {
      // arch_2.svg는 기본 색상이므로 오버레이 불필요
      return null;
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    const cardsContainer = cardsContainerRef.current;
    if (!carousel || !cardsContainer) return;

    let scrollTimeout;
    let isScrolling = false;
    let touchStartX = 0;
    let touchEndX = 0;

    const snapToNearestCard = () => {
      if (isScrolling) return;
      
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.clientWidth;
      const cards = cardsContainer.children;
      if (cards.length === 0) return;
      
      const centerPosition = scrollLeft + containerWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const cardCenter = cardLeft + cardWidth / 2;
        const distance = Math.abs(centerPosition - cardCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      // 가장 가까운 카드로 스크롤
      const targetCard = cards[closestIndex];
      const targetLeft = targetCard.offsetLeft;
      const targetWidth = targetCard.offsetWidth;
      const targetCenter = targetLeft + targetWidth / 2;
      let scrollTo = targetCenter - containerWidth / 2;
      
      // 스크롤 범위 제한 (양쪽 끝 카드도 중앙에 올 수 있도록)
      const maxScroll = carousel.scrollWidth - containerWidth;
      scrollTo = Math.max(0, Math.min(scrollTo, maxScroll));
      
      isScrolling = true;
      carousel.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
      
      setActiveIndex(closestIndex);
      
      // 스크롤 완료 후 플래그 해제
      setTimeout(() => {
        isScrolling = false;
      }, 300);
    };

    const handleScroll = () => {
      if (isScrolling) return;
      
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.clientWidth;
      const cards = cardsContainer.children;
      if (cards.length === 0) return;
      
      const centerPosition = scrollLeft + containerWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const cardCenter = cardLeft + cardWidth / 2;
        const distance = Math.abs(centerPosition - cardCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      setActiveIndex(closestIndex);
      
      // 스크롤이 끝났을 때 자동 스냅
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        snapToNearestCard();
      }, 150);
    };

    // 터치 이벤트 처리 (모바일 최적화)
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      // 스와이프가 충분히 크면 스냅
      if (Math.abs(diff) > 30) {
        setTimeout(() => {
          snapToNearestCard();
        }, 100);
      }
    };

    carousel.addEventListener("scroll", handleScroll);
    carousel.addEventListener("touchstart", handleTouchStart, { passive: true });
    carousel.addEventListener("touchend", handleTouchEnd, { passive: true });
    handleScroll(); // 초기값 설정

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      carousel.removeEventListener("touchstart", handleTouchStart);
      carousel.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Gram - Thingo App</title>
        <meta name="description" content="Gram page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/thingo_favicon.png" />
      </Head>
      <div
        style={{
          // padding: "1rem",
          paddingTop: "3rem",
          maxWidth: "100%",
          margin: "0 auto",
          fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
          minHeight: "100vh",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: getBackgroundGradient(),
          transition: "background 0.8s ease-in-out",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 오버레이 - 부드러운 전환 효과 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: getOverlayGradient(),
            opacity: getOverlayGradient() ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div className="background-gradient-circle" />
        <div 
          style={{ 
            marginBottom: "1.5rem", 
            position: "relative", 
            zIndex: 1,
            transform: selectedCardIndex !== null ? "translateY(-100vh)" : "translateY(0)",
            opacity: selectedCardIndex !== null ? 0 : 1,
            transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
          }}
        >
          <p
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              fontSize: "10pt",
              lineHeight: "130%",
              letterSpacing: "-0.02em",
              color: "#373737",
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            LG 그램들을 찾았어요!
          </p>
          <h1
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              fontSize: "18pt",
              lineHeight: "130%",
              letterSpacing: "-0.02em",
              color: "#000",
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            누구를 입양할까요?
          </h1>
          <p
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              fontSize: "12pt",
              lineHeight: "140%",
              letterSpacing: "-0.02em",
              color: "#000",
              margin: 0,
            }}
          >
            아래 5개의 그램 중,<br />
            더 자세히 알고싶은 그램을 터치해보세요
          </p>
        </div>
        
        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="horizontal-carousel"
          style={{
            width: selectedCardIndex !== null ? "100vw" : "100%",
            maxWidth: selectedCardIndex !== null ? "100vw" : "100%",
            overflowX: selectedCardIndex !== null ? "hidden" : "auto",
            overflowY: selectedCardIndex !== null ? "visible" : "visible",
            paddingTop: selectedCardIndex !== null ? "0" : "60px",
            paddingBottom: selectedCardIndex !== null ? "0" : "1rem",
            minHeight: selectedCardIndex !== null ? "100vh" : "auto",
            height: selectedCardIndex !== null ? "100vh" : "auto",
            WebkitOverflowScrolling: "touch",
            marginTop: selectedCardIndex !== null ? "0" : "1.5rem",
            scrollSnapType: selectedCardIndex !== null ? "none" : "x mandatory",
            scrollBehavior: "smooth",
            position: selectedCardIndex !== null ? "fixed" : "relative",
            top: selectedCardIndex !== null ? "0" : "auto",
            left: selectedCardIndex !== null ? "0" : "auto",
            zIndex: selectedCardIndex !== null ? 100 : 1,
            transition: "padding-bottom 0.5s ease-in-out, padding-top 0.5s ease-in-out, min-height 0.5s ease-in-out, height 0.5s ease-in-out, width 0.5s ease-in-out, max-width 0.5s ease-in-out, margin-top 0.5s ease-in-out",
          }}
        >
          <div
            ref={cardsContainerRef}
            style={{
              display: "flex",
              gap: "calc(300px * 155 / 278 * 0.4)",
              paddingLeft: selectedCardIndex !== null ? "0" : "calc(50vw - 150px)",
              paddingRight: selectedCardIndex !== null ? "0" : "calc(50vw - 150px)",
              minWidth: "fit-content",
              justifyContent: selectedCardIndex !== null ? "center" : "flex-start",
              alignItems: selectedCardIndex !== null ? "center" : "flex-start",
              width: selectedCardIndex !== null ? "100%" : "auto",
              height: selectedCardIndex !== null ? "100%" : "auto",
              position: selectedCardIndex !== null ? "relative" : "static",
              transition: "justify-content 0.5s ease-in-out, align-items 0.5s ease-in-out, padding-left 0.5s ease-in-out, padding-right 0.5s ease-in-out, width 0.5s ease-in-out, height 0.5s ease-in-out",
            }}
          >
            {[1, 2, 3, 4, 5].map((item, index) => {
              const isSelected = selectedCardIndex === index;
              const isLeft = selectedCardIndex !== null && index < selectedCardIndex;
              const isRight = selectedCardIndex !== null && index > selectedCardIndex;
              
              return (
              <div
                key={item}
                onClick={() => setSelectedCardIndex(index)}
                style={{
                  width: "auto",
                  height: isSelected ? "500px" : "300px",
                  borderRadius: "12px",
                  flexShrink: 0,
                  position: isSelected ? "fixed" : "relative",
                  top: isSelected ? "50vh" : "auto",
                  left: isSelected ? "50vw" : "auto",
                  overflow: "visible",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scrollSnapAlign: "center",
                  scrollSnapStop: "always",
                  cursor: "pointer",
                  transform: isSelected 
                    ? "translate(-50%, -50%) scale(1.01)" 
                    : isLeft 
                      ? "translateX(-100vw)" 
                      : isRight 
                        ? "translateX(100vw)" 
                        : "scale(1) translateX(0)",
                  transformOrigin: "center center",
                  opacity: isSelected || (selectedCardIndex === null) ? 1 : 0,
                  transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out, height 0.5s ease-in-out",
                  zIndex: isSelected ? 100 : 1,
                }}
              >
                {/* Speech Bubble */}
                <div
                  style={{
                    position: "absolute",
                    top: "-45px",
                    left: "50%",
                    transform: (selectedCardIndex === null && index === activeIndex) ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-10px)",
                    opacity: (selectedCardIndex === null && index === activeIndex) ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(91deg, #C4F434 -2.42%, #D8F69D 50.99%, #C4F434 104.41%)",
                      borderRadius: "12px",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Pretendard, sans-serif",
                        fontSize: "11pt",
                        color: "#000",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {greetings[index]}
                    </span>
                  </div>
                </div>
                <img
                  src={cardSvgs[index] || '/arch_1.svg'}
                  alt={`Card ${item}`}
                  style={{
                    height: "100%",
                    width: "auto",
                    objectFit: "contain",
                    borderRadius: "12px",
                    position: "absolute",
                    zIndex: 5,
                  }}
                />
                <img
                  src="/gram.png"
                  alt={`Gram ${item}`}
                  style={{
                    height: "85%",
                    width: "auto",
                    objectFit: "contain",
                    borderRadius: "12px",
                    position: "relative",
                    zIndex: 20,
                  }}
                />
                {/* Nickname */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "50%",
                    transform: (selectedCardIndex === null && index === activeIndex) ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
                    opacity: (selectedCardIndex === null && index === activeIndex) ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "6px 12px",
                    zIndex: 25,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "11pt",
                      color: "#000",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {nicknames[index]}
                  </span>
                </div>
              </div>
            )})}
          </div>
        </div>
        
        {/* Indicator Dots */}
        {selectedCardIndex === null && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.75rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            {[1, 2, 3, 4, 5].map((item, index) => (
              <div
                key={item}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  opacity: index === activeIndex ? 1 : 0.3,
                  transition: "opacity 0.3s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* History Carousel */}
        {selectedCardIndex !== null && (
          <div
            className="historyCarousel"
            style={{
              position: "fixed",
              bottom: "calc(2rem + 120px + 1rem)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 2rem)",
              maxWidth: "500px",
              zIndex: 180,
              animation: "fadeInUp 0.5s ease-in-out",
            }}
          >
            <p
              style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "10pt",
                fontWeight: 500,
                color: "#373737",
                margin: 0,
                marginBottom: "0.75rem",
              }}
            >
              지금까지 지나온 여정이에요
            </p>
            <div
              className="horizontal-carousel"
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: "0.5rem",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                justifyContent: (() => {
                  const nickname = nicknames[selectedCardIndex];
                  const imageCount = getImageCountForNickname(nickname, "gram");
                  return imageCount <= 2 ? "center" : "flex-start";
                })(),
              }}
            >
              {(() => {
                const nickname = nicknames[selectedCardIndex];
                const images = getImagesForNickname(nickname, "gram");
                return images.map((imagePath, idx) => (
                  <div
                    key={idx}
                    style={{
                      flexShrink: 0,
                      width: "120px",
                      height: "90px",
                      borderRadius: "12px",
                      backgroundColor: "#f0f0f0",
                      backgroundImage: `url('${imagePath}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ));
              })()}
            </div>
          </div>
        )}

        {/* White Gradient Overlay */}
        {selectedCardIndex !== null && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "calc(2rem + 120px + 90px + 1rem + 100px)",
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 12.5%)",
              zIndex: 150,
              opacity: selectedCardIndex !== null ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Action Buttons */}
        {selectedCardIndex !== null && (
          <div
            style={{
              position: "fixed",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              width: "86%",
              maxWidth: "500px",
              zIndex: 200,
              animation: "fadeInUp 0.5s ease-in-out",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => {
                if (selectedCardIndex !== null) {
                  const cardId = getCardId("gram", selectedCardIndex);
                  router.push(`/chat/${cardId}`);
                }
              }}
              style={{
                padding: "14px 0",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "14px",
                background: "linear-gradient(91deg, #C4F434 -2.42%, #D8F69D 50.99%, #C4F434 104.41%)",
                border: "none",
                cursor: "pointer",
                width: "100%",
                display: "flex",
              }}
            >
              <span
                style={{
                  textAlign: "center",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "12pt",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "130%",
                  letterSpacing: "-0.4px",
                  color: "#000",
                  whiteSpace: "nowrap",
                }}
              >
                대화하기
              </span>
            </button>
            <button
              onClick={() => setSelectedCardIndex(null)}
              style={{
                padding: "14px 0",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "14px",
                background: "#E3E4E1",
                border: "none",
                cursor: "pointer",
                width: "100%",
                display: "flex",
              }}
            >
              <span
                style={{
                  textAlign: "center",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "12pt",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "130%",
                  letterSpacing: "-0.4px",
                  color: "#373737",
                  whiteSpace: "nowrap",
                }}
              >
                뒤로가기
              </span>
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}

