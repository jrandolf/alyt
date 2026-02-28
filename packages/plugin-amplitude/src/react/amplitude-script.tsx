import Script from "next/script";

interface AmplitudeScriptProps {
  apiKey: string;
}

export function AmplitudeScript({ apiKey }: AmplitudeScriptProps) {
  return (
    <>
      <Script
        src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
        strategy="afterInteractive"
      />
      <Script id="amplitude-init" strategy="afterInteractive">
        {`window.amplitude.init('${apiKey}');`}
      </Script>
    </>
  );
}
