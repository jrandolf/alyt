import Script from "next/script";

declare const process: { env: Record<string, string | undefined> };

interface GAScriptProps {
  measurementId?: string;
}

export function GAScript({ measurementId }: GAScriptProps) {
  const id = measurementId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!id) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
