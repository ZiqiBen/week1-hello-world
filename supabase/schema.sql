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
  ('Backtracking', 'Recursion', 'Build one partial answer, explore a choice, then undo it before trying the next choice.', 'Use it for combinations, permutations, subsets, boards, and constraint search.', '46. Permutations', 'Forgetting to undo state before returning to the previous recursion level.', 'Practicing'),
  ('Fast and Slow Pointers', 'Arrays', 'Move two pointers at different speeds to detect cycles or find middle positions.', 'Use it for linked-list cycles, middle nodes, happy numbers, and cycle entry points.', '141. Linked List Cycle', 'Advancing a pointer without checking null first.', 'Comfortable'),
  ('Merge Intervals', 'Arrays', 'Sort intervals, then combine overlapping ranges as you scan left to right.', 'Use it when the input is ranges, meetings, schedules, or coverage windows.', '56. Merge Intervals', 'Forgetting to sort by start time before merging.', 'Comfortable'),
  ('Difference Array', 'Arrays', 'Apply range updates by marking changes at boundaries instead of touching every element.', 'Use it for many range increments, booking counts, and sweep-line style accumulation.', '1094. Car Pooling', 'Missing the decrement at the position after the range ends.', 'Growing'),
  ('Sweep Line', 'Arrays', 'Convert starts and ends into events, then scan events in sorted order.', 'Use it for overlapping intervals, meeting rooms, skyline, and active-count problems.', '253. Meeting Rooms II', 'Processing end events after start events at the same coordinate when the opposite is needed.', 'Practicing'),
  ('Hash Map Counting', 'Data Structures', 'Track frequencies or last-seen positions to answer membership and count questions fast.', 'Use it for duplicates, anagrams, pairs, and subarray counts.', '242. Valid Anagram', 'Updating counts but forgetting to remove zero-count keys when equality matters.', 'Comfortable'),
  ('Trie', 'Strings', 'Store strings character by character so shared prefixes are traversed once.', 'Use it for autocomplete, prefix search, word dictionaries, and board word search.', '208. Implement Trie', 'Not marking the end of a full word separately from a prefix.', 'Growing'),
  ('String Matching', 'Strings', 'Compare or preprocess patterns so repeated text checks do not restart from scratch.', 'Use it for substring search, repeated patterns, and prefix-suffix structure.', '28. Find the Index of the First Occurrence in a String', 'Confusing prefix lengths with indexes in KMP-style logic.', 'Practicing'),
  ('Matrix Traversal', 'Arrays', 'Treat grid movement as graph traversal with bounds checks and directions.', 'Use it for islands, flood fill, shortest path in grids, and matrix simulations.', '200. Number of Islands', 'Mutating or marking cells inconsistently and revisiting the same cell.', 'Comfortable'),
  ('Dijkstra', 'Graphs', 'Always expand the currently cheapest known state first.', 'Use it when graph edges have nonnegative weighted costs.', '743. Network Delay Time', 'Using normal BFS on weighted edges.', 'Practicing'),
  ('Bellman-Ford', 'Graphs', 'Relax every edge repeatedly so paths with limited stops can improve step by step.', 'Use it for cheapest flights with stop limits or graphs that need bounded edge counts.', '787. Cheapest Flights Within K Stops', 'Overwriting distances in the same round and accidentally using too many edges.', 'Growing'),
  ('Floyd-Warshall', 'Graphs', 'Let each node become an intermediate stop and improve every pair distance.', 'Use it for all-pairs shortest paths on small dense graphs.', '1334. Find the City With the Smallest Number of Neighbors', 'Using it on large graphs where O(n^3) is too expensive.', 'Practicing'),
  ('Bitmask DP', 'Dynamic Programming', 'Represent a chosen set as bits, then transition by adding or removing one choice.', 'Use it for small-n assignment, traveling salesman variants, and subset states.', '698. Partition to K Equal Sum Subsets', 'Forgetting that bitmask methods only work when n is small enough.', 'Growing'),
  ('Knapsack DP', 'Dynamic Programming', 'Decide whether each item contributes to a capacity-limited total.', 'Use it for subset sum, partition, target sum, and choose-or-skip optimization.', '416. Partition Equal Subset Sum', 'Looping capacity in the wrong direction and reusing an item twice.', 'Practicing'),
  ('Sequence DP', 'Dynamic Programming', 'Build answers over prefixes where each state depends on earlier positions.', 'Use it for LIS, decoding, word break, edit distance, and string alignment.', '300. Longest Increasing Subsequence', 'Choosing O(n^2) when a patience-sorting approach is expected.', 'Growing'),
  ('Interval DP', 'Dynamic Programming', 'Solve smaller intervals first, then combine them into larger ranges.', 'Use it for burst balloons, palindrome partitioning, matrix chain style problems.', '312. Burst Balloons', 'Iterating interval lengths in an order that reads uncomputed states.', 'Practicing'),
  ('Greedy Scheduling', 'Search', 'Make the locally best ordering or selection after sorting by the right key.', 'Use it for intervals, deadlines, arrows, meeting rooms, and jump coverage.', '435. Non-overlapping Intervals', 'Sorting by start time when the greedy proof needs end time.', 'Growing'),
  ('Kadane Algorithm', 'Arrays', 'Carry the best subarray ending here and reset when the previous sum hurts you.', 'Use it for maximum subarray and related contiguous gain problems.', '53. Maximum Subarray', 'Resetting to zero when all values can be negative.', 'Comfortable'),
  ('Quickselect', 'Search', 'Partition around a pivot and recurse only into the side containing the kth element.', 'Use it for kth largest or smallest without fully sorting.', '215. Kth Largest Element in an Array', 'Mixing kth largest with zero-based kth smallest indexes.', 'Practicing'),
  ('Reservoir Sampling', 'Data Structures', 'Keep a fair random sample from a stream without knowing its final length.', 'Use it when data arrives online and storing everything is not possible.', '382. Linked List Random Node', 'Using equal probability at each step instead of probability 1/count.', 'Learning'),
  ('Math Invariants', 'Search', 'Track a property that remains true as operations change the state.', 'Use it for games, number transformations, parity, gcd, and impossible-state proofs.', '292. Nim Game', 'Simulating when a simple invariant decides the answer.', 'Growing');
