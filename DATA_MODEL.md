# The Trade — Data Model

## Overview

This document defines the database schema for The Trade AI platform. The stack is **Supabase** (Postgres) with **Supabase Auth** for authentication.

---

## Entities

### 1. `users`
Managed by Supabase Auth. Extended with a `profiles` table for app-specific data.

```sql
profiles
  id              uuid          PRIMARY KEY references auth.users(id)
  email           text          NOT NULL
  full_name       text
  company_name    text
  role            text          -- 'interior_designer' | 'architect' | 'builder' | 'other'
  avatar_url      text
  created_at      timestamptz   DEFAULT now()
  updated_at      timestamptz   DEFAULT now()
```

---

### 2. `conversations`
Each chat session a user starts.

```sql
conversations
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  user_id         uuid          NOT NULL references profiles(id) ON DELETE CASCADE
  title           text          -- auto-generated from first message, or user-editable
  created_at      timestamptz   DEFAULT now()
  updated_at      timestamptz   DEFAULT now()
  archived_at     timestamptz   -- soft delete
```

**Notes:**
- `title` is generated from the first user message (e.g. "Kitchen remodel budget")
- `updated_at` updates on every new message — used to sort sidebar by recency
- `archived_at` allows soft-deleting without losing data

---

### 3. `messages`
Individual messages within a conversation.

```sql
messages
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  conversation_id uuid          NOT NULL references conversations(id) ON DELETE CASCADE
  role            text          NOT NULL -- 'user' | 'assistant'
  content         text          -- text content of the message
  created_at      timestamptz   DEFAULT now()
```

---

### 4. `message_attachments`
Files attached to a message (images, CSVs). Stored separately to keep `messages` clean.

```sql
message_attachments
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  message_id      uuid          NOT NULL references messages(id) ON DELETE CASCADE
  type            text          NOT NULL -- 'image' | 'csv'
  file_name       text          NOT NULL
  storage_path    text          -- path in Supabase Storage bucket
  media_type      text          -- e.g. 'image/jpeg', 'text/csv'
  size_bytes      int
  created_at      timestamptz   DEFAULT now()
```

**Notes:**
- Files are stored in **Supabase Storage**, not in the DB itself
- `storage_path` is the key to retrieve the file
- Images are currently sent as base64 to Claude — in Phase 2 we'd store them here and pass the URL

---

### 5. `csv_context` *(optional Phase 2)*
Currently CSVs are attached per-conversation and injected into the system prompt. If we want to persist them across sessions:

```sql
csv_context
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  conversation_id uuid          NOT NULL references conversations(id) ON DELETE CASCADE
  file_name       text          NOT NULL
  content         text          -- raw CSV text (up to 500 rows)
  created_at      timestamptz   DEFAULT now()
```

---

## Relationships

```
profiles
  └── conversations (1 user → many conversations)
        └── messages (1 conversation → many messages)
              └── message_attachments (1 message → many attachments)
```

---

## Row Level Security (RLS)

Supabase uses Postgres RLS to ensure users can only access their own data.

```sql
-- Users can only read/write their own profile
-- Users can only read/write their own conversations
-- Users can only read/write messages in their own conversations
```

Every table gets a policy like:
```sql
USING (user_id = auth.uid())
```

---

## Multi-user organizations

Since multiple users from the same firm share a workspace, we need two additional tables.

### 6. `organizations`
A firm or company account that multiple users belong to.

```sql
organizations
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  name            text          NOT NULL  -- e.g. "Clark Interiors"
  slug            text          UNIQUE    -- e.g. "clark-interiors" (for URLs)
  logo_url        text
  created_at      timestamptz   DEFAULT now()
  updated_at      timestamptz   DEFAULT now()
```

---

### 7. `memberships`
Join table linking users to organizations, with a role per member.

```sql
memberships
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  organization_id uuid          NOT NULL references organizations(id) ON DELETE CASCADE
  user_id         uuid          NOT NULL references profiles(id) ON DELETE CASCADE
  role            text          NOT NULL DEFAULT 'member' -- 'owner' | 'admin' | 'member'
  invited_by      uuid          references profiles(id)
  accepted_at     timestamptz   -- null = invite pending
  created_at      timestamptz   DEFAULT now()

  UNIQUE (organization_id, user_id)
```

**Roles:**
- `owner` — created the org, can delete it, manage billing
- `admin` — can invite/remove members, manage settings
- `member` — standard access, can create and view their own conversations

---

## Updated relationships

```
organizations
  └── memberships (1 org → many members)
        └── profiles (many users → many orgs via memberships)

profiles
  └── conversations (1 user → many conversations)
        └── messages (1 conversation → many messages)
              └── message_attachments (1 message → many attachments)
```

---

## Conversation visibility within an org

Two options — decide before building:

**Option A: Private by default**
Each conversation belongs to the user who created it. Other org members can't see it unless explicitly shared. Simpler to build.

**Option B: Shared by default**
All conversations in an org are visible to all members. More collaborative, closer to a shared workspace feel.

A middle ground: add a `visibility` field to `conversations`:
```sql
conversations
  ...
  organization_id uuid          references organizations(id)  -- null = personal
  visibility      text          DEFAULT 'private' -- 'private' | 'org'
```

This lets users choose per-conversation.

---

## Updated `conversations` table

```sql
conversations
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
  user_id         uuid          NOT NULL references profiles(id) ON DELETE CASCADE
  organization_id uuid          references organizations(id)   -- null = personal workspace
  visibility      text          DEFAULT 'private' -- 'private' | 'org'
  title           text
  created_at      timestamptz   DEFAULT now()
  updated_at      timestamptz   DEFAULT now()
  archived_at     timestamptz
```

---

## Phase 2 additions (not needed now)

### `projects`
Group multiple conversations under a named project (e.g. "Smith Kitchen Remodel").

```sql
projects
  id              uuid
  organization_id uuid
  created_by      uuid          references profiles(id)
  name            text
  client_name     text
  status          text          -- 'active' | 'completed' | 'archived'
  created_at      timestamptz
```

With `conversations.project_id` as an optional foreign key.

### `usage_logs`
Track API token usage per user/org for billing.

```sql
usage_logs
  id              uuid
  user_id         uuid
  organization_id uuid
  conversation_id uuid
  input_tokens    int
  output_tokens   int
  created_at      timestamptz
```

---

## Open questions (to decide before implementation)

1. ~~**Multi-user orgs?**~~ ✅ Yes — handled above.
2. **Conversation title generation** — Auto-generate from first message (requires a quick LLM call), or just use the first N characters of the user's first message?
3. **Image storage** — Currently base64 in memory. For persistence, store in Supabase Storage and save the path, or keep base64 in the DB? (Storage is cleaner and cheaper at scale; base64 is simpler to build.)
4. **Free vs paid tier** — Usage limits per user/org from day one, or add later?
5. **Conversation visibility** — Private by default, org-wide by default, or user's choice per conversation? (See Option A/B above.)
