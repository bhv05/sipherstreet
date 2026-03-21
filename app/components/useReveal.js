"use client";
import { useCallback, useState, useRef } from "react";

export default function useReveal(options) {
  var threshold = (options && options.threshold) || 0.15;
  var [inView, setInView] = useState(false);
  var observerRef = useRef(null);

  var refCallback = useCallback(function (node) {
    if (node !== null) {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                setInView(true);
                if (observerRef.current) {
                  observerRef.current.unobserve(entry.target);
                }
              }
            });
          },
          { threshold: threshold }
        );
      }
      observerRef.current.observe(node);
    }
  }, [threshold]);

  return { ref: refCallback, inView: inView };
}
