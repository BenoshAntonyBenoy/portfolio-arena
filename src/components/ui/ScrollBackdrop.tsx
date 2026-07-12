import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * Fixed full-viewport canvas that lives behind all content. Draws a gold
 * "constellation" (drifting nodes + proximity lines) around a central glow.
 * Scroll progress (0 at top → 1 at page bottom) drives how far the field
 * expands and how bright everything gets, so the page literally lights up as
 * you descend. The cursor adds a subtle parallax. Lightweight: capped node
 * count, capped DPR, paused while the tab is hidden, single static frame under
 * prefers-reduced-motion. The animated branch is capped at 30fps and uses a
 * smaller field on coarse-pointer devices to protect mid-range mobile GPUs.
 */
export function ScrollBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ACCENT = "216,168,114";
    let width = 0;
    let height = 0;
    let pixelRatio = 0;
    let raf = 0;
    let lastFrame = 0;
    let progress = 0; // smoothed
    let targetProgress = 0;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const mouse = { x: 0.5, y: 0.5, active: false };

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];

    function seedNodes() {
      const minimum = coarsePointer ? 18 : 24;
      const maximum = coarsePointer ? 32 : 48;
      const density = coarsePointer ? 48000 : 34000;
      const count = Math.max(minimum, Math.min(maximum, Math.floor((width * height) / density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.5 + 0.6,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Drive size from the viewport (window/doc), NOT the canvas's own client
      // box. A <canvas> is a replaced element, so reading its size back to set
      // its size creates a ResizeObserver feedback loop that explodes the buffer.
      const nextWidth = window.innerWidth || document.documentElement.clientWidth;
      const nextHeight = window.innerHeight || document.documentElement.clientHeight;
      if (!nextWidth || !nextHeight) return;
      if (nextWidth === width && nextHeight === height && dpr === pixelRatio) return;
      width = nextWidth;
      height = nextHeight;
      pixelRatio = dpr;
      // Explicit CSS size pins the layout box to the viewport (a replaced
      // element would otherwise lay out at its intrinsic buffer size).
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function readScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }

    function draw() {
      const p = progress;
      const cx = width / 2;
      const cy = height / 2;
      ctx!.clearRect(0, 0, width, height);

      // --- central glow: grows + brightens with scroll ---
      const coreR = Math.min(width, height) * (0.14 + p * 0.55);
      const coreA = 0.06 + p * 0.22;
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      glow.addColorStop(0, `rgba(${ACCENT},${coreA})`);
      glow.addColorStop(0.6, `rgba(${ACCENT},${coreA * 0.35})`);
      glow.addColorStop(1, `rgba(${ACCENT},0)`);
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, width, height);

      // --- expansion + cursor parallax ---
      const expand = 0.82 + p * 0.36;
      const mox = mouse.active ? (mouse.x - 0.5) * 36 : 0;
      const moy = mouse.active ? (mouse.y - 0.5) * 36 : 0;

      const pts = nodes.map((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        return {
          x: cx + (n.x - cx) * expand + mox * n.r,
          y: cy + (n.y - cy) * expand + moy * n.r,
          r: n.r,
        };
      });

      // --- proximity lines ---
      const maxDist = 130;
      const maxDistSquared = maxDist * maxDist;
      const lineMax = 0.09 + p * 0.4;
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < maxDistSquared) {
            const d = Math.sqrt(distanceSquared);
            ctx!.strokeStyle = `rgba(${ACCENT},${(1 - d / maxDist) * lineMax})`;
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.stroke();
          }
        }
      }

      // --- nodes (bubbles) ---
      const nodeA = 0.28 + p * 0.5;
      ctx!.fillStyle = `rgba(${ACCENT},${nodeA})`;
      for (const pt of pts) {
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, pt.r * (1 + p * 0.7), 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop(timestamp: number) {
      if (timestamp - lastFrame >= 1000 / 30) {
        progress += (targetProgress - progress) * 0.11;
        draw();
        lastFrame = timestamp;
      }
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / width;
      mouse.y = e.clientY / height;
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) {
        lastFrame = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    readScroll();
    // Observe the document element (a stable viewport proxy) to self-heal if
    // the size wasn't ready at mount. Never observe the canvas itself — that
    // would feed its own size back into the resize and loop.
    const ro = new ResizeObserver(() => resize());
    ro.observe(document.documentElement);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", readScroll, { passive: true });
    if (!coarsePointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // Static, mid-brightness frame — no animation loop.
      progress = 0.5;
      targetProgress = 0.5;
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", readScroll);
      if (!coarsePointer) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />;
}
