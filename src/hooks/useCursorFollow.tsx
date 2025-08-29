import { useEffect, useState, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const useCursorFollow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const trailPoints = useRef<TrailPoint[]>([]);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const smoothMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Create canvas for trail
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9996";
    canvas.style.mixBlendMode = "screen";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    document.body.appendChild(canvas);
    canvasRef.current = canvas;
    ctxRef.current = ctx;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    const drawTrail = () => {
      if (!ctxRef.current || !canvasRef.current) return;

      const ctx = ctxRef.current;
      const now = Date.now();

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Remove old trail points (older than 300ms for shorter trail)
      trailPoints.current = trailPoints.current.filter(
        (point) => now - point.timestamp < 300
      );

      if (trailPoints.current.length < 2) {
        rafId.current = requestAnimationFrame(drawTrail);
        return;
      }

      // Draw trail with comet-like effect
      ctx.save();

      // Draw from oldest to newest for proper layering
      for (let i = 1; i < trailPoints.current.length; i++) {
        const start = trailPoints.current[i - 1];
        const end = trailPoints.current[i];

        // Calculate position in trail (0 = tail, 1 = head)
        const positionInTrail = i / (trailPoints.current.length - 1);

        // Age factor for fading
        const age = (now - end.timestamp) / 300;
        const ageFactor = 1 - age;

        // Opacity increases towards the head
        const opacity = ageFactor * positionInTrail * 0.8;

        // Line width - thicker at the head, thinner at tail
        // Creates comet-like bulb effect at front
        const baseWidth = 20; // Maximum width at head
        const minWidth = 2; // Minimum width at tail
        const lineWidth =
          minWidth + (baseWidth - minWidth) * positionInTrail * positionInTrail;

        // Draw main trail segment
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        // Color gradient along the trail
        const gradient = ctx.createLinearGradient(
          start.x,
          start.y,
          end.x,
          end.y
        );
        gradient.addColorStop(0, `rgba(255, 215, 0, ${opacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${opacity})`);
        gradient.addColorStop(1, `rgba(255, 200, 0, ${opacity * 0.8})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Add extra glow for the head area
        if (positionInTrail > 0.7) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = `rgba(255, 215, 0, ${opacity})`;
          ctx.stroke();
        }
      }

      // Draw a bright circular head at the current position
      if (trailPoints.current.length > 0) {
        const head = trailPoints.current[trailPoints.current.length - 1];
        const headRadius = 10;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          head.x,
          head.y,
          0,
          head.x,
          head.y,
          headRadius * 2
        );
        glowGradient.addColorStop(0, "rgba(255, 215, 0, 0.8)");
        glowGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.4)");
        glowGradient.addColorStop(1, "rgba(255, 215, 0, 0)");

        ctx.beginPath();
        ctx.arc(head.x, head.y, headRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.arc(head.x, head.y, headRadius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 235, 100, 0.9)";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255, 215, 0, 1)";
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
      rafId.current = requestAnimationFrame(drawTrail);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Update smooth position for cursor elements
      smoothMousePos.current = { x, y };
      setMousePosition({ x, y });
      setIsVisible(true);
      setIsMoving(true);

      // Add point to trail with some minimum distance to avoid too many points
      const lastPoint = trailPoints.current[trailPoints.current.length - 1];
      if (
        !lastPoint ||
        Math.abs(lastPoint.x - x) > 2 ||
        Math.abs(lastPoint.y - y) > 2
      ) {
        trailPoints.current.push({
          x,
          y,
          timestamp: Date.now(),
        });
      }

      // Limit trail points
      if (trailPoints.current.length > 30) {
        trailPoints.current.shift();
      }

      // Clear and set new timeout
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
      }

      moveTimeout.current = setTimeout(() => {
        setIsMoving(false);
      }, 100);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsMoving(false);
      trailPoints.current = [];
    };

    // Start animation loop
    rafId.current = requestAnimationFrame(drawTrail);

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
      }

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, []);

  return { mousePosition, isVisible, isMoving };
};
