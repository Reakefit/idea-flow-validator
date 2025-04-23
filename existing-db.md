# InsightValidator – Supabase Backend Schema Documentation

This document describes the structure of the current Supabase PostgreSQL backend for the InsightValidator platform. The schema is organized around core project phases and AI agent contexts, with strong linkage between projects, users, and various automated analysis outputs.

---

## 🔐 `profiles`
Stores additional user metadata beyond auth.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK, also `auth.users.id`       |
| name         | `text`    | Full name                      |
| created_at   | `timestampz` | Record creation timestamp  |
| updated_at   | `timestampz` | Last update timestamp       |

---

## 📁 `projects`
Represents a single validation flow initiated by a user.

| Column             | Type      | Description                                |
|--------------------|-----------|--------------------------------------------|
| id                 | `uuid`    | PK                                         |
| user_id            | `uuid`    | FK → `auth.users.id`                       |
| name               | `text`    | Optional name/title of project             |
| current_phase      | `text`    | Current UI step/agent status               |
| progress           | `jsonb`   | Optional progress tracker                  |
| market_research_context | `uuid` | FK → `market_research_context.id`       |
| created_at         | `timestampz` | Project creation timestamp             |
| updated_at         | `timestampz` | Last update timestamp                  |

---

## 💬 `problem_understanding_context`
Stores the structured output of the initial problem understanding chat.

| Column             | Type      | Description                               |
|--------------------|-----------|-------------------------------------------|
| id                 | `uuid`    | PK                                        |
| project_id         | `uuid`    | FK → `projects.id`                         |
| initial_statement  | `text`    | Raw problem description                   |
| understanding_level | `int`    | Confidence/clarity score (0–100)          |
| clarifying_questions | `text`  | Follow-up questions (stringified list)    |
| user_responses     | `jsonb`   | Responses to follow-ups                   |
| key_insights       | `jsonb`   | Key takeaways from this phase             |
| final_statement    | `text`    | Refined statement                         |
| metadata           | `jsonb`   | Market, audience, etc.                    |
| created_at         | `timestampz` |                                         |
| updated_at         | `timestampz` |                                         |

---

## 📊 `market_research_context`
Outputs from market research agent.

| Column         | Type      | Description                            |
|----------------|-----------|----------------------------------------|
| id             | `uuid`    | PK                                     |
| project_id     | `uuid`    | FK → `projects.id`                     |
| problem_context| `jsonb`   | Summary from problem agent             |
| competitors    | `jsonb`   | Initial list                           |
| market_insights| `text`    | Descriptive findings                   |
| opportunities  | `text`    | Summary of whitespace areas            |
| metadata       | `jsonb`   | Market size, trends, etc.              |
| status         | `text`    | e.g., `complete`, `pending`            |
| last_updated   | `timestampz` |                                      |

---

## 📌 `competitor_analysis_context`
Deeper mapping of competitors.

| Column               | Type      | Description                            |
|----------------------|-----------|----------------------------------------|
| id                   | `uuid`    | PK                                     |
| project_id           | `uuid`    | FK → `projects.id`                     |
| market_research_context | `uuid` | FK → `market_research_context.id`     |
| competitor_profiles  | `jsonb`   | List of analyzed competitors           |
| feature_matrices     | `jsonb`   | Matrix of features vs. products        |
| review_analysis      | `jsonb`   | Customer sentiment from reviews        |
| pricing_analysis     | `jsonb`   | Pricing tiers & comparisons            |
| market_position_analysis | `jsonb` | Competitive gaps                     |
| created_at           | `timestampz` |                                       |
| updated_at           | `timestampz` |                                       |
| status               | `text`    | Phase completion status                |
| last_updated         | `timestampz` |                                       |

---

## 🧩 `feature_analysis_context`
Analyzes capabilities, docs, and technical feasibility.

| Column                | Type      | Description                            |
|-----------------------|-----------|----------------------------------------|
| id                    | `uuid`    | PK                                     |
| project_id            | `uuid`    | FK → `projects.id`                     |
| competitor_analysis_context | `uuid` | FK → `competitor_analysis_context.id` |
| feature_comparison    | `jsonb`   | Matrix comparing features              |
| capability_analysis   | `jsonb`   | Unique strengths vs. others            |
| documentation_analysis| `jsonb`   | Quality/depth of docs                  |
| technical_specifications | `jsonb`| Key tech notes                         |
| integration_analysis  | `jsonb`   | Notes on integrations offered          |
| created_at            | `timestampz` |                                       |
| updated_at            | `timestampz` |                                       |
| status                | `text`    | Phase status                           |
| last_updated          | `timestampz` |                                       |

