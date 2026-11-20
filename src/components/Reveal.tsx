import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Fades its content up once it scrolls into view (instant when reduced motion is on, via CSS). */
export function Reveal({ as: Tag = 'div', delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal data-in={inView} className={className} style={{ '--delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
