---
title: Surveys (Instructor Guide)

sidebar_position: 3
---

PawtoGrader's surveys feature enables instructors to collect structured feedback from students about courses, assignments, teaching methods, and more. Create custom surveys, track response rates in real-time, and export data for analysis.

## Accessing Survey Management

Navigate to **Surveys** in the course navigation menu to access the survey management dashboard.

![Survey Dashboard, Instructor View](./survey-dashboard.png)

The survey dashboard displays all surveys for your course with key information:

- Survey title and description
- Status (Draft, Published, or Closed)
- Response count
- Created date
- Quick action buttons (View Responses, Edit, Delete)

## Creating a New Survey

### Starting from Scratch

1. Click the **Create New Survey** button in the top-right corner
2. Enter a survey title (required)
3. Add an optional description to provide context for students
4. Open the **Visual Builder** to add questions (see Visual Builder section below)
5. Configure survey settings (see Survey Settings section below)
6. Choose to **Save as Draft** or **Publish** immediately
7. Choose the due date and whether allow students to edit their responses after submission
8. Preview the survey if needed, otherwise click **Save Survey**

![Survey Visual Builder](./survey-visual-builder.png)

### Using the Template Library

Save time by starting with a pre-built survey template:

1. Click the **Create New Survey** button
2. Click **Load Template**
3. Search or filter templates by:
   - **All Templates** or **My Templates**
   - **Visibility**: Class-Only or Global
   - Search by name or description keywords
4. Click **Preview** to see the full survey before using
5. Click **Clone** to create a new survey with the template's questions pre-filled
6. Customize as needed and publish

![Template Library Modal](./survey-template-library.png)

**Template Scopes:**

- **Class-Only**: Templates visible only within your course
- **Global**: Templates shared across all courses in the platform

## Visual Builder

The visual builder uses SurveyJS, providing access to a wide variety of question types:

### Supported Question Types

- **Short Text**: Short-line text area for concise responses
- **Long Text**: Multi-line text areas for detailed responses
- **Single Choice**: Radio buttons to select one option from a list
- **Checkboxes**: Multiple select boxes allowing students to choose one or more options
- **Yes / No**: Binary question with two clear options for simple confirmations

### Building Your Survey

1. Name the page if needed
2. Select the question type from the dropdown
3. Enter the question name
4. Configure question-specific options (description, choices, etc.)
5. Mark questions as required using the toggle
6. Click the arrows on the top right to reorder questions
7. If needed, click **Add Page** to insert a new page
7. Click **Use This Survey** button to use the JSON you generated

### Survey JSON Editor

Advanced users may directly modify the SurveyJS configuration when creating new survey. Use the visual builder first, then fine-tune in JSON mode if needed. You can click **Validate JSON** to see if the input is valid.

## Survey Settings

### Status Options

**Draft**

- Survey is not visible to students
- Allows you to work on the survey without time pressure
- No responses can be submitted
- Can be edited freely without affecting existing data

**Published**

- Survey becomes visible to students immediately
- Students can begin submitting responses
- Due date validation ensures deadline is in the future
- Editing published surveys is possible but use caution (see Editing Published Surveys below)

### Due Date Configuration

1. Click the date/time picker in the survey form
2. Select a date and time for the survey deadline
3. System converts to your configured timezone (default: America/New_York)
4. Students see a countdown timer showing time remaining
5. After the due date passes, students can no longer submit responses

**Due Date Display:**

- Red "Closed" indicator when past due
- Orange warning when less than 24 hours remain
- Days and hours remaining for upcoming deadlines

### Response Editing Control

Toggle **Allow Response Editing** to control whether students can modify their submissions after initial submission.

**Enabled**

- Students see an edit notification when taking the survey
- "View Submission" button changes to allow editing
- Timestamp updates to show last modification time

**Disabled**

- Students cannot change responses after submitting
- Original submission timestamp preserved
- Ensures responses reflect immediate reactions

## Managing Survey Responses

### Viewing Response Dashboard

Click **View Responses** on any published survey to see the response dashboard.

