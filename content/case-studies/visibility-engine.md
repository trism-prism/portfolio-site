## The problem

A 2D game with a torch or a lamp needs to know which part of the floor one point of light can see, given a set of walls. That region, the visibility polygon, is what draws sharp shadows. It only changes direction at the end points of walls and where walls cross, so the job is to cast rays toward those points and find, for each ray, the first wall it hits.

Two things make that harder than it sounds. Floating-point arithmetic can disagree with itself about which side of a line a point is on, and a naive search tests every wall for every ray, which gets slow as scenes grow.

## What I built

- A C++20 library that computes the exact visibility polygon for one point light among line-segment walls, including walls that cross.
- Two interchangeable query methods: a simple baseline where every ray tests every wall, and a uniform grid where each ray walks only the squares it crosses (an Amanatides-Woo walk). Both give bit-identical output.
- An interactive demo (GLFW and Dear ImGui) where you drag the light, draw and erase walls, switch methods and watch a work meter count the wall tests each method needs.
- A headless benchmark that times only the visibility query across four synthetic wall layouts, three seeds and 16 to 4,000 walls.

## Decisions that mattered

### Exact side-of-line tests instead of rounded ones

My first version sorted rays by angle with `atan2` and decided sides with a plain floating-point cross product. In a one-by-one world with a single wall, a light and two targets that were collinear in decimal but not in binary, both targets got the same sort key and collapsed into one ray. A rounded side test then dropped a polygon corner, and the lit area came out 0.465 instead of 0.765.

I replaced both decisions with one orientation predicate: a fast floating-point filter with an exact fallback. The sort, the ray tests and the crossing search all use it, so they cannot disagree. The case is kept as a regression test.

**Cost:** the change made queries slower, measured at the time on a 1,000-wall scatter scene (grid query from about 410 µs to about 700–750 µs). A later cached-difference filter recovered part of that without changing the output.

### One ray per target, with one-sided limits

A common trick casts three rays per wall end, nudged slightly to each side. Offsets leak light through corners where two walls meet, and miss gaps narrower than the offset. Instead the engine casts one ray per target and computes, for each side of the ray, the nearest hit. That needs more logic per wall test, but corner and T-junction cases are exact, and two tests would fail with offsets.

### A uniform grid, not a tree or a sweep

The grid was the smallest change that kept the same per-ray function and bit-identical output, and its walk can be drawn directly in the demo. An angular sweep or a quadtree would adapt better to clustered scenes; I have not built or measured either.

## Evidence

- On the committed benchmark, the grid is about 1.5x faster than the baseline on 250-wall clustered scenes and up to 127x faster on 4,000-wall mazes, with output identical at every benchmarked position. These numbers come from one laptop (Intel i7-1355U, single thread, MSVC release build) and predate the later sort speed-up.
- The demo's work meter compares the two methods in wall tests: the baseline figure is exact arithmetic (rays × walls), the grid figure is the real counter from a grid query for the same light position.
- The repository documents each decision with its context, cost and what evidence would change it.

## Limits

- One point light and hard shadows only; walls have zero thickness.
- Every edit rebuilds the grid and the crossing list. On the long-wall layout with 4,000 walls, one add-and-remove pair costs about 146 ms.
- Scenes where many walls share grid squares, or cross a lot, stay slow in both methods.
- Single-threaded, built and measured on Windows with MSVC only.
