"use client";
import { useRef, useState, useEffect } from "react";

export default function useReveal(options) {
  var threshold = (options && options.threshold) || 0.15;
  var ref = useRef(null);
  var [inView, setInView] = useState(false);

  useEffect(function () {
    var el = ref.current;
    if (!el) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: threshold }
    );

    observer.observe(el);
    return function () { observer.disconnect(); };
  }, [threshold]);

  return { ref: ref, inView: inView };
}
