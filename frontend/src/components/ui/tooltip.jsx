import React from "react";

// Minimal Tooltip implementation to satisfy shadcn/ui-style exports.
// NOTE: This is a lightweight fallback using the native `title` attribute.
// It provides the named exports expected by the app.

const Tooltip = ({ content, children }) => {
  if (React.isValidElement(children)) {
    const existingTitle = children.props?.title;
    const title = content ?? existingTitle;
    return React.cloneElement(children, { title });
  }

  return <span title={content}>{children}</span>;
};

// shadcn/ui-style API compatibility (kept for import parity)
const TooltipProvider = ({ children }) => children;
const TooltipTrigger = ({ children }) => children;

const TooltipContent = ({ children, ...props }) => {
  // In this lightweight fallback, content is attached via `Tooltip`.
  // Returning null prevents duplicated DOM/tooltips.
  // Consumers should wrap trigger with <Tooltip content={...}>.
  void props;
  return null;
};

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};

export default Tooltip;


