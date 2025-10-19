// Minimal Supabase OAuth helper for client-side login (Vite)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_TO = import.meta.env.VITE_SUPABASE_REDIRECT_TO || import.meta.env.VITE_SUPABASE_REDIRECT || (typeof window !== 'undefined' ? `${window.location.origin}/__dev/oauth-callback` : 'http://localhost:3000/__dev/oauth-callback');

// --- BEGIN: client-side auth URL guard (inserido) ---
(function () {
  if (typeof window === 'undefined') return;

  const PROD_HOST = 'spaceshiponsol.vercel.app';

  function rewriteRedirectParams(urlStr) {
    try {
      const url = new URL(urlStr, window.location.href);
      let changed = false;

      // Normalize param names: redirect_to (supabase) and redirect_uri (oauth)
      if (url.searchParams.has('redirect_to')) {
        const current = url.searchParams.get('redirect_to') || '';
        if (!current || current.includes(PROD_HOST) || current !== REDIRECT_TO) {
          url.searchParams.set('redirect_to', REDIRECT_TO);
          changed = true;
        }
      }
      if (url.searchParams.has('redirect_uri')) {
        const current = url.searchParams.get('redirect_uri') || '';
        if (!current || current.includes(PROD_HOST) || current !== REDIRECT_TO) {
          url.searchParams.set('redirect_uri', REDIRECT_TO);
          changed = true;
        }
      }

      // If URL points to production auth host, ensure redirect_to param exists and points to REDIRECT_TO
      if (url.host && url.host.includes(PROD_HOST) && !url.searchParams.has('redirect_to')) {
        url.searchParams.set('redirect_to', REDIRECT_TO);
        changed = true;
      }

      return changed ? url.toString() : urlStr;
    } catch (e) {
      return urlStr;
    }
  }

  // Override window.open
  const origOpen = window.open.bind(window);
  window.open = function (url, ...args) {
    try {
      const u = (typeof url === 'string') ? rewriteRedirectParams(url) : url;
      return origOpen(u, ...args);
    } catch (e) { return origOpen(url, ...args); }
  };

  // Override location.assign / replace
  const origAssign = window.location.assign.bind(window.location);
  const origReplace = window.location.replace.bind(window.location);
  window.location.assign = function (url) {
    const u = (typeof url === 'string') ? rewriteRedirectParams(url) : url;
    return origAssign(u);
  };
  window.location.replace = function (url) {
    const u = (typeof url === 'string') ? rewriteRedirectParams(url) : url;
    return origReplace(u);
  };

  // Intercept clicks on anchors to rewrite href before navigation
  document.addEventListener('click', (ev) => {
    try {
      const a = ev.target.closest && ev.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      const rewritten = rewriteRedirectParams(href);
      if (rewritten !== href) {
        ev.preventDefault();
        // small timeout to let other handlers finish
        setTimeout(() => { window.location.href = rewritten; }, 0);
      }
    } catch (e) { /* ignore */ }
  }, true);

  // Patch existing anchors on load
  try {
    Array.from(document.getElementsByTagName('a')).forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const rewritten = rewriteRedirectParams(href);
      if (rewritten !== href) a.setAttribute('href', rewritten);
    });
  } catch (e) { /* ignore */ }

  // Expose debug helper
  window.__authFix = {
    REDIRECT_TO,
    rewrite: rewriteRedirectParams,
    log: () => console.info('[auth-fix]', { REDIRECT_TO, origin: window.location.origin })
  };
  console.info('[auth-fix] initialized', { REDIRECT_TO, origin: window.location.origin });
})();
// --- END: client-side auth URL guard ---

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[auth] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. OAuth will fail if used.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Start Google OAuth sign-in via Supabase and force redirectTo for dev.
 * Usage: import { loginWithGoogle } from './auth'; await loginWithGoogle();
 */
export async function loginWithGoogle() {
  try {
    // supabase-js v2 syntax
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_TO
      }
    });
    // The above call will redirect the browser to Google's consent screen.
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth] loginWithGoogle error', err);
    throw err;
  }
}

/**
 * Debug helper - prints effective values to console
 */
export function logAuthDebug() {
  // eslint-disable-next-line no-console
  console.info('[auth debug]', {
    SUPABASE_URL,
    REDIRECT_TO,
    locationOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
    import_meta_env: typeof import.meta !== 'undefined' ? import.meta.env : undefined
  });
}

export default {
  supabase,
  loginWithGoogle,
  logAuthDebug
};