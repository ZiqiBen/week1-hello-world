import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Course = { id: number; code: string; title: string; description: string; category: string };

export default async function Home() {
  // Fetch at request time so database changes appear without redeploying.
  await connection();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let courses: Course[] = [];
  let unavailable = false;
  if (!url || !key) {
    unavailable = true;
    console.error("Missing Supabase environment variables.");
  } else {
    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.from("courses")
        .select("id, code, title, description, category").order("id");
      if (error) throw error;
      courses = data ?? [];
    } catch {
      console.error("Unable to fetch courses from Supabase.");
      unavailable = true;
    }
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-20">
      <header className="mb-14 flex items-center justify-between border-b border-slate-200 pb-5">
        <span className="text-lg font-semibold tracking-tight">Course Directory</span>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">Week 02</span>
      </header>
      <section aria-labelledby="page-title">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-700">EXPLORE & LEARN</p>
        <h1 id="page-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">A little curiosity goes a long way.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Explore a collection of computer science courses and find your next subject to dive into.</p>
        <div className="mt-12 mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Browse courses</h2>
          {!unavailable && <span className="text-sm text-slate-500">{courses.length} {courses.length === 1 ? "course" : "courses"}</span>}
        </div>
        {unavailable ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950">Courses are temporarily unavailable. Please try again shortly.</div>
        ) : courses.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No courses yet. Check back soon for new subjects to explore.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id} className="rounded-2xl border border-slate-200 bg-white p-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-slate-500">{course.code}</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">{course.category}</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{course.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{course.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-500">Keep exploring. There is always something new to learn.</footer>
    </main>
  );
}
