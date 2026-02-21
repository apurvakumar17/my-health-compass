import { Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ActionPlanCardProps {
  advice: string | null;
  loading: boolean;
  error: string | null;
}

const ActionPlanCard = ({ advice, loading, error }: ActionPlanCardProps) => {
  if (!loading && !advice && !error) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-card p-6 animate-fade-in-up card-glow">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-xl text-card-foreground">Your Action Plan</h3>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-muted-foreground py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Generating your personalized plan...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {advice && !loading && (
        <div className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">
          <ReactMarkdown>{advice}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ActionPlanCard;
