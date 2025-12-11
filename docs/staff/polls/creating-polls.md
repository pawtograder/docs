---
title: Creating Polls
sidebar_position: 2
---

Creating a poll in Pawtograder is designed to be quick and straightforward, allowing you to set up a poll in just a few seconds during class.

## Creating a New Poll

1. Navigate to the "Polls" section in your course
2. Click the "Create Poll" button

![Polls Creation Page](assets/poll-create.png)

3. Click the **Open Visual Builder** button and enter your poll question

![Polls Visual Builder](assets/poll-builder.png)

4. Select the poll type (see [Poll Types](./poll-types.md) for options)
5. Configure the answer options based on your selected poll type
6. Click **Use This Poll** button
7. Validate JSON or Preview Poll if needed
8. Optionally, select **Require login to respond** to restrict poll access to logged-in students only
9. Click **Publish Poll** to make it live immediately

## Poll Settings

When creating a poll, you can configure the following:

- **Question Prompt**: The question or prompt displayed to students
- **Question Type**: The format of responses (single choice or multiple choice)
- **Choices**: The available response options for students to choose from
- **Require Login**: When enabled, students must be logged in to Pawtograder to respond to the poll. When disabled, anyone with access to the poll can respond anonymously.

:::tip
Enable **Require Login** if you want to track which students responded or ensure only enrolled students can participate. Disable it for quick anonymous polls where ease of access is more important.
:::

## Automatic Poll Closing

Polls automatically close **one hour** after creation. This ensures that:
- Responses are collected in a timely manner
- Students cannot submit responses long after the class has ended
- Results remain relevant to the in-class discussion

:::tip
If you need to close a poll before the one-hour timeout, you can manually close it at any time from the poll management view.
:::

## Deleting a Poll

Click **Delete Poll** button to delete the poll and confirm your choice. Please note that Deleting a poll is different from closing one.

![Deleting a Poll](assets/poll-delete.png)

**Warning**: Deleting a poll will result in the permanent loss of all responses from students. This action cannot be undone.

## Best Practices

- **Keep questions concise**: Students should be able to read and respond quickly
- **Limit answer options**: For multiple choice, 4-5 options is typically ideal
- **Test before class**: Create a test poll to familiarize yourself with the interface
- **Plan ahead**: Have your poll questions ready before class to minimize setup time during lecture
