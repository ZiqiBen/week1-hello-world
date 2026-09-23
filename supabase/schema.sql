-- Run once in the Supabase SQL Editor for this assignment's new project.
create table public.courses (
  id bigint generated always as identity primary key,
  code text not null unique,
  title text not null,
  description text not null,
  category text not null
);
alter table public.courses enable row level security;
-- Public sample data: visitors can read, but cannot write.
revoke all on table public.courses from anon, authenticated;
grant select on table public.courses to anon, authenticated;
create policy "Anyone can read courses"
  on public.courses for select to anon, authenticated using (true);
insert into public.courses (code, title, description, category) values
  ('CS 101', 'Web Development', 'Build modern web applications with React, Next.js, and databases. Take an idea from a first page to a live website.', 'Development'),
  ('CS 201', 'Artificial Intelligence', 'Explore search, reasoning, and decision-making. Learn how intelligent systems solve problems and navigate uncertainty.', 'Intelligence'),
  ('CS 202', 'Machine Learning', 'Discover how models learn from data, recognize patterns, and make predictions. Start with the foundations and build from there.', 'Intelligence'),
  ('CS 203', 'Natural Language Processing', 'Explore how computers work with human language, from text classification to language models.', 'Language'),
  ('CS 204', 'Database Systems', 'Learn to organize and query data using relational databases, SQL, and practical data modeling techniques.', 'Data'),
  ('CS 205', 'Algorithms', 'Develop strategies for solving computational problems and understand the tradeoffs between different approaches.', 'Foundations');
