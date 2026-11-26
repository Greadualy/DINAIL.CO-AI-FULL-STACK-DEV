'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface RevealTitleProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  style?: CSSProperties;
}

export default function RevealTitle({
  text,
  as: Tag = 'h2',
  className,
  style,
}: RevealTitleProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const wordEls = el.querySelectorAll('.reveal-title-word');
      if (wordEls.length === 0) return;

      gsap.fromTo(
        wordEls,
        {
          yPercent: 100,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <Tag ref={containerRef} className={className} style={style}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className="inline-block overflow-hidden"
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'top',
              paddingBottom: '0.1em',
              marginBottom: '-0.1em',
            }}
          >
            <span
              className="reveal-title-word"
              style={{
                display: 'inline-block',
                willChange: 'transform, opacity',
              }}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
