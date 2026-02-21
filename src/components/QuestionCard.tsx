import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "Never", shortLabel: "N", value: 1 },
  { label: "Sometimes", shortLabel: "S", value: 2 },
  { label: "Often", shortLabel: "O", value: 3 },
  { label: "Routinely", shortLabel: "R", value: 4 },
];

interface QuestionCardProps {
  index: number;
  question: string;
  domain: string;
  value: number | null;
  onChange: (value: number) => void;
}

const QuestionCard = ({ index, question, domain, value, onChange }: QuestionCardProps) => {
  return (
    <div
      className="rounded-lg border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:card-glow"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="font-medium text-card-foreground leading-snug">{question}</p>
          <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {domain}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-md border px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              value === opt.value
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <span className="block sm:hidden">{opt.label}</span>
            <span className="hidden sm:block">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
