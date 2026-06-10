'use client';

import { useEffect } from 'react';

/**
 * Client component that sets html[lang] and body[class] attributes
 * at runtime so the root layout doesn't need to know the locale.
 */
export default function LangSetter({
  locale,
  fontClasses,
}: {
  locale: string;
  fontClasses: string;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    // Apply font CSS variables to <body>
    fontClasses.split(' ').forEach((cls) => {
      if (cls) document.body.classList.add(cls);
    });
  }, [locale, fontClasses]);

  return null;
}
