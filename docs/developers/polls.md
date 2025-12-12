---
title: Polls
sidebar_position: 4
---

# Polls - Developer Guide

This guide covers the technical architecture, database schema, and implementation details of the Live Polls feature in Pawtograder.

## Overview

The polling system enables instructors to create quick, real-time polls during class. It uses [SurveyJS](https://surveyjs.io/) for rendering poll questions and Supabase realtime for instant result updates.

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, Chakra UI |
| Poll Engine | SurveyJS (survey-core, survey-react-ui) |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Real-Time | Supabase Realtime (broadcast channels) |
| Charts | Recharts |
| QR Codes | qrcode (SVG generation) |

### Key Dependencies

```json
{
  "survey-core": "^2.3.11",
  "survey-react-ui": "^2.3.11",
  "recharts": "^2.15.0",
  "qrcode": "^1.5.4"
}
```

## Database Schema

### Tables

#### `live_polls`

Main table storing poll definitions.

```sql
CREATE TABLE live_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id BIGINT NOT NULL REFERENCES classes(id),
    created_by UUID NOT NULL REFERENCES user_roles(public_profile_id),
    question JSONB NOT NULL DEFAULT '[]'::jsonb,  -- SurveyJS JSON configuration
    is_live BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivates_at TIMESTAMPTZ DEFAULT NULL,      -- Auto-close timestamp
    require_login BOOLEAN NOT NULL DEFAULT FALSE
);
```

**Key Fields:**
- `question`: Stores SurveyJS-formatted JSON containing the poll structure
- `is_live`: Controls whether the poll is active (accepting responses)
- `deactivates_at`: Auto-deactivation timestamp (1 hour from when poll goes live)
- `require_login`: Whether anonymous responses are allowed
- `created_by`: Instructor/grader who created the poll (auto-set via trigger)

**⚠️ Note on `question` column:**
While the schema default is `'[]'::jsonb` (empty array), the application always stores **objects** in SurveyJS format with an `elements` property, never plain arrays. All poll creation code provides explicit values, so the default is not used in practice.

**Actual stored format:**
```json
{
  "elements": [
    {
      "type": "checkbox",
      "title": "Which topic should we review next?",
      "choices": ["Recursion", "Dynamic Programming", "Graphs"]
    }
  ]
}
```

**Display format (UI only):**
When rendered in the poll interface, this is wrapped in a `pages` structure for SurveyJS display:
```json
{
  "pages": [{
    "elements": [...]
  }]
}
```

#### `live_poll_responses`

Stores individual student responses.

```sql
CREATE TABLE live_poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_poll_id UUID NOT NULL REFERENCES live_polls(id),
    public_profile_id UUID REFERENCES user_roles(public_profile_id),
    response JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Keyed by question name
    submitted_at TIMESTAMPTZ DEFAULT NULL,
    is_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT live_poll_responses_unique_per_profile UNIQUE (live_poll_id, public_profile_id)
);
```

**Key Features:**
- Allows anonymous responses (`public_profile_id` can be NULL when `require_login` is false)
- Unique constraint ensures one response per user per poll
- Auto-sets `submitted_at` timestamp via trigger

### Anonymous Response Behavior

**⚠️ CRITICAL: The UNIQUE constraint does not prevent duplicate anonymous responses.**

The constraint `UNIQUE (live_poll_id, public_profile_id)` enforces one response per authenticated user, but due to PostgreSQL's NULL handling, **anonymous users (where `public_profile_id` is NULL) can submit unlimited responses to the same poll**.

#### Current Behavior by User Type:

| User Type | Deduplication | Behavior |
|-----------|--------------|----------|
| **Authenticated** (`require_login = true`) | ✅ Enforced by UNIQUE constraint | One response per user per poll |
| **Anonymous** (`require_login = false`) | ❌ Not enforced | Unlimited responses allowed |

#### Why This Happens:
In PostgreSQL, NULL values in UNIQUE constraints are considered distinct from each other. Multiple rows with `(live_poll_id, NULL)` are all valid and don't violate the constraint.

#### Current Mitigations:
- **None at application level**: No client-side tracking, rate limiting, or session-based restrictions
- **No server-side deduplication**: Anonymous responses go directly to the database without checks

#### Design Decision:
Anonymous responses are intentionally allowed (see RLS policy comments), but **unlimited anonymous responses appear to be an unintended consequence** rather than a deliberate feature.

#### Potential Solutions (if limiting is desired):

1. **Require Login for Sensitive Polls**
   - Set `require_login = true` for polls where single-response is critical
   - Trade-off: Eliminates anonymous participation

2. **Client-Side Session Tracking** (weak mitigation)
```typescript
   // Store in sessionStorage after submission
   sessionStorage.setItem(`poll-${pollId}-submitted`, 'true');
   // Check before allowing submission
   if (sessionStorage.getItem(`poll-${pollId}-submitted`)) {
     // Show "already submitted" message
   }
```
   - ⚠️ Easily bypassed (incognito mode, clearing storage)

3. **Add Anonymous Session Identifier** (requires schema change)
```sql
   ALTER TABLE live_poll_responses 
   ADD COLUMN anonymous_session_id UUID;
   
   CREATE UNIQUE INDEX live_poll_responses_anonymous_unique
   ON live_poll_responses (live_poll_id, COALESCE(public_profile_id, anonymous_session_id));
```
   - Generate session ID client-side and store in sessionStorage
   - More robust than option 2 but still bypassable

4. **Server-Side Rate Limiting** (requires additional infrastructure)
   - Track submissions by IP address or request fingerprinting
   - Implement time-based or count-based limits
   - Most robust but adds complexity

#### Recommendation:
- **For public/informal polls**: Accept unlimited anonymous responses as a trade-off for accessibility
- **For critical polls** (grades, official votes): Use `require_login = true`
- Document this behavior clearly in the UI when creating polls

#### Related Files:
- Response submission: `app/poll/[course_id]/page.tsx` (lines 122-148)
- RLS policies: `supabase/migrations/20251204070101_live-polls.sql` (lines 324-357)

### Database Triggers

| Trigger | Table | Purpose |
|---------|-------|---------|
| `set_live_poll_created_by` | live_polls | Auto-sets `created_by` to authenticated user on INSERT |
| `set_poll_deactivates_at` | live_polls | Sets `deactivates_at` to 1 hour when `is_live` becomes true |
| `set_response_submitted_at` | live_poll_responses | Auto-sets `submitted_at` when `is_submitted` flips to true |
| `broadcast_live_poll_change` | live_polls | Broadcasts changes to realtime channels |
| `broadcast_live_poll_response_change` | live_poll_responses | Broadcasts new responses to staff channel |

### Auto-Deactivation

Polls automatically close after 1 hour via a scheduled function:

```sql
CREATE OR REPLACE FUNCTION public.deactivate_expired_polls()
RETURNS void AS $$
BEGIN
    UPDATE live_polls
    SET is_live = false
    WHERE is_live = true
      AND deactivates_at IS NOT NULL
      AND deactivates_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Runs every hour via pg_cron
SELECT cron.schedule('deactivate-expired-polls', '0 * * * *', 'SELECT deactivate_expired_polls()');
```

## Row-Level Security (RLS)

### Poll Policies

| Policy | Role | Access |
|--------|------|--------|
| `live_polls_select` | All | Read polls for classes user belongs to |
| `live_polls_insert_staff` | Instructors, Graders | Create polls in their classes |
| `live_polls_update_staff` | Instructors, Graders | Update polls (cannot change `created_by`) |
| `live_polls_delete_staff` | Instructors, Graders | Delete polls in their classes |

### Response Policies

| Policy | Role | Access |
|--------|------|--------|
| `live_poll_responses_select_staff` | Instructors, Graders | Read all responses for their class polls |
| `live_poll_responses_insert` | Students/Anonymous | Insert responses (see security function below) |

### Security Function for Responses

```sql
CREATE OR REPLACE FUNCTION can_access_poll_response(poll_id UUID, profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    poll_record RECORD;
BEGIN
    SELECT require_login, class_id INTO poll_record
    FROM live_polls WHERE id = poll_id;

    -- Anonymous allowed if require_login is false
    IF NOT poll_record.require_login AND profile_id IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Authenticated user must belong to class and provide their profile
    IF poll_record.require_login THEN
        RETURN EXISTS (
            SELECT 1 FROM user_roles
            WHERE public_profile_id = profile_id
              AND class_id = poll_record.class_id
              AND user_id = auth.uid()
        );
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## TypeScript Types

```typescript
// types/poll.ts
export type PollQuestion = {
  id: string;
};

export type MultipleChoicePollQuestion = PollQuestion & {
  type: "multiple-choice";
  prompt: string;
  choices: { label: string }[];
  correct_choices: string[];
};

export type PollResponseData = Record<string, string | string[]>;
```

## File Structure

```text
app/course/[course_id]/
├── polls/                              # Student-facing
│   └── page.tsx                        # List of active polls
├── manage/polls/                       # Instructor-facing
│   ├── page.tsx                        # Poll management dashboard
│   ├── new/
│   │   └── page.tsx                    # Create/edit poll
│   └── [poll_id]/
│       └── responses/
│           └── page.tsx                # Poll analytics dashboard

app/poll/[course_id]/
└── page.tsx                            # Student poll response page (standalone)

components/polls/
├── PollBuilder.tsx                     # Visual poll question builder
├── PollBuilderModal.tsx                # Modal wrapper for builder
├── PollPreviewModal.tsx                # Preview poll before publishing
├── PollsTable.tsx                      # Instructor poll management table
├── PollsHeader.tsx                     # Header with create button
├── EmptyPollsState.tsx                 # Empty state when no polls
├── StudentPollsTable.tsx               # Student table of active polls
├── PollResponsesDynamicViewer.tsx      # Main analytics dashboard
├── MultipleChoiceDynamicViewer.tsx     # Chart renderer for MC questions
├── PollResponsesHeader.tsx             # Header with URL, QR, controls
├── PollBarChart.tsx                    # Recharts bar chart component
└── QrCode.tsx                          # QR code generator

hooks/
├── useCourseController.tsx             # Poll-related hooks
└── usePollQrCode.tsx                   # QR code generation hook
```

## React Hooks

### `useLivePolls()`

Fetches all polls for a course with real-time updates.

```typescript
const { data: polls, isLoading } = useLivePolls();
// Returns: LivePoll[] with real-time subscription
```

### `useActiveLivePolls()`

Fetches only `is_live=true` polls with loading state.

```typescript
const { polls, isLoading } = useActiveLivePolls();
// Used by StudentPollsTable for showing available polls
```

### `useLivePoll(pollId)`

Fetches a single poll by ID with real-time updates.

```typescript
const { data: poll } = useLivePoll(pollId);
// Used by response dashboard
```

### `usePollResponseCounts(pollId, pollQuestion)`

Real-time response count tracking per choice.

```typescript
const counts = usePollResponseCounts(pollId, question);
// Returns: Record<string, number> mapping choice labels to counts
```

**Implementation Details:**
- Fetches initial response counts from database
- Subscribes to ClassRealTimeController for INSERT events
- Directly increments counts on new responses (instant UI updates)
- Tracks seen response IDs to avoid double-counting
- Filters out "other:" responses

### `usePollQrCode(courseId, pollUrl, lightColor, darkColor)`

Generates QR code as data URL.

```typescript
const qrDataUrl = usePollQrCode(courseId, pollUrl, '#fff', '#000');
// Returns: string (data:image/svg+xml;base64,...)
```

## Real-Time Synchronization

### Broadcast Channels

Polls use Supabase realtime broadcast for instant updates:

| Channel | Format | Subscribers |
|---------|--------|-------------|
| Staff | `class:{class_id}:staff` | Instructors, graders |
| Student | `class:{class_id}:user:{profile_id}` | Individual students |

### Broadcast Payloads

**Poll Change:**
```typescript
{
  type: 'broadcast',
  event: 'live_poll_change',
  payload: {
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    table: 'live_polls',
    row: LivePoll,
    timestamp: string
  }
}
```

**Response Change:**
```typescript
{
  type: 'broadcast',
  event: 'live_poll_response_change',
  payload: {
    operation: 'INSERT',
    table: 'live_poll_responses',
    row: LivePollResponse,
    poll_id: string,
    timestamp: string
  }
}
```

### Real-Time Flow

1. **Instructor creates poll**: INSERT broadcast to staff + all students
2. **Student submits response**: INSERT broadcast to staff only
3. **Instructor closes poll**: UPDATE broadcast to staff + all students
4. **Dashboard receives update**: Hook updates local state, UI re-renders

## SurveyJS Integration

### Poll JSON Structure

```json
{
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "checkbox",  // or "radiogroup"
          "name": "poll_question_0",
          "title": "Which topics would you like to review?",
          "choices": [
            { "value": "Arrays", "text": "Arrays" },
            { "value": "Recursion", "text": "Recursion" },
            { "value": "Trees", "text": "Trees" }
          ]
        }
      ]
    }
  ]
}
```

### Rendering Polls

```tsx
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

