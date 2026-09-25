-- Run in the Supabase SQL Editor to replace the sample course list with an
-- algorithm-pattern atlas.
drop table if exists public.patterns;
drop table if exists public.courses;

create table public.patterns (
  id bigint generated always as identity primary key,
  name text not null unique,
  category text not null,
  core_idea text not null,
  when_to_use text not null,
  example_problem text not null,
  common_trap text not null,
  confidence text not null
);

alter table public.patterns enable row level security;

-- Public sample data: visitors can read, but cannot write.
revoke all on table public.patterns from anon, authenticated;
grant select on table public.patterns to anon, authenticated;

create policy "Anyone can read patterns"
  on public.patterns for select to anon, authenticated using (true);

insert into public.patterns (name, category, core_idea, when_to_use, example_problem, common_trap, confidence) values
  ('Tree DFS', 'Trees', 'Return a useful summary from each child, then combine those summaries at the current node.', 'Use it for tree height, path sums, subtree checks, diameter, and lowest common ancestor problems.', '124. Binary Tree Maximum Path Sum', 'Returning a two-branch path upward instead of only one extendable branch.', 'Growing'),
  ('BFS Shortest Path', 'Graphs', 'Explore states level by level so the first time you reach the target is the minimum number of moves.', 'Use it when every move has the same cost and the prompt asks for fewest steps, rolls, or transformations.', '909. Snakes and Ladders', 'Forgetting a visited set and revisiting cycles forever.', 'Comfortable'),
  ('Binary Search on Answer', 'Search', 'Guess an answer, test if it is feasible, then shrink the search space.', 'Use it for minimum possible maximum, capacity, speed, days, and other monotonic feasibility questions.', '875. Koko Eating Bananas', 'Writing a feasibility check that is not actually monotonic.', 'Practicing'),
  ('Sliding Window', 'Arrays', 'Maintain a moving range while updating counts, sums, or constraints as the window expands and shrinks.', 'Use it for contiguous subarray or substring problems with longest, shortest, or at-most constraints.', '3. Longest Substring Without Repeating Characters', 'Moving the left pointer too late and counting invalid windows.', 'Comfortable'),
  ('Two Pointers', 'Arrays', 'Move two indexes toward each other or through a list to avoid nested loops.', 'Use it for sorted arrays, pair sums, partitioning, palindrome checks, and linked-list fast/slow pointer tasks.', '15. 3Sum', 'Skipping duplicates in the wrong place and losing valid answers.', 'Comfortable'),
  ('Monotonic Stack', 'Stacks', 'Keep a stack ordered so each new element resolves earlier elements that were waiting for a larger or smaller value.', 'Use it for next greater element, daily temperatures, histogram area, and range contribution problems.', '739. Daily Temperatures', 'Popping with the wrong comparison direction.', 'Practicing'),
  ('Heap / Priority Queue', 'Data Structures', 'Keep only the most important candidates available at the top.', 'Use it for top-k, streaming medians, merging sorted lists, and scheduling by smallest or largest priority.', '347. Top K Frequent Elements', 'Using a heap when a sorted list or bucket count would be simpler.', 'Growing'),
  ('Union Find', 'Graphs', 'Represent connected components with parent links and merge sets as edges appear.', 'Use it for connectivity, islands, redundant connections, and grouping problems.', '684. Redundant Connection', 'Forgetting path compression or union by rank on large inputs.', 'Practicing'),
  ('Topological Sort', 'Graphs', 'Process nodes only after their prerequisites have been processed.', 'Use it for course schedules, dependency graphs, build orders, and DAG ordering.', '207. Course Schedule', 'Not detecting cycles when the processed count is too small.', 'Growing'),
  ('Tree DP', 'Dynamic Programming', 'Let every node compute a best answer for its subtree and return the part its parent can use.', 'Use it when choices at a node depend on child results, especially include/exclude or path-combine decisions.', '337. House Robber III', 'Mixing the global answer with the value that should be returned upward.', 'Growing'),
  ('Prefix Sum', 'Arrays', 'Store cumulative totals so range sums and subarray differences become constant-time checks.', 'Use it for subarray sum, range queries, difference arrays, and count-of-sum problems.', '560. Subarray Sum Equals K', 'Checking the map after inserting the current prefix, which can count the current index incorrectly.', 'Comfortable'),
  ('Backtracking', 'Recursion', 'Build one partial answer, explore a choice, then undo it before trying the next choice.', 'Use it for combinations, permutations, subsets, boards, and constraint search.', '46. Permutations', 'Forgetting to undo state before returning to the previous recursion level.', 'Practicing');
