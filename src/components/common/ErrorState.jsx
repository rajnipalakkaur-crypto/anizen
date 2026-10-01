import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorState({ message = "We couldn't load this right now.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl glass grid place-items-center mb-5">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <p className="font-display text-lg mb-2">Something went wrong</p>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost h-10">
          <RotateCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}