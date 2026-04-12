// src/components/layout/AnimatedHeading.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  typingSpeed?: number;    // Time per character when typing
  deletingSpeed?: number;  // Time per character when deleting
  pauseAfterTyping?: number; // Pause after typing full text, before deleting
  pauseAfterDeleting?: number; // Pause after deleting all text, before retyping
  cursorClassName?: string;
}

export default function AnimatedHeading({
  text,
  className,
  typingSpeed = 70, 
  deletingSpeed = 35, 
  pauseAfterTyping = 2000, 
  pauseAfterDeleting = 500,  
  cursorClassName = 'inline-block w-px ml-1 bg-foreground animate-cursor-blink',
}: AnimatedHeadingProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const charIndexRef = useRef(0); 
  const isDeletingRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleAnimation = () => {
      if (isDeletingRef.current) {
        if (charIndexRef.current > 0) {
          charIndexRef.current -= 1;
          setDisplayedText(text.substring(0, charIndexRef.current));
          timeoutIdRef.current = setTimeout(handleAnimation, deletingSpeed);
        } else {
          isDeletingRef.current = false;
          timeoutIdRef.current = setTimeout(handleAnimation, pauseAfterDeleting);
        }
      } else {
        if (charIndexRef.current < text.length) {
          charIndexRef.current += 1;
          setDisplayedText(text.substring(0, charIndexRef.current));
          timeoutIdRef.current = setTimeout(handleAnimation, typingSpeed);
        } else {
          isDeletingRef.current = true;
          timeoutIdRef.current = setTimeout(handleAnimation, pauseAfterTyping);
        }
      }
    };

    setDisplayedText(''); 
    charIndexRef.current = 0; 
    isDeletingRef.current = false; 
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current); 
    }
    timeoutIdRef.current = setTimeout(handleAnimation, pauseAfterDeleting);


    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); 

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      clearInterval(cursorInterval);
    };
  }, [text, typingSpeed, deletingSpeed, pauseAfterTyping, pauseAfterDeleting]);

  const HeadingTag = className?.includes('text-4xl') || className?.includes('text-5xl') ? 'h1' : 'h2';

  return (
    <HeadingTag className={className}>
      {displayedText}
      {showCursor && <span className={cursorClassName} style={{ height: '1em' }}></span>}
    </HeadingTag>
  );
}
