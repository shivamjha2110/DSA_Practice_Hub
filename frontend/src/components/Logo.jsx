import React from "react";

export default function Logo({ className = "h-8 w-8" }) {
  return (
    <img src="/logo.svg" alt="AlgoBloom" className={className} />
  );
}
