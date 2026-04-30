"use client";

import { useState, useEffect } from "react";

export function DynamicGreeting() {
  const [greeting, setGreeting] = useState("Hello.");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning.");
    else if (hour < 18) setGreeting("Good afternoon.");
    else setGreeting("Good evening.");
  }, []);

  return (
    <h1 className="text-[72px] leading-[1.1] tracking-[-0.03em] text-dark font-serif font-medium italic m-0">
      {greeting}
    </h1>
  );
}
