import { cn } from "@/lib/utils";

interface ScoreResultProps {
  score: number;
  category: string;
}

const categoryStyles: Record<string, string> = {
  Poor: "bg-destructive/10 text-destructive border-destructive/20",
  Moderate: "bg-warning/10 text-warning-foreground border-warning/20",
  Good: "bg-primary/10 text-primary border-primary/20",
  Excellent: "bg-success/10 text-success border-success/20",
};

const ScoreResult = ({ score, category }: ScoreResultProps) => {
  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <div className="relative w-28 h-28 rounded-full bg-card border-4 border-primary/20 flex items-center justify-center score-glow">
        <div className="text-center">
          <span className="block text-3xl font-serif font-bold text-primary">{score}</span>
          <span className="block text-xs text-muted-foreground font-medium">/ 32</span>
        </div>
      </div>
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold",
          categoryStyles[category] || categoryStyles.Moderate
        )}
      >
        {category}
      </span>
    </div>
  );
};

export default ScoreResult;
