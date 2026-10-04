/**
 * Cookie consent, stored in a first-party cookie so the choice survives
 * across visits and is readable before any Google script runs.
 *
 * Format: "v1:a1:m0" (analytics on, marketing off). 180 days.
 * Bump CONSENT_VERSION if the cookie list changes materially — everyone
 * gets asked again.
 */
export const CONSENT_COOKIE = "wmt_consent";
export const CONSENT_VERSION = "v1";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export type Consent = { analytics: boolean; marketing: boolean };

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  const [v, a, m] = decodeURIComponent(raw).split(":");
  if (v !== CONSENT_VERSION) return null;
  return { analytics: a === "a1", marketing: m === "m1" };
}

export function serializeConsent(c: Consent) {
  return `${CONSENT_VERSION}:${c.analytics ? "a1" : "a0"}:${c.marketing ? "m1" : "m0"}`;
}

/** Google Consent Mode v2 signals for a choice. */
export function gtagConsent(c: Consent) {
  return {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
  };
}

/**
 * Runs inline in <head> before gtag.js: everything denied by default,
 * then the stored choice (if any) applied immediately so returning
 * visitors aren't counted as "denied" for their first page view.
 */
export function consentBootstrapScript(tagId: string) {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]+)/);if(m){var p=decodeURIComponent(m[1]).split(':');if(p[0]==='${CONSENT_VERSION}'){var a=p[1]==='a1',k=p[2]==='m1';gtag('consent','update',{analytics_storage:a?'granted':'denied',ad_storage:k?'granted':'denied',ad_user_data:k?'granted':'denied',ad_personalization:k?'granted':'denied'});}}}catch(e){}
gtag('js', new Date());
gtag('config', '${tagId}');`;
}
