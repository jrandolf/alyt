import Script from "next/script";

interface PlausibleScriptProps {
  apiHost?: string;
  domain: string;
}

export function PlausibleScript({
  domain,
  apiHost = "https://plausible.io",
}: PlausibleScriptProps) {
  return (
    <Script
      data-domain={domain}
      defer
      src={`${apiHost}/js/script.js`}
      strategy="afterInteractive"
    />
  );
}
