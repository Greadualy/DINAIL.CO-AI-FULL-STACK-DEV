'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function forceScrollTop() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
}

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const navEntries = performance.getEntriesByType('navigation');
    const navType = (navEntries[0] as PerformanceNavigationTiming | undefined)?.type;
    const isReload = navType === 'reload';

    if (window.location.hash && (isReload || pathname === '/')) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }

    forceScrollTop();
    const rafId = window.requestAnimationFrame(() => {
      forceScrollTop();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      forceScrollTop();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
