---
title: Overview
sidebar_position: 1
---

Programming assignments are the core of Pawtograder. Each assignment consists of a "handout" repository, and optionally, a "grader" repository. When an assignment is released, Pawtograder automatically creates a new private repository for each student based on that handout. Pawtograder automatically manages permissions for all of these repositories, allowing staff to view all of a course's repositories, and ensuring students can only view their own repositories.

## GitHub Permissions
Pawtograder creates two GitHub teams for each class: a "staff" team and a "students" team. Staff are granted access to all class repositories, and students are only granted access to their own repositories. The "students" team can be used by instructors who want to create addtional GitHub repositories that are only accessible to students (e.g. for distributing in-class exercises).

## Repositories
Two repositories are automatically created for each assignment: a "handout" repository and a "grader" repository. These repositories must be configured by the staff before the assignment is released.

A handout repository is a repository that contains the starter code for an assignment. It is used to provide students with the necessary files to complete the assignment.

A grader repository is a repository that contains the code that will be used to grade the assignment. It is used to provide instructors with the necessary files to grade the assignment.

## Individual and Group Assignments
Assignments can be individual, group-optional, or group-required.
Students can be assigned to groups by instructors, or can self-assign to groups.
Instructors can reuse a set of groups from a prior assignment.

## Due date exceptions
Instructors can set a class-wide number of late tokens, and configure assignments to allow students to use those tokens as desired.
Each token can be exchanged for a 24-hour extension, but the extension must be requseted before the student's original due date.

Instructors and graders can also manually grant extensions to students, and can view all extensions granted to a student. This is done in the assignment configuration under "Due Date Exceptions".

