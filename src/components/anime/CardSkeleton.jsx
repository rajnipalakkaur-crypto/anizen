import React from "react";

export default function CardSkeleton({ className = "" }) {
  return (
    <div className={className}>
      <div className="skeleton aspect-[2/3] rounded-2xl" />
      <div className="skeleton h-4 rounded mt-3 w-3/4" />
      <div className="skeleton h-3 rounded mt-2 w-1/2" />
    </div>
  );
}