function PollComponent({ pollJson, onComplete }) {
  const survey = new Model(pollJson);

  survey.onComplete.add((sender) => {
    onComplete(sender.data);
  });

  return <Survey model={survey} />;
}
```

### Response Format

**Single Choice:**
```json
{ "poll_question_0": "Arrays" }
```

**Multiple Choice:**
```json
{ "poll_question_0": ["Arrays", "Recursion"] }
```

## Visual Builder

The visual builder (`PollBuilder.tsx`) uses a type registry pattern:

```typescript
const QUESTION_TYPE_REGISTRY = {
  "single-choice": {
    label: "Single Choice",
    surveyJsType: "radiogroup",
    defaultConfig: { choices: [] }
  },
  "multiple-choice": {
    label: "Multiple Choice",
    surveyJsType: "checkbox",
    defaultConfig: { choices: [] }
  }
};
```

### Adding New Question Types

1. Add entry to `QUESTION_TYPE_REGISTRY`
2. Update `PollBuilderDataTypes.ts` with new type
3. Add UI controls in `PollBuilder.tsx`
4. SurveyJS handles rendering automatically (if using built-in types)

## Presentation Mode

Fullscreen display implementation using the Fullscreen API:

```typescript
const enterFullscreen = () => {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};
```

Features:
- Cross-browser support (webkit, moz, ms prefixes)
- Escape key to exit
- QR code displayed in corner
- Real-time chart updates continue

## Testing

### E2E Tests

Poll E2E tests are located at `tests/e2e/polls.test.tsx`.

```bash
# Run poll tests
npx playwright test polls
```

### Test Scenarios

- Student sees empty state with no polls
- Real-time visibility (student sees poll go live without refresh)
- Student can answer active polls
- Instructor sees empty manage state
- Visual builder updates JSON
- Filters work (all/live/closed)
- Response counts update in real-time
- Poll deletion cascades to responses

### Manual Testing

1. Create a test class with `npm run seed`
2. Log in as an instructor
3. Navigate to Polls to create/manage polls
4. Log in as a student in another browser
5. Verify real-time updates work both ways

## Common Development Tasks

### Adding a New Poll Option

1. Update `PollBuilder.tsx` to add the option to the builder UI
2. Ensure the SurveyJS JSON is generated correctly
3. Update `PollResponsesDynamicViewer.tsx` if visualization changes needed

### Modifying the Database Schema

1. Create a new migration:
   ```bash
   npx supabase migration new poll_schema_change
   ```

2. Write your SQL in `supabase/migrations/[timestamp]_poll_schema_change.sql`

3. Apply locally:
   ```bash
   npx supabase db reset
   ```

4. Regenerate types:
   ```bash
   npm run client-local
   ```

### Adding RLS Policies

```sql
-- Example: Allow students to view their own responses
CREATE POLICY live_poll_responses_select_own ON live_poll_responses
  FOR SELECT
  USING (
    public_profile_id IN (
      SELECT public_profile_id FROM user_roles
      WHERE user_id = auth.uid()
    )
  );
```

## Troubleshooting

### Poll not appearing for students

1. Check `is_live` is `true`
2. Verify `deactivates_at` has not passed
3. Confirm student belongs to the same class
4. Check RLS policies are not blocking access

### Real-time updates not working

1. Verify Supabase realtime is enabled for the tables
2. Check broadcast triggers are installed
3. Confirm ClassRealTimeController subscription is active
4. Check browser console for websocket errors

### Response not saving

1. Verify the poll's `require_login` setting
2. If login required, confirm student's profile_id is correct
3. Check for unique constraint violations (duplicate responses)
4. Verify RLS policies allow the insert

### QR code not loading

1. Check `qrcode` package is installed
2. Verify poll URL is correct format
3. Check browser console for generation errors

## Migrations

**Current Migrations:**

| Migration | Purpose |
|-----------|---------|
| `20251204070101_live-polls.sql` | Initial schema with triggers and RLS |
| `20251211191904_live-polls-auto-created-by.sql` | Auto-set `created_by` trigger |
| `20251211230139_delete_deprecated_polls_table.sql` | Remove legacy poll tables |

**Legacy Tables Removed:**
- polls
- poll_questions
- poll_question_answers
- poll_responses
- poll_response_answers
- poll_question_results
