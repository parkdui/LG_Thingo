import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function SplitText({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 5 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "left",
  onLetterAnimationComplete,
}) {
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current || !text) return;

    // 텍스트를 글자 단위로 분리
    const chars = text.split("");

    // 기존 내용 제거
    containerRef.current.innerHTML = "";

    // 각 글자를 span으로 감싸기
    const spans = [];
    chars.forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char; // 공백 처리
      span.style.display = "inline-block";
      span.style.opacity = from.opacity !== undefined ? from.opacity : 0;
      span.style.transform = `translateY(${from.y !== undefined ? from.y : 5}px)`;
      containerRef.current.appendChild(span);
      spans.push(span);
    });

    // 즉시 애니메이션 시작
    const animationDelay = delay / 1000;
    
    spans.forEach((span, index) => {
      gsap.to(span, {
        opacity: to.opacity !== undefined ? to.opacity : 1,
        y: to.y !== undefined ? to.y : 0,
        duration: duration,
        delay: animationDelay + index * animationDelay,
        ease: ease,
        onComplete: () => {
          if (index === spans.length - 1 && onLetterAnimationComplete) {
            onLetterAnimationComplete();
          }
        },
      });
    });
  }, { scope: containerRef, dependencies: [text] });

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        display: "inline-block",
        textAlign: textAlign,
      }}
    />
  );
}

