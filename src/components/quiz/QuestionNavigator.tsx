"use client";

interface QuestionNavigatorProps {
  total: number;
  current: number;
  answers: Record<number, string>;
  flagged: Record<number, boolean>;
  onSelect: (index: number) => void;
}

export default function QuestionNavigator({
  total,
  current,
  answers,
  flagged,
  onSelect,
}: QuestionNavigatorProps) {
  const getStatus = (index: number) => {
    if (answers[index]) return "answered";
    if (flagged[index]) return "flagged";
    return "unanswered";
  };

  return (
    <div className="bg-surface-charcoal rounded-xl p-md shadow-md">
      <h3 className="font-label-md text-label-md text-on-surface mb-md">
        Question Navigator
      </h3>
      <div className="grid grid-cols-5 gap-sm">
        {Array.from({ length: total }).map((_, idx) => {
          const status = getStatus(idx);
          const isCurrent = idx === current;
          let className =
            "w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer font-label-md text-label-md transition-colors";
          if (isCurrent) {
            className +=
              " bg-primary text-on-primary shadow-[0_0_10px_rgba(157,78,221,0.4)]";
          } else if (status === "answered") {
            className +=
              " bg-success-green/20 border border-success-green/30 text-success-green hover:bg-success-green/30";
          } else if (status === "flagged") {
            className +=
              " bg-warning-orange/20 border border-warning-orange/30 text-warning-orange hover:bg-warning-orange/30";
          } else {
            className +=
              " bg-surface-container text-on-surface-variant hover:bg-surface-container-high";
          }
          return (
            <div key={idx} className={className} onClick={() => onSelect(idx)}>
              {idx + 1}
            </div>
          );
        })}
      </div>
      <div className="mt-md pt-md border-t border-outline-variant/20 flex flex-col gap-sm">
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded-full bg-success-green/40 border border-success-green/60"></div>
          <span className="font-label-sm text-label-sm text-text-muted">
            Answered ({Object.keys(answers).length})
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded-full bg-surface-container border border-outline-variant/40"></div>
          <span className="font-label-sm text-label-sm text-text-muted">
            Unanswered ({total - Object.keys(answers).length})
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <div className="w-3 h-3 rounded-full bg-warning-orange"></div>
          <span className="font-label-sm text-label-sm text-text-muted">
            Flagged for review (
            {Object.keys(flagged).filter((k) => flagged[k]).length})
          </span>
        </div>
      </div>
    </div>
  );
}
