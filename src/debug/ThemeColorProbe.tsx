import { useEffect } from 'react';

const ENDPOINT =
  'http://127.0.0.1:7300/ingest/74da9515-41b8-40e4-9fa3-424569db16b9';

function send(
  location: string,
  message: string,
  hypothesisId: string,
  data: Record<string, unknown>,
  runId = 'pre-fix',
) {
  // #region agent log
  fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'bb12b2',
    },
    body: JSON.stringify({
      sessionId: 'bb12b2',
      location,
      message,
      hypothesisId,
      data,
      timestamp: Date.now(),
      runId,
    }),
  }).catch(() => {});
  // #endregion
}

let themeProbeRan = false;

/** One-shot runtime probe: which surfaces resolve to white / wrong colours (debug sessions only). */
export const ThemeColorProbe = () => {
  useEffect(() => {
    if (themeProbeRan) return;
    themeProbeRan = true;
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const main = document.querySelector('main');
    const aside = document.querySelector('aside');
    const floor = document.querySelector('[data-debug-floor-canvas]');

    const bg = (el: Element | null | undefined) =>
      el ? getComputedStyle(el).backgroundColor : 'missing';

    send(
      'ThemeColorProbe.tsx:mount',
      'computed backgrounds chain',
      'H1',
      {
        htmlBg: bg(html),
        bodyBg: bg(body),
        rootBg: bg(root),
        mainBg: bg(main),
        asideBg: bg(aside),
        floorCanvasBg: bg(floor),
      },
    );

    const appToken = getComputedStyle(html).getPropertyValue('--color-app').trim();
    const surfaceToken = getComputedStyle(html).getPropertyValue('--color-surface').trim();
    send(
      'ThemeColorProbe.tsx:tokens',
      'CSS custom properties on :root',
      'H3',
      { '--color-app': appToken || '(empty)', '--color-surface': surfaceToken || '(empty)' },
    );

    const whiteHits: { tag: string; cls: string; bg: string }[] = [];
    const scanRoot = main ?? root ?? body;
    for (const el of scanRoot.querySelectorAll('*')) {
      if (whiteHits.length >= 14) break;
      const c = getComputedStyle(el).backgroundColor;
      if (c === 'rgb(255, 255, 255)' || c === 'rgba(255, 255, 255, 1)') {
        const h = el as HTMLElement;
        whiteHits.push({
          tag: el.tagName,
          cls: (typeof h.className === 'string' ? h.className : '').slice(0, 100),
          bg: c,
        });
      }
    }
    send(
      'ThemeColorProbe.tsx:white-scan',
      'elements under main with solid white background',
      'H2',
      { count: whiteHits.length, samples: whiteHits },
    );

    const canvasEl = document.querySelector('canvas');
    send(
      'ThemeColorProbe.tsx:konva',
      'first canvas element parent chain bg',
      'H4',
      {
        canvasBg: bg(canvasEl),
        canvasParentBg: bg(canvasEl?.parentElement ?? null),
        canvasParentParentBg: bg(canvasEl?.parentElement?.parentElement ?? null),
      },
    );

    const probeBtn = document.querySelector('button');
    if (probeBtn) {
      const st = getComputedStyle(probeBtn);
      send(
        'ThemeColorProbe.tsx:button-focus-styles',
        'first button ring/offset (sample for H5)',
        'H5',
        {
          boxShadow: st.boxShadow?.slice(0, 120),
          outline: st.outline,
          outlineOffset: st.outlineOffset,
        },
      );
    }
  }, []);

  return null;
};
