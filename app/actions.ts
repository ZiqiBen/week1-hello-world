"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function getSiteUrl(origin: string | null) {
  if (origin && !origin.includes("localhost")) {
    return origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return origin ?? "http://localhost:3000";
}

function usefulFallback(category: string, prompt: string) {
  const lower = prompt.toLowerCase();
  if (category === "Arrays" && lower.includes("two pointer")) {
    return "Yes. Use two pointers when the array has an order or a condition that lets one pointer move past impossible choices. For a sorted pair-sum problem, start at the ends: if the sum is too small, move left forward; if it is too large, move right backward. Each element is visited at most once, so the time is O(n). Trap: this logic is not valid for an unsorted array unless you sort it first.";
  }
  if (category === "Arrays" && lower.includes("what is array")) {
    return "An array stores values in a fixed sequence, so each item can be reached by its index. Reading or updating arr[i] is usually O(1), while inserting near the front can be O(n) because later values must shift. Use an array when you need fast indexed access and mostly append or scan values. Trap: an index must stay between 0 and length - 1.";
  }
  const base = fallbackCards[category] ?? fallbackCards.Arrays;
  return `${base} Apply that idea specifically to this request: ${prompt}`;
}

const fallbackCards: Record<string, string> = {
  Arrays:
    "Scan for a repeated window condition: maintain a left pointer, update counts as the right pointer moves, and shrink only when the window already satisfies the rule. Trap: changing both pointers before recording the answer.",
  Trees:
    "Ask what information each subtree should return to its parent. For DFS, solve the child problem first, then combine the answers at the current node. Trap: using global state when the return value would be cleaner.",
  Graphs:
    "Turn the problem into nodes and edges, then decide whether BFS gives shortest steps or DFS gives full exploration. Trap: forgetting a visited set and revisiting the same state.",
  "Dynamic Programming":
    "Define the state in plain English before writing code: dp[i] should mean the best answer using the first i items or ending at i. Trap: coding the recurrence before knowing what each cell represents.",
  Search:
    "When the answer is monotonic, binary search the answer instead of scanning every possibility. Trap: updating the wrong boundary when the feasibility check returns true.",
  Stacks:
    "Use a stack when the newest unresolved item should be handled first, such as matching brackets or next greater elements. Trap: popping before checking whether the stack is empty.",
  Recursion:
    "Write the base case first, then trust the recursive call to solve the smaller version. Trap: mutating shared lists without undoing the choice during backtracking.",
};

async function buildStudyCard(category: string, prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
  const systemPrompt = `You are an interview coach for Columbia students practicing LeetCode. Answer the user's request directly and completely in 50 to 90 words. Category: "${category}". User request: "${prompt}". Give one concrete explanation, a tiny strategy or example, and one common trap. Do not begin with "Yes" or "Absolutely". Do not use markdown headings.`;

  if (!apiKey) {
    return usefulFallback(category, prompt);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 160 },
        }),
      },
    );
  } catch {
    return usefulFallback(category, prompt);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return usefulFallback(category, prompt);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === "string" && text.trim().length > 0
    ? text.trim()
    : usefulFallback(category, prompt);
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const origin = getSiteUrl(headerStore.get("origin"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = clean(formData.get("first_name"));
  const lastName = clean(formData.get("last_name"));
  const file = formData.get("avatar") as File | null;
  let avatarUrl = clean(formData.get("current_avatar_url"));

  if (file && file.size > 0) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/study-plan");
  redirect("/profile?saved=1");
}

export async function createAiGeneration(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const category = clean(formData.get("category")) ?? "Arrays";
  const prompt = clean(formData.get("prompt")) ?? "Give me one useful LeetCode interview study tip.";
  const generatedText = await buildStudyCard(category, prompt);

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    category,
    prompt,
    generated_text: generatedText,
  });

  revalidatePath("/");
  revalidatePath("/ai-coach");
  redirect("/ai-coach?generated=1");
}

export async function voteOnGeneration(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const generationId = clean(formData.get("generation_id"));
  const voteText = clean(formData.get("vote"));
  const vote = voteText === "-1" ? -1 : 1;

  if (!generationId) {
    redirect("/ai-coach");
  }

  await supabase.from("generation_votes").upsert(
    {
      generation_id: generationId,
      user_id: user.id,
      vote,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "generation_id,user_id" },
  );

  revalidatePath("/ai-coach");
  redirect("/ai-coach?voted=1");
}
