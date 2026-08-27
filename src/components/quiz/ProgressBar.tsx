"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;
  return (
    <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
      <div
        className="h-full bg-primary shadow-[0_0_10px_rgba(157,78,221,0.5)] transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
