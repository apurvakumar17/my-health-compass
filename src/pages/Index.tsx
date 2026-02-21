import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import QuestionCard from "@/components/QuestionCard";
import ScoreResult from "@/components/ScoreResult";
import ActionPlanCard from "@/components/ActionPlanCard";
import { Heart, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const QUESTIONS = [
  { question: "Balance time between work and play.", domain: "Stress management" },
  { question: "Get support from a network of caring people.", domain: "Social health" },
  { question: "Reach my target heart rate when exercising.", domain: "Physical activity" },
  { question: "Pace myself to prevent tiredness.", domain: "Energy regulation" },
  { question: "Practice relaxation or meditation for 15-20 minutes daily.", domain: "Mental health" },
  { question: "Attend educational programs on personal health care.", domain: "Preventive behavior" },
  { question: "Find each day interesting and challenging.", domain: "Psychological well-being" },
  { question: "Ask for information from health professionals.", domain: "Health responsibility" },
];

function getCategory(score: number) {
  if (score < 13) return "Poor";
  if (score <= 19) return "Moderate";
  if (score <= 25) return "Good";
  return "Excellent";
}

const Index = () => {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(8).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleChange = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a !== null);
  const totalScore = answers.reduce((sum, a) => sum + (a || 0), 0);
  const category = getCategory(totalScore);

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setSubmitted(true);

    // Find weak domains (score < 2)
    const weakDomains: string[] = [];
    const scores: Record<string, number> = {};
    answers.forEach((val, i) => {
      scores[QUESTIONS[i].domain] = val!;
      if (val! < 2) {
        weakDomains.push(QUESTIONS[i].domain);
      }
    });

    if (weakDomains.length === 0) {
      setAdvice("Great job! You don't have any critically weak areas. Keep maintaining your healthy lifestyle! 🌟");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const { data, error } = await supabase.functions.invoke("health-advice", {
        body: { weakDomains, scores },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAdvice(data.advice);
    } catch (err: any) {
      console.error("AI error:", err);
      setAiError("Could not generate recommendations. Please try again.");
      toast.error("Failed to generate action plan");
    } finally {
      setAiLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers(Array(8).fill(null));
    setSubmitted(false);
    setAdvice(null);
    setAiError(null);
    setAiLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container max-w-2xl py-8 sm:py-12 px-4">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Heart className="w-4 h-4" />
            <span>Health Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-2">
            Health-Promoting Lifestyle
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Answer 8 questions about your daily habits and receive a personalized action plan powered by AI.
          </p>
        </header>

        {/* Questions */}
        {!submitted && (
          <div className="space-y-4 mb-8">
            {QUESTIONS.map((q, i) => (
              <QuestionCard
                key={i}
                index={i}
                question={q.question}
                domain={q.domain}
                value={answers[i]}
                onChange={(val) => handleChange(i, val)}
              />
            ))}

            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full h-12 text-base font-semibold mt-4"
              size="lg"
            >
              Get My Results
            </Button>
          </div>
        )}

        {/* Results */}
        {submitted && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center animate-fade-in-up">
              <h2 className="font-serif text-2xl text-card-foreground mb-5">Your Score</h2>
              <ScoreResult score={totalScore} category={category} />
            </div>

            <ActionPlanCard advice={advice} loading={aiLoading} error={aiError} />

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full h-11 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