---

## 🧠 `customer_insights_context`
Patterns gathered from customer-facing research.

| Column               | Type      | Description                            |
|----------------------|-----------|----------------------------------------|
| id                   | `uuid`    | PK                                     |
| project_id           | `uuid`    | FK → `projects.id`                     |
| feature_analysis_context | `uuid`| FK → `feature_analysis_context.id`     |
| pain_points          | `jsonb`   | Structured pain points                 |
| satisfaction_metrics | `jsonb`   | NPS, CSAT, etc.                        |
| feature_requests     | `jsonb`   | Collated user asks                     |
| sentiment_analysis   | `jsonb`   | Positive/negative tone                 |
| usage_patterns       | `jsonb`   | Heuristics or behavioral data          |
| created_at           | `timestampz` |                                       |
| updated_at           | `timestampz` |                                       |
| status               | `text`    |                                        |
| last_updated         | `timestampz` |                                       |

---

## 💡 `opportunity_mapping_context`
Final strategic recommendations.

| Column                  | Type      | Description                           |
|-------------------------|-----------|---------------------------------------|
| id                      | `uuid`    | PK                                    |
| project_id              | `uuid`    | FK → `projects.id`                    |
| market_research_context | `uuid`    | FK                                    |
| competitor_analysis_context | `uuid` | FK                                    |
| feature_analysis_context | `uuid`   | FK                                    |
| customer_insights_context | `uuid`  | FK                                    |
| market_gaps             | `jsonb`   | Defined whitespace areas              |
| strategic_opportunities | `jsonb`   | Key business opportunities            |
| recommendations         | `jsonb`   | Actionable next steps                 |
| risk_assessment         | `jsonb`   | Concerns/barriers                     |
| implementation_roadmap | `jsonb`   | Sequencing of next actions            |
| created_at              | `timestampz` |                                     |
| updated_at              | `timestampz` |                                     |
| status                  | `text`    |                                       |
| last_updated            | `timestampz` |                                     |

---

## 🧍‍♂️ `persona_generation_context`
High-level metadata for generated personas.

| Column         | Type    | Description                          |
|----------------|---------|--------------------------------------|
| id             | `uuid`  | PK                                   |
| project_id     | `uuid`  | FK → `projects.id`                   |
| personae       | `jsonb` | List of draft personas               |
| created_at     | `timestampz` |                                 |
| updated_at     | `timestampz` |                                 |
| status         | `text`  |                                      |

---

## 🧑‍💼 `customer_persona_context`
Detailed individual persona context (used later for matching).

| Column               | Type    | Description                          |
|----------------------|---------|--------------------------------------|
| id                   | `uuid`  | PK                                   |
| project_id           | `uuid`  | FK → `projects.id`                   |
| personas             | `jsonb` | jsonb of personas   |
| market_research_context | `uuid` | FK → `market_research_context.id`   |
| created_at           | `timestampz` |                                   |
| updated_at           | `timestampz` |                                   |
| status               | `text`  |                                      |
| last_updated         | `timestampz` |                                   |

eg for personas:
[{"age": 35, "name": "John Doe", "goals": "Desires to have up-to-date technology tools to assist in his work. He's interested in productivity apps that help him manage his time and tasks more efficiently.", "quotes": "I'm always looking for ways technology can help me work smarter, not harder.", "behaviors": "Technologically savvy. Often the first one to adopt new technology among his peers. Spends significant time researching the best apps and tools for his needs.", "occupation": "Engineer", "painPoints": "Often finds it difficult to balance his work and personal life. He struggles to find apps designed with his specific needs as an engineer in mind.", "preferences": "Prefers apps that integrate with devices he already uses. Prioritizes functionality and usability over cost. Likes trying out new technology.", "usageScenarios": "John uses productivity apps to manage his tasks at work. He uses automation tools to streamline repetitive tasks. At home, John uses smart home technology to automate routine tasks."}, {"age": 28, "name": "Jane Smith", "goals": "Wants to stay informed about marketing trends and best practices. She's always searching for new marketing tools to improve her campaigns.", "quotes": "Keeping up with the latest marketing trends is essential for my job. I need tools that can help me stay ahead.", "behaviors": "Regularly reads marketing blogs and attends webinars. Frequent user of social media networks. Often trials different marketing tools to find the most effective ones.", "occupation": "Marketing Specialist", "painPoints": "Has difficulty keeping track of all the information she needs for her job. Struggles to find effective yet affordable marketing tools.", "preferences": "Prefers tools that provide actionable insights and user-friendly interfaces. Appreciates products that provide value for money. Likes brands that are transparent and customer-centric.", "usageScenarios": "Jane uses marketing tools to create and track her marketing campaigns. She uses CRM software to manage her relationships with customers. She also uses project management tools to manage her tasks."}]
---

