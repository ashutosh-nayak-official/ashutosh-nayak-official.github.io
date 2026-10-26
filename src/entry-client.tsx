import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App';
import { isLocale, localeRedirect } from './app/locale';
import { getLocalStorage, safeGet } from './app/storage';
import type { Locale } from './i18n';
import { applyStillMode, parseStillMode } from './app/stillMode';
import './styles/tokens.css';
import './styles/base.css';
import './styles/chapters.css';
import './styles/still.css';

const lang = document.documentElement.lang;
const locale: Locale = isLocale(lang) ? lang : 'en';

// ?still= capture mode (scripts/capture-stills.mjs); inert without the query.
const still = parseStillMode(window.location.search);
if (still) applyStillMode(still);

// Only the bare root follows the stored locale; an explicit /de/ /nl/ /pl/ link wins.
const target = still
  ? null
  : localeRedirect(safeGet(getLocalStorage(), 'ge-locale'), locale, window.location.pathname, window.location.hash);
if (target && import.meta.env.PROD) {
  window.location.replace(target);
} else {
  const root = document.getElementById('root')!;
  const app = (
    <StrictMode>
      <App locale={locale} />
    </StrictMode>
  );
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
