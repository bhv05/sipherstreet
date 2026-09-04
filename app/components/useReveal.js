"use client";
import { useCallback, useState, useRef } from "react";

export default function useReveal(options) {
  var threshold = (options && options.threshold !== undefined) ? options.threshold : 0.08;
  var rootMargin = (options && options.rootMargin !== undefined) ? options.rootMargin : "0px 0px -30px 0px";
  var [inView, setInView] = useState(false);
  var observerRef = useRef(null);

  var refCallback = useCallback(
    function (node) {
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
            { threshold: threshold, rootMargin: rootMargin }
          );
        }
        observerRef.current.observe(node);
      }
    },
    [threshold, rootMargin]
  );

  return { ref: refCallback, inView: inView };
}