## 🎙️ `interviews`
Stores scheduled interviews and their metadata.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| project_id   | `uuid`    | FK → `projects.id`            |
| name         | `text`    | Interviewee name              |
| role         | `text`    | Interviewee role              |
| goals        | `text`    | Interview goals               |
| learn_points | `text[]`  | Points to learn               |
| meeting_link | `text`    | Meeting URL                   |
| scheduled_at | `timestampz` | Interview time            |
| status       | `text`    | `scheduled`, `completed`, `cancelled` |
| created_at   | `timestampz` | Record creation timestamp  |
| updated_at   | `timestampz` | Last update timestamp       |

## 🎤 `interview_transcriptions`
Stores real-time transcriptions during interviews.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| interview_id | `uuid`    | FK → `interviews.id`          |
| speaker      | `text`    | `interviewer` or `interviewee` |
| content      | `text`    | Transcribed text              |
| timestamp    | `timestampz` | Transcription timestamp    |
| created_at   | `timestampz` | Record creation timestamp  |

## 💡 `interview_prompts`
Stores dynamic prompt suggestions during interviews.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| interview_id | `uuid`    | FK → `interviews.id`          |
| prompt_type  | `text`    | `follow_up`, `clarification`, `exploration` |
| content      | `text`    | Prompt text                   |
| context      | `jsonb`   | Context for the prompt        |
| timestamp    | `timestampz` | Prompt generation time     |
| status       | `text`    | `suggested`, `used`, `dismissed` |
| created_at   | `timestampz` | Record creation timestamp  |

## ⚠️ `interview_alerts`
Stores coaching alerts during interviews.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| interview_id | `uuid`    | FK → `interviews.id`          |
| alert_type   | `text`    | `pricing`, `pain_point`, `feature`, `competitor` |
| content      | `text`    | Alert message                 |
| context      | `jsonb`   | Context for the alert         |
| priority     | `text`    | `high`, `medium`, `low`       |
| timestamp    | `timestampz` | Alert generation time      |
| status       | `text`    | `active`, `acknowledged`, `resolved` |
| created_at   | `timestampz` | Record creation timestamp  |

## 📝 `interview_summaries`
Stores AI-generated summaries of completed interviews.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| interview_id | `uuid`    | FK → `interviews.id`          |
| pain_points  | `jsonb`   | Top 3 pain points             |
| quotes       | `jsonb`   | Memorable quotes (2-4)        |
| sentiment    | `jsonb`   | Sentiment analysis            |
| follow_ups   | `jsonb`   | Suggested follow-up questions |
| created_at   | `timestampz` | Record creation timestamp  |
| updated_at   | `timestampz` | Last update timestamp       |

## 🎯 `interview_insights`
Stores real-time insights during interviews.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| interview_id | `uuid`    | FK → `interviews.id`          |
| timestamp    | `timestampz` | Insight timestamp         |
| insight_type | `text`    | Type of insight               |
| content      | `text`    | Insight content               |
| priority     | `text`    | `high`, `medium`, `low`       |
| created_at   | `timestampz` | Record creation timestamp  |
| updated_at   | `timestampz` | Last update timestamp       |

## 📊 `consolidated_insights`
Stores aggregated insights across all interviews.

| Column       | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | `uuid`    | PK                            |
| project_id   | `uuid`    | FK → `projects.id`            |
| themes       | `jsonb`   | Recurring themes              |
| sentiment    | `jsonb`   | Sentiment over time           |
| features     | `jsonb`   | Top feature recommendations   |
| action_plan  | `jsonb`   | Action plan checklist         |
| created_at   | `timestampz` | Record creation timestamp  |
| updated_at   | `timestampz` | Last update timestamp       |


## 📝 TypeScript Types

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          current_phase: string;
          progress: any;
          market_research_context: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          current_phase?: string;
          progress?: any;
          market_research_context?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          current_phase?: string;
          progress?: any;
          market_research_context?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      problem_understanding_context: {
        Row: {
          id: string;
          project_id: string;
          initial_statement: string;
          understanding_level: number;
          clarifying_questions: string;
          user_responses: any;
          key_insights: any;
          final_statement: string;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          initial_statement: string;
          understanding_level?: number;
          clarifying_questions?: string;
          user_responses?: any;
          key_insights?: any;
          final_statement?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          initial_statement?: string;
          understanding_level?: number;
          clarifying_questions?: string;
          user_responses?: any;
          key_insights?: any;
          final_statement?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other table types ...
    };
  };
};
```
