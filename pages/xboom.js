import Head from "next/head";
import { useState, useEffect, useRef } from "react";

export default function Xboom() {
  const [activeIndex, setActiveIndex] = useState(0);
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
    "붐붐이",
    "톤톤",
    "바옴바옴",
    "뭅뭅이",
    "스웰"
  ];

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

    const snapToNearestCard = () => {
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
      const scrollTo = targetCenter - containerWidth / 2;
      
      carousel.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
      
      setActiveIndex(closestIndex);
    };

    const handleScroll = () => {
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

    carousel.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기값 설정

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Xboom - Thingo App</title>
        <meta name="description" content="Xboom page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/thingo_favicon.png" />
      </Head>
      <div
        style={{
          padding: "1rem",
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
        <div style={{ marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              fontSize: "10pt",
              lineHeight: "130%",
              letterSpacing: "-0.02em",
              color: "#373737",
              opacity: 1,
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            LG XBOOM 360들을 찾았어요!
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
            아래 5개의 XBOOM 중,<br />
            더 자세히 알고싶은 제품을 터치해보세요
          </p>
        </div>
        
        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="horizontal-carousel"
          style={{
            width: "100%",
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "visible",
            paddingTop: "60px",
            paddingBottom: "1rem",
            WebkitOverflowScrolling: "touch",
            marginTop: "1.5rem",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            ref={cardsContainerRef}
            style={{
              display: "flex",
              gap: "calc(300px * 155 / 278 * 0.4)",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              minWidth: "fit-content",
            }}
          >
            {[1, 2, 3, 4, 5].map((item, index) => (
              <div
                key={item}
                style={{
                  width: "auto",
                  height: "300px",
                  borderRadius: "12px",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "visible",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scrollSnapAlign: "center",
                  scrollSnapStop: "always",
                }}
              >
                {/* Speech Bubble */}
                <div
                  style={{
                    position: "absolute",
                    top: "-45px",
                    left: "50%",
                    transform: index === activeIndex ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-10px)",
                    opacity: index === activeIndex ? 1 : 0,
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
                  src="/xboom.png"
                  alt={`XBOOM ${item}`}
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
                    transform: index === activeIndex ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
                    opacity: index === activeIndex ? 1 : 0,
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
            ))}
          </div>
        </div>
        
        {/* Indicator Dots */}
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
      </div>
    </>
  );
}

