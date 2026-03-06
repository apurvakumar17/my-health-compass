import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weakDomains, scores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const domainList = weakDomains.join(", ");
    // const systemPrompt = `You are a friendly, evidence-based health coach. You give short, practical, and encouraging advice. Use bullet points and keep it under 200 words. Do not use markdown headers. Use emoji sparingly for warmth.`;
    // const userPrompt = `The user completed a Health-Promoting Lifestyle assessment. Their weak areas (scored "Never") are: ${domainList}. Their full scores: ${JSON.stringify(scores)}. Give a short, actionable daily routine focusing on improving these weak areas. Be specific and encouraging.`;

    const systemPrompt = `
You are an intelligent Health Behaviour Agent that analyzes a user's lifestyle questionnaire and provides personalized wellness guidance.

Questionnaire details:
- 8 questions
- Each question is scored on a 4-point Likert scale:
1 = Never
2 = Sometimes
3 = Often
4 = Routinely

Total score range:
Minimum = 8
Maximum = 32

Health Behaviour Classification:
<13 → Poor (High-risk behavior pattern)
13–19 → Moderate (Needs structured improvement)
20–25 → Good (Maintain & optimize)
>25 → Excellent (Reinforce & sustain)

Agent Responsibilities:

1. Calculate the user's total score.
2. Classify their health behavior category.
3. Analyze weak domains from the provided domain scores.
4. Identify the lowest scoring domain and prioritize it.

Domain categories include:
- Mental Health
- Physical Activity
- Lifestyle / Energy
- Social Health
- Preventive Health

Response Guidelines:

If category = Poor:
• Emphasize urgent improvement
• Suggest a structured 7-day corrective plan
• Focus on weakest domains
• Encourage micro-habit formation
• Use strong but supportive nudging

If category = Moderate:
• Encourage improvement
• Suggest optimization plans
• Recommend weekly goals and behavior tracking

If category = Good:
• Focus on maintaining and optimizing
• Suggest habit stacking and performance improvements

If category = Excellent:
• Reinforce positive behavior
• Suggest advanced wellness challenges or mentoring others
• Use gamification ideas

Communication Style:
- Friendly and supportive
- Practical and actionable
- Use bullet points
- Maximum 200 words
- No markdown headers
- Use emoji sparingly
`;

    const userPrompt = `
A user completed a Health Behaviour questionnaire.

Weak domains detected:
${domainList}

All domain scores:
${JSON.stringify(scores)}

Please do the following:

1. Estimate the user's total health score from the provided data.
2. Classify their health behavior category using the following ranges:

<13 → Poor
13–19 → Moderate
20–25 → Good
>25 → Excellent

3. Identify the weakest domain.
4. Provide personalized guidance focusing on that domain.

Depending on the category:

- Poor → provide a short structured 7-day corrective plan
- Moderate → suggest improvement goals and routine adjustments 
- Good → suggest optimization and habit stacking
- Excellent → suggest advanced challenges or long-term wellness tracking

Keep the response practical and encouraging.
`;
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to get AI recommendations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || "No advice available.";

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("health-advice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
