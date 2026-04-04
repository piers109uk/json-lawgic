# Requirements: Law-as-Code vs RAG Evaluation Platform

## 1. Mission

Improve access to justice by testing the hypothesis that **legal statutes expressed as executable code (JSON Logic) and invoked via tool calls** produce more accurate, grounded legal guidance than **traditional RAG** (retrieval-augmented generation) alone.

---

## 2. Evaluation Dataset — MN Statute Test Cases

### 2.1 Golden Question Set (≥ 100)

| Requirement | Detail |
|---|---|
| Quantity | Minimum 100 realistic MN legal questions |
| Realism | Written as a layperson would actually ask ("My landlord kept my deposit — what are my rights?") |
| Topic coverage | Landlord/tenant, employment, family law, criminal defense, consumer protection, real estate, probate, traffic/DUI, small claims, public benefits — weighted toward high-volume legal-aid topics |
| Annotations per question | `question`, `topic`, `relevant_statute_ids[]`, `relevant_statute_texts[]`, `expected_answer_summary`, `difficulty` (simple / multi-statute / cross-reference) |
| Cross-reference cases | At least 15 questions where the correct answer requires combining two or more statutes |
| Adversarial cases | At least 10 questions that are plausible but fall outside MN statute scope, to test false-positive rate |

### 2.2 Golden Retrieval Labels

For every question the dataset must record which statutes are **relevant** (for recall) and which are **not relevant** (for precision). This is the ground truth for RAG evaluation.

### 2.3 Format

```jsonc
{
  "id": "q-042",
  "question": "My landlord refuses to return my $1,200 security deposit after I moved out. The apartment was in good condition. What can I do?",
  "topic": "landlord-tenant",
  "difficulty": "multi-statute",
  "relevant_statute_ids": ["504B.178", "504B.178 subd.3", "504B.235"],
  "expected_answer_summary": "Under MN § 504B.178, the landlord must return the deposit within 21 days with an itemised statement. If wrongfully withheld, the tenant may recover up to $500 in punitive damages plus attorney fees under § 504B.235.",
  "cross_references": ["504B.235"]
}
```

---

## 3. Law-to-Code Pipeline (Upgraded)

### 3.1 Code Generation

| Requirement | Detail |
|---|---|
| Target representation | JSON Logic (existing format, but quality-upgraded) |
| Models | Use latest frontier models (GPT-4o, Claude 3.5/4 Sonnet/Opus, Gemini 2.5 Pro) — configurable |
| Multi-agent flow | Interpreter → Reviewer → (optional) Simplifier loop, max N iterations. Existing `graph_interpreter.py` pattern, modernised |
| Structured output | Pydantic v2 models with strict JSON schema enforcement |
| Cross-reference support | When a statute references another statute, the pipeline must detect the reference and include a `referenced_statutes[]` field with the IDs |
| Validation step | After generation, execute the JSON Logic against provided examples and assert expected true/false outcomes |
| Batch runner | Process statutes in parallel with rate limiting, checkpointing (skip already-interpreted), and progress reporting |
| Tracing | Every pipeline run traced in Langfuse (or compatible) with cost tracking |

### 3.2 Code Quality Metrics

| Metric | Method |
|---|---|
| Syntactic validity | Parse JSON Logic and execute against examples — must not throw |
| Semantic correctness | LLM-as-judge score (existing pattern) + human spot-check |
| Completeness | All logical branches of the statute must be covered |
| Variable clarity | Variable names and descriptions must be understandable by a non-lawyer |
| Example quality | At least 2 true and 2 false examples per rule |

### 3.3 Cross-Reference Graph

| Requirement | Detail |
|---|---|
| Detection | Parse statute text for references like "§ 504B.235", "subdivision 3", "section 123.45" |
| Storage | Adjacency list or graph DB edge list: `{from: "504B.178", to: "504B.235", relationship: "penalty_provision"}` |
| Composite evaluation | When a tool call invokes a statute that references another, the system must be able to chain/compose the logic |

---

## 4. RAG System

### 4.1 Retrieval

| Requirement | Detail |
|---|---|
| Corpus | All MN statutes (~54k sections from `data/default/`) |
| Chunking | Statute-level (each section = one chunk). Include title + section ID as metadata |
| Embeddings | State-of-art embedding model (e.g. `text-embedding-3-large`, Cohere embed v3, or open-source `bge-m3`) |
| Vector store | Local or managed (Chroma, Qdrant, pgvector, Pinecone — see architecture for trade-offs) |
| Reranking | Cross-encoder reranker (Cohere Rerank, `bge-reranker-v2-m3`, or Jina Reranker) |
| Hybrid search | BM25 + dense retrieval fusion (RRF or similar) |
| Top-k | Configurable; default top-10 retrieval → top-5 after reranking |
| Metadata filtering | Filter by chapter, topic, repealed status |

### 4.2 RAG Evaluation Metrics

All measured against the golden question set:

| Metric | Definition |
|---|---|
| **Precision@k** | Of the k retrieved statutes, what fraction are relevant? |
| **Recall@k** | Of all relevant statutes, what fraction were retrieved? |
| **MRR** | Mean reciprocal rank of the first relevant statute |
| **NDCG@k** | Normalised discounted cumulative gain |
| **Answer correctness** | LLM-as-judge comparison of generated answer vs golden answer |
| **Faithfulness** | Is every claim in the answer grounded in retrieved statutes? |
| **Latency** | End-to-end response time (p50, p95) |

### 4.3 RAG Trigger Logic

RAG should **not** fire on every user message. Requirements:

- RAG triggered only when the LLM determines it needs to look up statute information
- Conversational follow-ups ("thanks", "can you explain that?") should not trigger retrieval
- The LLM should be able to decide: retrieve new statutes, use already-retrieved context, or just converse

