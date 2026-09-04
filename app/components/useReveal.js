"use client";
import { useCallback, useState, useRef, useEffect } from "react";

export default function useReveal(options) {
  var threshold = (options && options.threshold !== undefined) ? options.threshold : 0.08;
  var rootMargin = (options && options.rootMargin !== undefined) ? options.rootMargin : "0px 0px -30px 0px";
  var [inView, setInView] = useState(false);
  var domNode = useRef(null);
  var observerRef = useRef(null);

  var setupObserver = useCallback((node) => {
    if (!node) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setInView(true);
            if (observerRef.current && entry.target) {
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: threshold, rootMargin: rootMargin }
    );

    observerRef.current.observe(node);
  }, [threshold, rootMargin]);

  useEffect(() => {
    // Wait for scroll-to-top to settle before initiating intersection checks
    var rafId = requestAnimationFrame(() => {
      if (domNode.current) {
        setupObserver(domNode.current);
      }
    });

    var handleReset = () => {
      setInView(false);
      requestAnimationFrame(() => {
        if (domNode.current) {
          setupObserver(domNode.current);
        }
      });
    };

    window.addEventListener("sipher-nav-reset", handleReset);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("sipher-nav-reset", handleReset);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver]);

  var refCallback = useCallback(function (node) {
    domNode.current = node;
    if (node) {
      requestAnimationFrame(() => {
        if (domNode.current) setupObserver(domNode.current);
      });
    }
  }, [setupObserver]);

  return { ref: refCallback, inView: inView };
}
