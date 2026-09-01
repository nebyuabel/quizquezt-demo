// src/components/quiz/QuizQuestion.tsx
"use client";

interface Option {
  label: string;
  text: string;
}

interface QuizQuestionProps {
  question: {
    question_text: string;
    options: Option[];
  };
  index: number;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  onFlag: () => void;
  flagged: boolean;
}

export default function QuizQuestion({
  question,
  index,
  selectedAnswer,
  onSelect,
  onFlag,
  flagged,
}: QuizQuestionProps) {
  const { question_text, options } = question;

  return (
    <div className="bg-surface-charcoal rounded-[24px] p-md md:p-lg shadow-xl relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="flex items-center justify-between mb-lg pt-sm">
        <span className="font-label-md text-label-md text-primary bg-primary/10 px-sm py-base rounded-full border border-primary/20">
          Question {index + 1} of {options.length}
        </span>
        <div
          className="flex items-center gap-xs text-text-muted hover:text-on-surface transition-colors cursor-pointer"
          onClick={onFlag}
        >
          <span className="material-symbols-outlined text-[18px]">
            {flagged ? "flag" : "flag"}
          </span>
          <span className="font-label-sm text-label-sm">
            {flagged ? "Flagged" : "Flag for review"}
          </span>
        </div>
      </div>

      <div className="font-body-lg text-body-lg text-on-surface mb-xl leading-relaxed">
        {question_text}
      </div>

      <div className="flex flex-col gap-sm">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.label;
          return (
            <label
              key={opt.label}
              className={`relative flex items-center p-md rounded-xl bg-surface-container cursor-pointer transition-all hover:bg-surface-container-high group ${
                isSelected ? "bg-primary/5" : ""
              }`}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={opt.label}
                checked={isSelected}
                onChange={() => onSelect(opt.label)}
                className="peer sr-only"
              />
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-md transition-colors ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-outline-variant"
                }`}
              >
                <span
                  className={`font-label-md text-label-md ${isSelected ? "text-on-primary" : "text-on-surface-variant"}`}
                >
                  {opt.label}
                </span>
              </div>
              <span className="font-body-md text-body-md text-on-surface flex-1">
                {opt.text}
              </span>
              <div
                className={`absolute inset-0 rounded-xl border-2 pointer-events-none transition-colors ${
                  isSelected ? "border-primary/50" : "border-transparent"
                }`}
              ></div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
