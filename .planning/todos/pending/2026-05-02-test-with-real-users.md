---
created: 2026-05-02T11:41:00
title: Test with real users
area: testing
files:
  - /
---

## Problem

The application has been improved with metadata persistence and soft-delete features, but it needs real-world testing with a small user group (2-3 users) to verify stability and API load on TMDB and Google Books.

## Solution

1. Share the Vercel deployment URL with testers.
2. Monitor API usage and Supabase connection counts.
3. Gather feedback on the "blank state" and "Lost in the Vault" fixes.
