import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = 'reveal-up', rootMargin = '0px 0px -12% 0px', once = true }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        if (once) obs.disconnect();
      }
    }, { threshold: 0.12, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, once]);

  return (
    <div ref={ref} className={`${className} ${revealed ? 'revealed' : ''}`}>
      {children}
    </div>
  );
}