![Survey Response Dashboard](./survey-response-dashboard.png)

The dashboard displays three key metrics at the top:

#### Total Responses

Shows the current number of submitted responses.

#### Response Rate

Percentage of enrolled students who have submitted responses. Calculated as:

```
Response Rate = (Total Responses / Total Enrolled Students) × 100
```

#### Time Remaining

Dynamic countdown to the due date:

- **Black**: More than 24 hours remaining (displays days and hours)
- **Orange**: Less than 24 hours remaining (displays hours and minutes)
- **Red**: Past due date (displays "Closed")

### Response Data Table

The table shows all student responses with columns for:

- Student name
- Submission timestamp
- Answers to each survey question (dynamic columns)

**Column Headers**: Question titles automatically populate as column headers. Long question text is truncated for readability.

**Empty Responses**: Shows "—" for unanswered questions.

**Complex Answers**: Arrays display as comma-separated values (e.g., "Option A, Option C").

### Filtering Responses

Click the **Filters** button to open the filter panel with advanced options:

#### Date Range Filter

Filter responses submitted within a specific time period:

1. Select a start date
2. Select an end date
3. Only responses submitted between these dates display

**Use Cases:**

- Analyze early vs. late responders
- Track response patterns over time
- Identify submission clusters before deadline

#### Anonymous Mode

Hide student identifying information for unbiased analysis:

- Removes student names column

#### Question Selection Filter

Display only specific questions of interest:

1. Check/uncheck questions to show or hide
2. Reduces information overload for large surveys
3. Focus on specific topics or concerns

**Active Filters Display**: Blue badges show currently applied filters with quick-remove (×) buttons.

### Exporting Response Data

Click **Export to CSV** to download all response data for external analysis.

**CSV Format:**

```csv
Student Name,Submitted At,Question 1,Question 2,...
Jane Doe,"Nov 15, 2025, 3:45 PM",Answer 1,Answer 2,...
John Smith,"Nov 16, 2025, 10:22 AM",Answer 1,Answer 2,...
```

**Features:**

- Properly escaped values for Excel/Google Sheets compatibility
- Filename includes survey title and export date
- All question responses included as separate columns

### Viewing Individual Responses

Click on any row in the response table to view a student's individual response in detail.

**Individual Response View:**

- List of full survey responses in read-only mode
- All questions and answers displayed in the responses page
- Navigate back to dashboard with breadcrumb or back button

## Editing Surveys

### Editing Draft Surveys

Draft surveys can be edited freely with no restrictions:

1. Click **Edit** button on the survey card
2. Modify title, description, questions, or settings
3. Save changes and continue working
4. No student impact since draft surveys are not visible

### Editing Published Surveys

**Caution**: Editing published surveys should be done carefully as it may affect student experience.

**What You Can Safely Edit:**

- Survey title (won't affect existing responses)
- Description (provides context for future responders)
- Due date (can extend deadline if needed)
- Allow response editing setting

**What to Avoid Editing:**

- Survey questions (may invalidate existing responses)
- Question types (data type mismatch with existing responses)
- Removing questions (orphans existing response data)

**Best Practice**: If substantial changes are needed, create a new survey version rather than modifying a published survey with responses.

### Validation and Error Handling

The system validates surveys before publishing:

- Ensures due date is in the future (cannot publish with past due date)
- Validates JSON structure of survey questions
- Checks for required fields (title, question structure)

**Validation Errors:**

- Error message displays explaining the issue
- Must fix errors before publishing

## Saving Survey Templates

Share your successful survey designs with others or reuse them in future semesters:

1. Open an existing survey (published or draft)
2. Click **Add to Template Library**
3. Choose template scope:
   - **Course Only**: Available only in your course
   - **Global (Shared)**: Available to all instructors across courses

## Deleting Surveys

To remove a survey from your course:

1. Click actions button and choose **Delete**
2. Confirm deletion in the dialog box
3. Survey and all associated response data are permanently deleted

**Warning**: Deletion is permanent and cannot be undone. Export response data before deleting if you need to retain it.