---

## 5. Chatbot — Tool-Calling System

### 5.1 Core Interaction Model

The chatbot operates in two modes (eventually side-by-side):

| Mode | How it answers |
|---|---|
| **JSON Logic (tool-calling)** | LLM retrieves relevant statutes → identifies applicable JSON Logic rules → asks user clarifying questions to populate variables → executes JSON Logic via tool call → interprets result for the user |
| **RAG (baseline)** | LLM retrieves relevant statute text → synthesises answer from the text directly |

### 5.2 Tool-Calling Requirements

| Requirement | Detail |
|---|---|
| Tool: `evaluate_json_logic` | Input: `{statute_id, rule_index, variable_values}` → Output: `{result: bool, explanation}` |
| Tool: `search_statutes` | Input: `{query, top_k?, filters?}` → Output: `{statutes: [{id, title, text, relevance_score}]}` |
| Tool: `get_statute_rules` | Input: `{statute_id}` → Output: `{rules: [{rule, variables, consequences}]}` |
| Variable elicitation | When the LLM identifies relevant JSON Logic rules, it must ask the user targeted questions to fill in the required variables before executing |
| Chained execution | If a statute references another, the system must be able to chain tool calls |
| Streaming | All LLM responses must stream token-by-token to the UI |

### 5.3 Confidence & Transparency

| Requirement | Detail |
|---|---|
| Relevance score | Each retrieved statute shows a confidence/relevance score (0–1) |
| Citation | Every claim in the answer must cite specific statute sections with clickable links |
| Tool call visibility | The UI must clearly show when a tool call occurs, what the input was, and what the output was (collapsible detail) |
| Disclaimer | Persistent disclaimer that this is not legal advice |

---

## 6. Chatbot UI/UX

### 6.1 Layout & Design

| Requirement | Detail |
|---|---|
| Framework | Modern React (Next.js or standalone) with polished, accessible UI |
| Streaming | Token-by-token streaming display with typing indicator |
| Chat interface | Full conversation history, markdown rendering, code block rendering |
| Statute references | Inline links to MN Revisor website; expandable preview of statute text |
| Tool call display | Collapsible "Tool Call" cards showing: tool name, input JSON, output JSON, execution time |
| Confidence badges | Visual badges (green/yellow/red) for relevance confidence scores |
| Split-screen mode | (Phase 2) Side-by-side comparison of JSON Logic tool-calling response vs RAG-only response for the same question |
| Mobile responsive | Must work on mobile (single-column layout) |
| Dark mode | Support dark/light theme |

### 6.2 Conversation Management

| Requirement | Detail |
|---|---|
| Persistence | Conversations stored server-side (DB) with unique IDs |
| History | User can view and resume past conversations |
| New conversation | Clear button to start fresh |
| Session-based access | No login required initially — identify by session/IP |

### 6.3 Rate Limiting & Access

| Requirement | Detail |
|---|---|
| BYOK mode | Users can enter their own OpenAI/Anthropic API key for unlimited use |
| Free tier | Limited usage per IP (e.g. 20 messages/day or 50 messages/week) |
| Rate limiting | Per-IP rate limiting with clear messaging when limits hit |
| Abuse prevention | Basic protections: rate limiting, input length limits, prompt injection filtering |

---

## 7. Observability & Tracing

| Requirement | Detail |
|---|---|
| Tool | Langfuse (already in use) or compatible (Langsmith, Helicone) |
| Trace scope | Every chatbot conversation traced end-to-end: user input → retrieval → tool calls → LLM generation → response |
| Cost tracking | Per-conversation and per-question token/cost tracking |
| Evaluation scores | Automated scoring of every answer (faithfulness, relevance) logged to traces |
| Dashboard | Aggregated metrics: avg response quality, retrieval precision/recall, cost per question, latency |

---

## 8. Comparison Framework (A/B Evaluation)

### 8.1 Automated Evaluation

Run both systems (tool-calling and RAG-only) on the full golden question set:

| Metric | How measured |
|---|---|
| Answer correctness | LLM-as-judge vs golden answer (scale 0–1) |
| Answer completeness | Does the answer cover all relevant statutes? |
| Factual grounding | Every claim traceable to a specific statute |
| Hallucination rate | Claims not supported by any retrieved statute |
| Question efficiency | How many clarifying questions needed before giving a substantive answer |
| User effort | How much info the user has to provide (measured by conversation turns) |
| Latency | Time to first substantive answer |

### 8.2 Human Evaluation (Optional Phase 2)

| Approach | Detail |
|---|---|
| Blind comparison | Show both answers side-by-side (randomised order), ask evaluator to pick better one |
| Legal expert review | Have a lawyer score a sample of answers for accuracy |

---

## 9. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Deployment | Vercel (frontend) + serverless or lightweight backend (Vercel functions, Railway, Fly.io) |
| Performance | First token < 2s; full response < 15s for typical question |
| Data freshness | Statute data should be versioned and updateable |
| Security | No storage of API keys server-side (BYOK keys used per-request only); HTTPS everywhere |
| Accessibility | WCAG 2.1 AA compliance |
| Legal disclaimer | Prominent on every page and in every response |

---

## 10. Phased Delivery

| Phase | Scope |
|---|---|
| **Phase 1: Foundation** | Golden dataset (100 questions), upgraded law-to-code pipeline, RAG system with evaluation metrics, basic chatbot with tool-calling |
| **Phase 2: Polish & Compare** | Split-screen UI, A/B evaluation framework, cross-reference graph, conversation persistence, rate limiting |
| **Phase 3: Scale & Validate** | Expand to more statutes, human evaluation, performance optimisation, public beta |
