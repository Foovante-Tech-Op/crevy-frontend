"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CommandPalette } from "@/components/CommandPalette";
import type { TRole } from "@/types/user.types";

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

/**
 * Returns the palette controls, or null outside the provider.
 *
 * Null rather than a throw: DashboardHeader is also rendered in contexts that
 * do not mount the provider, and a search button that quietly does nothing
 * there is better than a crashed header.
 */
export const useCommandPalette = () => useContext(CommandPaletteContext);

/** True when focus is somewhere the user is typing real text. */
const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

export function CommandPaletteProvider({
  role,
  children,
}: {
  role: TRole;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Same shape as the sidebar's Cmd+B handler in ui/sidebar.tsx.
      // `k` is free; `b` is taken by the sidebar toggle.
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;

      // Don't steal the shortcut out from under someone typing in a form.
      // Once the palette is open its own input is an INPUT, so this also
      // means Cmd+K cannot close it — closing is Escape, which the dialog
      // already handles.
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} role={role} />
    </CommandPaletteContext.Provider>
  );
}
