import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages }: RequestBody = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          message: "Hi! I'm Nova, your AI assistant. I'm here to help you with anything related to CityPulse - reporting incidents, understanding sustainability data, or navigating the app. How can I assist you today?"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const systemMessage: Message = {
      role: "system",
      content: `You are Nova, a friendly AI assistant for CityPulse - a civic engagement and sustainability tracking app.

Your personality:
- Friendly and helpful
- Calm and encouraging
- Concise but warm
- Slightly playful but professional

Your role:
- Help users understand how to use CityPulse
- Answer questions about reporting incidents
- Explain sustainability features
- Guide users through app features
- Provide encouragement for civic participation

Keep responses brief (2-3 sentences max) unless detailed explanation is needed.
Be supportive and positive about community engagement.`,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);

      return new Response(
        JSON.stringify({
          message: "I'm having a bit of trouble connecting right now. Please try again in a moment!"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "I'm here to help! What would you like to know?";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in nova-chat function:", error);

    return new Response(
      JSON.stringify({
        message: "Sorry, I'm having trouble responding right now. Please try again!"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
