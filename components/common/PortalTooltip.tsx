"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import { cn } from "@/lib/cn";

export type PortalTooltipPlacement = "below" | "above";

/**
 * Renders `popup` in a `document.body` portal with `position: fixed` so it is not clipped
 * by ancestor `overflow: hidden | auto` (e.g. sticky sidebars).
 */
export function PortalHoverPopup({
  placement = "below",
  gap = 6,
  popup,
  triggerClassName,
  popupClassName,
  children
}: {
  placement?: PortalTooltipPlacement;
  gap?: number;
  popup: ReactNode;
  triggerClassName?: string;
  popupClassName?: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string }>({
    top: 0,
    left: 0,
    transform: "translateX(-50%)"
  });

  const updatePosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left + r.width / 2;
    if (placement === "below") {
      setCoords({ top: r.bottom + gap, left, transform: "translateX(-50%)" });
    } else {
      setCoords({ top: r.top - gap, left, transform: "translate(-50%, -100%)" });
    }
  }, [placement, gap]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  const popupStyle: CSSProperties = {
    position: "fixed",
    top: coords.top,
    left: coords.left,
    transform: coords.transform,
    zIndex: 50000
  };

  const portal =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        role="tooltip"
        style={popupStyle}
        className={cn(
          "pointer-events-none w-max max-w-[min(42rem,calc(100vw-2rem))] print:hidden",
          popupClassName
        )}
      >
        {popup}
      </div>,
      document.body
    );

  return (
    <>
      <span
        ref={wrapRef}
        className={cn("relative inline-flex max-w-full", triggerClassName)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {portal}
    </>
  );
}

export function PortalTooltip({
  heading,
  titleFallback,
  lines,
  dottedUnderline,
  children,
  className
}: {
  heading: string;
  titleFallback: string;
  lines: string[];
  dottedUnderline?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <PortalHoverPopup
      placement="below"
      popupClassName="border-subtle bg-surface text-muted rounded-lg border px-4 py-3 text-left text-sm leading-relaxed shadow-xl"
      popup={
        <>
          <div className="text-parchment font-body text-base font-semibold">{heading}</div>
          <ul className="text-parchment-muted mt-2 list-disc space-y-1 pl-4 marker:text-muted">
            {lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </>
      }
      triggerClassName={className}
    >
      <span
        className={cn(
          "cursor-help text-sm",
          dottedUnderline &&
            "underline decoration-current/35 decoration-dotted underline-offset-[3px]"
        )}
        tabIndex={0}
        title={titleFallback}
      >
        {children}
      </span>
    </PortalHoverPopup>
  );
}
