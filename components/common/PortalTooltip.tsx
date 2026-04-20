"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import { cn } from "@/lib/cn";

export type PortalTooltipPlacement = "below" | "above";

const VIEW_MARGIN = 16;

/**
 * Horizontal position: blend pointer (or trigger center) with viewport center so the
 * popup sits more toward the middle on small screens and near edges, then clamp to
 * keep the full box on-screen.
 */
function blendXTowardViewportCenter(
  pointerOrFallbackX: number,
  viewportWidth: number,
  popupHalfWidth: number
): number {
  const center = viewportWidth / 2;
  // Narrower viewports pull harder toward the middle (better for one-handed mobile).
  const narrowT = Math.min(1, Math.max(0, (720 - viewportWidth) / 480));
  const blend = 0.32 + 0.48 * narrowT;
  const x = pointerOrFallbackX * (1 - blend) + center * blend;
  const minX = VIEW_MARGIN + popupHalfWidth;
  const maxX = viewportWidth - VIEW_MARGIN - popupHalfWidth;
  if (minX > maxX) {
    return viewportWidth / 2;
  }
  return Math.min(maxX, Math.max(minX, x));
}

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
  const popupRef = useRef<HTMLDivElement>(null);
  /** Latest pointer X while over trigger; null = use trigger horizontal center (e.g. keyboard). */
  const pointerXRef = useRef<number | null>(null);
  const openRef = useRef(false);
  const positionRafRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string }>({
    top: 0,
    left: 0,
    transform: "translateX(-50%)"
  });

  const updatePosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const popupEl = popupRef.current;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = popupEl?.offsetWidth ?? 0;
    const th = popupEl?.offsetHeight ?? 0;
    const halfW = Math.max(tw / 2, 1);

    const triggerCenterX = r.left + r.width / 2;
    const px = pointerXRef.current;
    const anchorX =
      px != null && Number.isFinite(px) ? px : triggerCenterX;

    const left = blendXTowardViewportCenter(anchorX, vw, halfW);

    const fitsBelow = th <= 0 || r.bottom + gap + th <= vh - VIEW_MARGIN;
    const fitsAbove = th <= 0 || r.top - gap - th >= VIEW_MARGIN;

    let top: number;
    let transform: string;

    if (placement === "below") {
      if (fitsBelow || !fitsAbove) {
        top = r.bottom + gap;
        transform = "translateX(-50%)";
      } else {
        top = r.top - gap;
        transform = "translate(-50%, -100%)";
      }
    } else {
      if (fitsAbove || !fitsBelow) {
        top = r.top - gap;
        transform = "translate(-50%, -100%)";
      } else {
        top = r.bottom + gap;
        transform = "translateX(-50%)";
      }
    }

    setCoords({ top, left, transform });
  }, [placement, gap]);

  const schedulePositionUpdate = useCallback(() => {
    if (positionRafRef.current != null) return;
    positionRafRef.current = requestAnimationFrame(() => {
      positionRafRef.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  const capturePointerX = useCallback((e: ReactPointerEvent<HTMLSpanElement>) => {
    pointerXRef.current = e.clientX;
  }, []);

  const handlePointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>) => {
      pointerXRef.current = e.clientX;
      openRef.current = true;
      setOpen(true);
    },
    []
  );

  const cancelScheduledPosition = useCallback(() => {
    if (positionRafRef.current != null) {
      cancelAnimationFrame(positionRafRef.current);
      positionRafRef.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    cancelScheduledPosition();
    pointerXRef.current = null;
    openRef.current = false;
    setOpen(false);
  }, [cancelScheduledPosition]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>) => {
      pointerXRef.current = e.clientX;
      if (openRef.current) {
        schedulePositionUpdate();
      }
    },
    [schedulePositionUpdate]
  );

  useLayoutEffect(() => {
    openRef.current = open;
  }, [open]);

  useLayoutEffect(
    () => () => {
      if (positionRafRef.current != null) {
        cancelAnimationFrame(positionRafRef.current);
        positionRafRef.current = null;
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    const popupEl = popupRef.current;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && popupEl) {
      ro = new ResizeObserver(() => updatePosition());
      ro.observe(popupEl);
    }
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      ro?.disconnect();
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
        ref={popupRef}
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
        onPointerDown={capturePointerX}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onFocus={() => {
          pointerXRef.current = null;
          openRef.current = true;
          setOpen(true);
        }}
        onBlur={() => {
          cancelScheduledPosition();
          pointerXRef.current = null;
          openRef.current = false;
          setOpen(false);
        }}
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
