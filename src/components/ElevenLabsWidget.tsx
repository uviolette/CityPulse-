import { useEffect, useRef } from 'react';

export function ElevenLabsWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const existingScript = document.querySelector('script[src*="elevenlabs"]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';

    script.onload = () => {
      scriptLoadedRef.current = true;
      console.log('ElevenLabs widget script loaded');
    };

    script.onerror = () => {
      console.error('Failed to load ElevenLabs widget script');
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode === document.body) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div ref={widgetRef}>
      <elevenlabs-convai agent-id="agent_5501kgwp5sddfraschf1mdkvOn6y"></elevenlabs-convai>
    </div>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id': string }, HTMLElement>;
    }
  }
}
