"use client";
import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}

export default function Reveal({ children, className = "", delay = 0, direction = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fallback timer: force visibility after 800ms if observer fails to fire
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(timer);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -20px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const directionClass = 
    direction === "up" ? "translate-y-8" :
    direction === "left" ? "-translate-x-8" :
    direction === "right" ? "translate-x-8" : "";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${directionClass}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
