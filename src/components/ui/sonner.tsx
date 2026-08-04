"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // Square corners, matching the rest of the app's rounded-none
          // convention (cards, buttons, inputs).
          "--border-radius": "0px",
          // Success: black bg, white text — deliberately monochrome/high-
          // contrast rather than the default green, to match the app's
          // black-and-white-first visual language.
          "--success-bg": "#0f172a",
          "--success-text": "#ffffff",
          "--success-border": "#0f172a",
          // Error: red bg, white text.
          "--error-bg": "#dc2626",
          "--error-text": "#ffffff",
          "--error-border": "#dc2626",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
