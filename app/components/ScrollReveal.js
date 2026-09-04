"use client";
import { useState, useRef, useEffect } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  style = {},
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  ...props
}) {
  const [revealed, setRevealed] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    // If browser does not support IntersectionObserver, reveal immediately
    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold, rootMargin]);

  const combinedStyle = {
    ...style,
    transitionDelay: delay ? `${delay}ms` : style.transitionDelay,
  };

  return (
    <div
      ref={domRef}
      className={`scroll-reveal ${revealed ? "is-revealed" : ""} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </div>
  );
}
