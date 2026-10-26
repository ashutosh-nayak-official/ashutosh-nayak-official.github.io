import { renderToString } from 'react-dom/server';
import App from './app/App';
import { LOCALES, localePath, t, type Locale } from './i18n';
import { NO_FLASH_SCRIPT } from './app/noFlash';

export { LOCALES, localePath, NO_FLASH_SCRIPT };

export function render(locale: Locale): string {
  return renderToString(<App locale={locale} />);
}

export function meta(locale: Locale) {
  return {
    title: t(locale, 'meta_title'),
    description: t(locale, 'meta_description'),
    path: localePath(locale),
  };
}
