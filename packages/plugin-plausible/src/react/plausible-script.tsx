import Script from "next/script";

interface PlausibleScriptProps {
  domain: string;
  apiHost?: string;
}

export function PlausibleScript({
  domain,
  apiHost = "https://plausible.io",
}: PlausibleScriptProps) {
  return (
    <Script
      defer
      data-domain={domain}
      src={`${apiHost}/js/script.js`}
      strategy="afterInteractive"
    />
  );
}
