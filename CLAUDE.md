# Project: Meal Planner Robomidas

## Active Feature: Matrix Control Hub (app/matrix/page.js)

## Recently Fixed
Barrer pisos (rule-sweep) appeared on Lunes despite dayOverrides Lunes = 0.
Root cause: compileBaseTasksBeforePacking was never the source — it correctly
excludes off days. The leak was in the backlogPool merge (line ~262): postponed
("Posponer") tasks were matched into the day's list by targetDate only, with no
dayOverrides check, so a task chain-postponed across several off days could land
on Lunes and stick. Fixed by (1) filtering backlog items against the origin
rule's dayOverrides at merge time, and (2) making triggerManualTaskRollover skip
forward to the next day the rule is actually eligible, instead of always "+1 day".
Debug console.log removed from compileBaseTasksBeforePacking.

## Working Rules
- Always use FIND THIS BLOCK / REPLACE FOR THIS BLOCK format for code changes
- Never rewrite the whole file
- Never add line breaks inside string constants
- Never simplify or remove logic

## Deploy Command
In PowerShell: cd C:\Users\mauro\meal-planner-robomidas then vercel --prod

## Key Files
- app/matrix/page.js — main feature, 500+ lines
- lib/supabase.js — database connection
- app/layout.js — navigation

## Pending Tasks
1. Add /matrix to navigation bar
2. Connect ingredients from Google Spreadsheet
3. Move localStorage to Supabase
