/**
 * Links that open the Android app. The app registers the custom scheme
 * `wheresmytherapist://` (AndroidManifest) and maps these in
 * authLinkTarget() (app: lib/features/auth/presentation/auth_link_screen.dart):
 *   wheresmytherapist://login-callback/?token_hash=…&type=…  one-time sign-in
 *   wheresmytherapist://app/therapists/<id>                  therapist profile
 *
 * Custom-scheme links are not clickable in most mail apps and do nothing
 * when the app isn't installed, so we never put them in an email directly:
 * emails link to a web page, and the page's button uses an Android
 * `intent://` URL that falls back to a web address when the app is missing.
 */
export const APP_SCHEME = "wheresmytherapist";
export const ANDROID_PACKAGE = process.env.NEXT_PUBLIC_ANDROID_PACKAGE || "com.example.wheresmytherapist";
/** Optional: set once the app is on the Play Store. */
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "";

/** `host/path?query` after the scheme, e.g. "app/therapists/<id>". */
export function androidIntentUrl(target: string, fallbackUrl: string) {
  return (
    `intent://${target}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
  );
}

export function isAndroid(ua: string) {
  return /android/i.test(ua);
}
