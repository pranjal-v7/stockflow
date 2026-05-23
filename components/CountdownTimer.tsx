"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string; // ISO date string
  reservationId: string;
  onExpired: () => void;
}

export default function CountdownTimer({ expiresAt, reservationId, onExpired }: CountdownTimerProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [releasing, setReleasing] = useState(false);

  const autoRelease = useCallback(async () => {
    if (releasing) return;
    setReleasing(true);
    try {
      await fetch(`/api/reservations/${reservationId}/release`, { method: "POST" });
    } catch (e) {
      console.error("Auto-release failed", e);
    }
    onExpired();
    router.refresh();
  }, [reservationId, onExpired, router, releasing]);

  useEffect(() => {
    const calcSeconds = () => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      return Math.max(0, diff);
    };

    setSecondsLeft(calcSeconds());

    const interval = setInterval(() => {
      const s = calcSeconds();
      setSecondsLeft(s);
      if (s === 0) {
        clearInterval(interval);
        autoRelease();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, autoRelease]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 60;
  const pct = (secondsLeft / (15 * 60)) * 100;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      isUrgent
        ? "bg-red-500/10 border-red-500/30 text-red-400"
        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
    }`}>
      {isUrgent ? <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" /> : <Clock className="w-4 h-4 shrink-0" />}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">Reserved — expires in</span>
          <span className="font-mono font-bold text-sm">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-black/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-red-400" : "bg-amber-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
