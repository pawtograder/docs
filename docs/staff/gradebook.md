---
title: Gradebook 
---

## Column Semantics in the Gradebook System

In the Pawtograder gradebook system, **columns** represent individual grade components that collectively form a student's overall course performance. Each column is defined by a unique slug identifier, a human-readable name, and a maximum score, but their power lies in their flexibility for grade calculation and data sources. Columns can be **manually entered** by instructors who directly input grades cell-by-cell, **imported from CSV files** to bulk-load grades from external systems (with full metadata tracking of the import source and date), or **linked to programming assignments** through the assignment reference system. When linked to assignments, columns automatically pull grades from the autograder system, creating a seamless connection between student code submissions and gradebook entries.

**Expressions:** The most sophisticated column type uses **mathematical expressions** that reference other columns or assignments, creating a powerful dependency system for calculated grades. Using MathJS syntax, instructors can create complex formulas like `(gradebook_columns("homework-*") + assignments("project-*")) / 2` to automatically compute weighted averages, drop lowest scores, or apply curve adjustments. Score expressions can define functions and have access to the full MathJS library of math and utility functions. Any grade that is automatically calculated can also be manually overridden by the instructor on a case-by-case basis.

**Student visibility of grades:** The **"released"** status in the gradebook determines whether students can see a particular column and its grades. For imported or manually-entered columns, instructors have direct control over this visibility - they can release columns to make them visible to students or unrelease them to hide grades during grading periods or for sensitive assessments. This setting is at the column-level only (you can't release or unrelease individual grades). For columns that are automatically calculated by Pawtograder (via an expression), students always see the current calculation *based only on what they can see*. For example, a column defined as the average of all homeworks will show the student the average of all homeworks they have released.

## Importing Grades

To import grades, instructors use a 3-step wizard:

1. **File Selection**: Click the "Import Column" button and select a CSV file from your computer, which the system parses client-side to extract tabular data.

2. **Column Mapping**: Choose which CSV column contains student identifiers and select whether they are email addresses or student IDs. For each remaining CSV column, decide whether to map it to an existing gradebook column for updates, create a new column (requiring you to set the maximum score), or ignore the column entirely. The system automatically detects email columns if present.

3. **Preview & Confirm**: Review a comprehensive preview table that shows exactly what changes will occur, highlighting grade updates with strikethrough old values and bold new values, warning about students in the CSV who aren't enrolled in the course, and providing alerts when attempting to override calculated column scores. Only after reviewing this detailed preview can you click "Confirm Import" to execute the changes.

The system automatically creates new columns with full audit metadata including filename, date, and creator information, updates only enrolled students' grades while preserving override behavior for calculated columns, and maintains complete import history for traceability and compliance purposes.


## Expression Syntax

## Gradebook Expression Syntax Documentation

The gradebook expression system uses **MathJS** as its foundation, enhanced with specialized functions for grade calculations. Expressions must return a numeric value that becomes the student's score for that column. The final expression line is the student's score for that column.

### Core Syntax

Expressions follow standard mathematical notation with variables, operators, and functions:

```javascript
// Basic arithmetic
hw_average = (hw1 + hw2 + hw3) / 3

// Boolean logic and conditionals
passing = grade >= 60 ? 1 : 0

// Multi-line expressions (last line is the result)
midterm_weight = 0.3
final_weight = 0.7
weighted_score = midterm * midterm_weight + final * final_weight
weighted_score
```

### Data Access Functions

#### `gradebook_columns("slug-pattern")`
Retrieves gradebook column data with glob pattern matching. Returns objects with:
- `score`: `number | null` - The student's score (including overrides)
- `is_missing`: `boolean` - Whether the grade is missing/not entered
- `is_excused`: `boolean` - Whether the student is excused from this item
- `is_droppable`: `boolean` - Whether this item can be dropped in calculations

```javascript
// Single column
homework1 = gradebook_columns("hw-01")

// Multiple columns with glob patterns
all_homeworks = gradebook_columns("hw-*")
skill_assessments = gradebook_columns("skill-*")

// Access score property
hw_score = gradebook_columns("hw-01").score
```

### Array Processing Functions

#### `countif(array, predicate)`
Counts array elements matching a condition using lambda syntax:

```javascript
// Count skill assessments scoring exactly 2
meets_expectations = countif(gradebook_columns("skill-*"), f(x) = x.score == 2)

// Count passing grades
passing_count = countif(gradebook_columns("exam-*"), f(x) = x.score >= 70)
```

#### `sum(array)`
Sums numeric values or scores from gradebook objects:

```javascript
total_points = sum(gradebook_columns("hw-*"))
```

#### `mean(array, weighted=true)`
Calculates weighted (default) or unweighted averages:

```javascript
// Weighted average (accounts for different max scores)
hw_average = mean(gradebook_columns("hw-*"))

// Unweighted average
hw_simple_avg = mean(gradebook_columns("hw-*"), false)
```

Weighted average is defined as:
```javascript
const totalPoints = validValues.reduce((a, b) => a + (b?.max_score ?? 0), 0);
const totalScore = validValues.reduce((a, b) => a + (b?.score ?? 0), 0);
if (totalPoints === 0) {
    return undefined;
}
return (100 * totalScore) / totalPoints;
```

Unweighted average is defined as:
```javascript
return (100 * validValues.reduce((a, b) => a + (b && b.score ? b.score / b.max_score : 0), 0)) / validValues.length;
```

In either case, grades that are missing will count as 0 points, *unless* the grade is marked as `excused`, in which case it is excluded from the average.

#### `drop_lowest(array, count)`
Removes the lowest scoring droppable items:

```javascript
// Drop 2 lowest homework scores
best_homeworks = drop_lowest(gradebook_columns("hw-*"), 2)
hw_final = mean(best_homeworks)
```

`drop_lowest` drops the lowest grades (including those that are "missing" or "excused") as long as the "droppable" flag is set on the grade (this is the default).

### Conditional Logic

#### `case_when([condition, value; ...])`
Convenience function for multi-condition branching using matrix syntax:

```javascript
letter_grade = case_when([
  score >= 93, 97;  // A
  score >= 90, 93;  // A-
  score >= 87, 90;  // B+
  score >= 83, 87;  // B
  true, 0           // Default case
])
```

### Comparison Functions

Normal comparison functions like `==`, `>=`, `<=`, etc. are available, and can automatically coerce a gradebook value to a score for you (so that you do not need to map each gradebook value to a score to compare it).

### Complete Examples

#### Simple Counting Example
```javascript
// Count skills meeting expectations (score = 2)
countif(gradebook_columns("skill-*"), f(x) = x.score == 2)
```

#### Complex Grade Calculation
```javascript
// Multi-criteria grading with modifiers
CriteriaA = gradebook_columns("meets-expectations") >= 10 and 
            gradebook_columns("does-not-meet-expectations") == 0 and 
            gradebook_columns("average.hw") >= 85

CriteriaB = gradebook_columns("meets-expectations") >= 8 and 
            gradebook_columns("does-not-meet-expectations") == 0 and 
            gradebook_columns("average.hw") >= 75

CriteriaC = gradebook_columns("meets-expectations") >= 5 and 
            gradebook_columns("does-not-meet-expectations") == 0 and 
            gradebook_columns("average.hw") >= 65

CriteriaD = gradebook_columns("approaching-expectations") >= 9 and 
            gradebook_columns("does-not-meet-expectations") == 0 and 
            gradebook_columns("average.hw") >= 55

CriteriaPlus = gradebook_columns("total-labs") >= 8
CriteriaMinus = gradebook_columns("total-labs") < 6

letter = case_when([
  CriteriaA, 95;
  CriteriaB, 85;
  CriteriaC, 75;
  CriteriaD, 65;
  true, 0
])

mod = case_when([
  CriteriaPlus, 3;
  CriteriaMinus, -3;
  true, 0
])

final = max(letter + mod, 0)
final
```