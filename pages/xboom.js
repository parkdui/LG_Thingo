import Head from "next/head";

export default function Xboom() {
  return (
    <>
      <Head>
        <title>Xboom - Thingo App</title>
        <meta name="description" content="Xboom page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <p
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              fontSize: "14pt",
              lineHeight: "130%",
              letterSpacing: "-0.02em",
              color: "#787878",
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
              fontSize: "24pt",
              lineHeight: "130%",
              letterSpacing: "-0.02em",
              color: "#000",
              margin: 0,
            }}
          >
            누구와 대화할까요?
          </h1>
        </div>
      </div>
    </>
  );
}

