---
title: Grading Assignments
---

Pawtograder has a robust feature to allow instructors to assign grading tasks to staff. When a grading task is assigned, the instructor can set a due date for that task, and re-assign the task to a different grader if needed. Pawtograder will also automatically allow any other grader to complete the task if the original grader is unable to complete it (without needing to re-assign the task).

## Conflicts of interest
Pawtograder will automatically ensure that graders do not grade assignments that they have a conflict of interest in. Graders can self-input their conflicts (under "Course Settings" - "Grading Conflicts"), and instructors can review and enter conflicts for all graders in the class. Graders are encouraged to input a "Reason" for their conflict, so that instructors can understand the nature of the conflict and help avoid declaring spurious conflicts.

![Grading Conflicts Dashboard](assets/grading-assignments-1756052760269.png)

## Assigning Grading Tasks
Pawtograder's "Bulk Assign Grading" feature (from an Assignment's "Grading Assignments" page) allows instructors to assign grading tasks to staff in bulk.

![Screenshot of Bulk Assign Grading form](assets/grading-assignments-1756052527424.png)

The algorithm will first split submissions between graders (assigning all selected rubric parts to each grader, aka "Assign by submission"), or split the rubric parts between graders first (assigning each submission to different graders for each rubric part, aka "Assign by rubric part").

You can choose which rubric to assign (the "Grading Rubric" is the default, and what is used to calculate the student's grade for the assignment), and optionally choose which rubric parts to assign.

The algorithm will only operate over unassigned grading tasks. To support complex workflows, you can manually assign some subsets at a time (filtering by section or tag). 

To select asignees, you can filter by role (e.g. graders, instructors, or both), and optionally filter by tag. The form will show which graders will be assigned, and you can manually override the selection of graders.

You can choose to reuse existing grading assignments (e.g. if you want to assign the same graders to the same submissions as a previous assignment, or even to assign the same graders a different rubric on the same submissions). Selecting this option will override all balancing efforts.

Lastly, you can choose to enforce that graders are **not** assigned to the same submission as they were on a prior assignment or rubric. This feature is useful to assign meta-graders, where the meta-grader is a different grader than the one who graded the submission.

You will be able to preview the assignments before creating them, and can manually tweak them through the drag-and-drop interface.
