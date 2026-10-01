import React from "react";

export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl glass grid place-items-center mb-5">
          <Icon className="w-7 h-7 text-primary" />
        </div>
      )}
      <p className="font-display text-lg mb-2">{title}</p>
      {text && <p className="text-muted-foreground text-sm max-w-sm mb-6">{text}</p>}
      {children}
    </div>
  );
}