# Architecture: Law-as-Code vs RAG Evaluation Platform

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend                           │  │
│  │  Chat UI │ Tool-Call Inspector │ Statute Links │ Split View   │  │
│  └─────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────────┘
                             │ WebSocket / SSE (streaming)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API Layer (Python)                               │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Chat    │  │  RAG     │  │ Tool      │  │  Eval            │  │
│  │  Router  │  │  Engine  │  │ Executor  │  │  Framework       │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────────┬─────────┘  │
│       │              │              │                  │            │
│       ▼              ▼              ▼                  ▼            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               LLM Orchestration (LangGraph)                  │  │
│  │  Agent state │ Tool definitions │ Streaming │ Memory          │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
│                             │                                      │
│  ┌──────────┐  ┌────────────┴───────┐  ┌────────────────────────┐ │
│  │ Vector   │  │  JSON Logic        │  │  Langfuse              │ │
│  │ Store    │  │  Rule Store +      │  │  (tracing)             │ │
│  │          │  │  Executor          │  │                        │ │
│  └──────────┘  └────────────────────┘  └────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               Database (conversations, sessions, limits)     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                 OFFLINE PIPELINES                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Law-to-Code │  │  Embedding   │  │  Cross-Reference         │  │
│  │  Pipeline    │  │  Indexer     │  │  Graph Builder           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Architectural Decisions

### 2.1 Backend Framework — Python vs TypeScript

This is the most consequential decision because it determines the ecosystem for everything downstream.

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Mastra (TypeScript)** | All-in-one: agents, workflows, RAG, memory, evals, MCP. Built on Vercel AI SDK v6. TypeScript-native from scratch (not a port). 300k+ weekly npm downloads, YC-backed. Same language as Next.js frontend = single deploy possible. Built-in playground for local testing. 40+ model provider integrations. | Newer framework (1.0 Jan 2026), smaller community than LangGraph. Fewer battle-tested production deployments. Python pipeline code would need porting. | **Strong contender** |
| **FastAPI + LangGraph (Python)** | Production-proven (Klarna, Uber, LinkedIn). Graph-based state machines with checkpointing, time-travel debugging, durable execution. Pydantic-native. Existing Python pipeline code stays as-is. | Separate deploy from frontend. Steeper learning curve. Heavier abstractions. | **Strong contender** |
| **FastAPI + PydanticAI (Python)** | Type-safe, lightweight, Pydantic-native. Durable execution via Temporal/DBOS. Excellent Logfire observability. Cleaner API than LangGraph for simpler agent patterns. 25+ model providers. | Less suited for complex multi-agent graphs than LangGraph. Newer. | **Consider** |
| **Next.js API routes + Vercel AI SDK v6** | Single deploy. AI SDK v6 has native agents, tool loops, streaming, structured output. AI Gateway for 100+ models. | No built-in workflow orchestration, RAG, or memory — more DIY. | Viable but more glue code |
| **LangGraph Platform (Cloud)** | Managed hosting, built-in streaming + persistence | Vendor lock-in, cost, less control | Consider for Phase 3 |

**The real question: Mastra (TS) or LangGraph/PydanticAI (Python)?**

Arguments for **Mastra**:
- Single language across the entire stack (frontend + backend + pipeline)
- Built-in RAG with chunking, embedding, and vector store support
- Built-in evals — directly relevant to the A/B comparison framework
- Built-in memory — conversation persistence comes for free
- Vercel AI SDK v6 underneath means best-in-class streaming and `useChat` integration
- Deploying as a single Next.js app on Vercel is simpler than managing two services
- MCP support for tool interop

Arguments for **Python (LangGraph or PydanticAI)**:
- Existing pipeline code is Python — no porting needed
- LangGraph is the most production-proven agent framework (checkpointing, durability)
- JSON Logic execution libraries are more mature in Python
- The legal AI / NLP ecosystem is Python-first
- If the project grows, Python has more ML/data science tooling

**Recommendation: Mastra** — for this project specifically, the benefits of single-language full-stack, built-in RAG + evals + memory, and simplified deployment outweigh the Python ecosystem advantages. The existing Python pipeline is small enough to port. JSON Logic execution works fine in JS (`json-logic-js` is already in the frontend). The core hypothesis test (law-as-code vs RAG) benefits more from rapid iteration speed than from battle-hardened infrastructure.

**Fallback**: If Mastra's RAG or agent primitives hit limitations during implementation, pivot to **FastAPI + PydanticAI** for the backend (cleaner than LangGraph for this use case) with the frontend still using Vercel AI SDK v6.

### 2.2 LLM Orchestration

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Mastra Agents + Workflows** | Agents handle open-ended tool-calling; Workflows handle deterministic multi-step orchestration (branching, parallel, suspend/resume). Built on Vercel AI SDK v6 Agent abstraction. | Newer, less battle-tested than LangGraph | **Recommended** (if Mastra backend) |
| **LangGraph** | Most production-proven. Graph-based state machines, checkpointing, time-travel debugging. | Steep learning curve, heavy abstractions | **Recommended** (if Python backend) |
| **PydanticAI** | Type-safe, clean API, durable execution via Temporal. Streams via AG-UI protocol. | Less suited for complex multi-agent graphs | Strong Python alternative |
| **Vercel AI SDK v6 (standalone)** | Native Agent class with ToolLoopAgent, human-in-the-loop approval, subagents. | No built-in workflow orchestration beyond tool loops | Viable for simpler agent |
| **OpenAI Agents SDK** | Easy, handoff-based multi-agent. | OpenAI model lock-in | Not recommended |
| **Claude Agent SDK** | Best MCP integration. | Anthropic lock-in | Not recommended |

**Decision**: If going with Mastra, use its **Agents** for the chatbot (tool-calling, streaming) and **Workflows** for the law-to-code pipeline (deterministic interpret → validate → review loop). If going Python, use PydanticAI for cleaner ergonomics than LangGraph for this specific use case.

### 2.3 LLM Model Selection (April 2026 Landscape)

The model landscape has shifted dramatically. No single model dominates all categories.

| Model | Strengths | Pricing (in/out per 1M tokens) | Best for in this project |
|---|---|---|---|
| **Claude Opus 4.6** | #1 coding (80.8% SWE-bench), best instruction-following, best uncertainty calibration, 1M context, 128K output. τ²-bench retail 91.9%. | ~$15/$75 | **Primary chatbot model** — best at careful legal reasoning, honest about uncertainty, excellent structured output. Long context ideal for statute analysis. |
| **GPT-5.4** | #1 autonomous computer use (75% OSWorld), fastest response times, 256K context, native reasoning. | ~$10/$30 | Alternative chatbot, good for tool-calling. |
| **Gemini 3.1 Pro** | #1 reasoning (94.3% GPQA Diamond), 2M context (longest), best value. | $2/$12 | **Pipeline model** — cheapest frontier model, excellent for batch law-to-code conversion. 2M context means entire statute chapters in one pass. |
| **Claude Sonnet 4** | Strong coding/reasoning at lower cost than Opus. | ~$3/$15 | Pipeline reviewer, intent routing |
| **GPT-4o-mini** | Fast, cheap, good enough for simple tasks. | ~$0.15/$0.60 | Intent classification, simple routing |
| **MiniMax M2.7** | Matches Opus 4.6 on coding at 1/20th cost. | Very low | Worth evaluating for pipeline batch processing |

**Decision:**
- **Chatbot**: Claude Opus 4.6 (primary) — best at legal reasoning + uncertainty calibration (critical for legal advice). Configurable fallback to GPT-5.4.
- **Pipeline (interpret/review)**: Gemini 3.1 Pro — 2M context window means we can include entire statute chapters + cross-references in one pass, at the lowest cost. Use Opus 4.6 for the reviewer agent for quality diversity.
- **Routing/classification**: GPT-4o-mini or Claude Sonnet 4
- **All models configurable** — the framework should make it trivial to swap.

### 2.4 Vector Store

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **ChromaDB** | Simple, embedded, no infra | Not production-grade, limited features | Good for prototyping |
| **Qdrant** | Fast, good filtering, runs locally or hosted | Another service to run | **Recommended** |
| **pgvector (PostgreSQL)** | Reuse Postgres for everything (conversations + vectors) | Slower at scale, less sophisticated ANN | Good compromise |
| **Pinecone** | Managed, fast, serverless tier | Vendor lock-in, cost | Consider for production |
| **LanceDB** | Embedded, no server, good for prototyping | Less mature | Alternative to Chroma |

**Decision: Start with Qdrant** (can run locally in Docker or use Qdrant Cloud free tier). It handles the ~54k statute chunks well and supports metadata filtering and hybrid search. If simplicity is paramount, pgvector is the backup since we need Postgres anyway for conversations.

### 2.5 Embedding Model (2026 Landscape)

The embedding space has evolved significantly. Note: changing embedding models means re-embedding the entire corpus, so this choice is sticky.

| Option | Dimensions | MTEB Score | Cost/1M tokens | Notes | Recommendation |
|---|---|---|---|---|---|
| **Gemini Embedding 001** | Variable | 68.32 (#1 MTEB) | $0.006 (estimate) | Top benchmark score, cheap | **Recommended** |
| **Voyage voyage-3-large** | 1024 | ~67 | $0.06–0.18 | Best for code + technical docs, 32K context | Strong alternative |
| **Cohere embed-v4** | Variable | High | $0.10 | 100+ languages, 90% storage reduction via quantisation | Consider |
| **OpenAI text-embedding-3-large** | 3072 | ~65 | $0.13 | Matryoshka dimension reduction, well-known | Still solid |
| **OpenAI text-embedding-3-small** | 1536 | ~63 | $0.02 | Budget option | Budget option |
| **BGE-M3 (open source)** | 1024 | ~65 | Free (self-hosted) | Hybrid dense+sparse, multi-lingual | Best if self-hosting |

**Decision: Gemini Embedding 001** — top MTEB score and very cheap. For 54k statutes (~5M tokens) the embedding cost is negligible regardless of model. If you want to avoid Google dependency, Voyage voyage-3-large is the best alternative for technical/legal text.

### 2.6 Reranker (2026 Landscape)

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Cohere Rerank v4.0-pro** | Latest Cohere reranker, multilingual, state-of-art quality | API cost per query | **Recommended** |
| **Cohere Rerank v4.0-fast** | Low-latency variant of v4.0 | Slightly lower quality than pro | Good for latency-critical paths |
| **Jina Reranker v3** | 0.6B params, 93 languages, 131K context, 61.94 nDCG-10 BEIR, 10x smaller than generative rerankers | Newer, less proven at scale | Strong alternative |
| **BGE-reranker-v2-m3** | Free, self-hosted, strong quality | Need to host the model | Best if self-hosting |
| **Vercel AI SDK reranking** | Built-in reranking support in AI SDK v6 | Tied to Vercel ecosystem | Native option if using AI SDK |

**Decision: Cohere Rerank v4.0-pro** — best quality, simple integration. If latency matters, use v4.0-fast for the interactive chatbot and v4.0-pro for the eval pipeline. Jina Reranker v3 is a strong budget alternative with impressive benchmark numbers.

### 2.7 Database (Conversations & Sessions)

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **PostgreSQL (Supabase)** | Managed, free tier, auth built-in, can add pgvector | External dependency | **Recommended** |
| **SQLite** | Zero infra, embedded | Not great for concurrent writes, no managed option | Good for local dev |
| **PostgreSQL (self-hosted)** | Full control | Ops burden | Use Supabase instead |
| **Redis** | Fast for sessions/rate-limiting | Not for conversation storage | Use alongside Postgres |

**Decision: PostgreSQL via Supabase** for conversations, rate-limiting counters, and session management. Free tier is generous. SQLite for local development. Add Redis only if rate-limiting needs get complex.

### 2.8 Retrieval Strategy

```
User Query
    │
    ├──→ Dense Retrieval (embedding similarity) ──→ top-20 candidates
    │
    ├──→ BM25 / Sparse Retrieval ──────────────────→ top-20 candidates
    │
    └──→ Reciprocal Rank Fusion (RRF) ────────────→ top-20 merged
                                                         │
                                                         ▼
                                              Cross-Encoder Reranker
                                                         │
                                                         ▼
                                                   top-5 statutes
                                                   (with scores)
```

**Hybrid search (BM25 + dense) with reranking is the gold standard** for this type of retrieval. Legal text has specific terminology that BM25 handles well, while dense retrieval captures semantic meaning.

### 2.9 Frontend Framework

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Next.js 15 (App Router)** | Already in codebase, SSR, great ecosystem, Vercel deploy | Heavier than needed for chat-only | **Recommended** |
| **Vite + React** | Lighter, faster dev | No SSR (not needed for chat app), separate from existing code | Alternative |

**Decision: Next.js 15** — continue with existing frontend foundation, add chat UI as new route/page.

### 2.10 Chat UI Component

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Vercel AI SDK v6** (`ai` + `@ai-sdk/react`) | Best-in-class streaming hooks, `useChat`, tool-call rendering, native agent support, structured output streaming, AI Gateway for 100+ models with zero markup. Sub-50ms latency with caching. | Slightly opinionated | **Recommended** |
| **Mastra client hooks** | Built on Vercel AI SDK, adds memory/thread management | Adds a layer; AI SDK v6 alone may suffice for the frontend | Use if Mastra backend |
| **Custom WebSocket + state** | Full control | Lots of boilerplate | Not recommended |

**Decision: Vercel AI SDK v6** — it's the foundation layer regardless of whether we use Mastra (which is built on it). AI SDK v6's Agent abstraction, `useChat` hook, tool-call events, and streaming work seamlessly with Next.js. The AI Gateway feature ($5/mo free credit, zero markup on provider pricing) is a bonus for BYOK-style multi-provider support.

### 2.11 JSON Logic Execution

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **`json-logic-js` (npm)** | Already in frontend, well-tested | JavaScript only | Keep for frontend |
| **`json_logic` Python** | Native Python | Library is unmaintained, has bugs (noted in README TODO) | Need patching |
| **Custom Python executor** | Full control, can add legal-specific operators | Development cost | **Recommended** for backend |
| **`json-logic-py`** | Another Python option | Also limited | Evaluate |

**Decision: Use `json-logic-js` on frontend (already works). For backend tool execution, use `json_logic` Python library with a thin wrapper that handles errors gracefully and adds logging. If the library has issues, write a minimal evaluator (JSON Logic spec is small).**

---

## 3. Chatbot Agent Architecture

### 3.1 Agent Graph

```
                    ┌──────────────┐
                    │    START     │
                    └──────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  classify_     │  Determine: needs retrieval? follow-up? clarification?
                  │  intent        │
                  └────────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ retrieve │ │ respond  │ │ clarify  │
        │ statutes │ │ directly │ │          │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │            │
             ▼             │            │
      ┌──────────────┐    │            │
      │ rerank &     │    │            │
      │ select       │    │            │
      └──────┬───────┘    │            │
             │             │            │
             ▼             │            │
      ┌──────────────┐    │            │
      │ identify     │    │            │   (JSON Logic mode only)
      │ rules &      │    │            │
      │ variables    │    │            │
      └──────┬───────┘    │            │
             │             │            │
             ▼             │            │
      ┌──────────────┐    │            │
      │ elicit       │◄───┼────────────┘   Ask user for variable values
      │ variables    │    │
      └──────┬───────┘    │
             │             │
             ▼             │
      ┌──────────────┐    │
      │ execute      │    │
      │ json_logic   │    │                Tool call: evaluate rule
      └──────┬───────┘    │
             │             │
             ▼             ▼
      ┌──────────────────────┐
      │   synthesise_answer  │   Combine all evidence, cite statutes
      └──────────┬───────────┘
                 │
                 ▼
          ┌──────────────┐
          │   respond    │   Stream to user
          └──────┬───────┘
                 │
                 ▼
            ┌─────────┐
            │   END   │
            └─────────┘
```

### 3.2 Tool Definitions

```python
tools = [
    {
        "name": "search_statutes",
        "description": "Search Minnesota statutes by semantic query. Returns relevant statute sections with text and relevance scores.",
        "parameters": {
            "query": "string - the search query",
            "top_k": "int - number of results (default 5)",
            "filters": "object - optional filters {chapter?, topic?, exclude_repealed?}"
        }
    },
    {
        "name": "get_statute_rules",
        "description": "Get the JSON Logic rules for a specific statute. Returns executable rules with variable definitions and consequences.",
        "parameters": {
            "statute_id": "string - e.g. '504B.178'"
        }
    },
    {
        "name": "evaluate_json_logic",
        "description": "Execute a JSON Logic rule with specific variable values. Returns true/false and the applicable consequences.",
        "parameters": {
            "statute_id": "string",
            "rule_index": "int",
            "variable_values": "object - key-value pairs matching the rule's variable definitions"
        }
    },
    {
        "name": "get_related_statutes",
        "description": "Get statutes that are referenced by or reference the given statute.",
        "parameters": {
            "statute_id": "string"
        }
    }
]
```

### 3.3 RAG-Only Mode

The RAG-only agent uses only `search_statutes` and generates answers directly from the retrieved text. No JSON Logic execution. This is the control group.

### 3.4 State Schema

```python
class ChatState(TypedDict):
    messages: list[BaseMessage]
    retrieved_statutes: list[Statute]
    active_rules: list[ActiveRule]       # rules being evaluated
    pending_variables: list[Variable]    # variables the user hasn't answered yet
    mode: Literal["json_logic", "rag_only", "comparison"]
    conversation_id: str
    turn_count: int
```

---

## 4. Law-to-Code Pipeline Architecture (Upgraded)

### 4.1 Pipeline Flow

```
Raw Statute JSON
       │
       ▼
┌──────────────────┐
│ Pre-process      │  Clean text, detect cross-references, classify statute type
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Interpret        │  LLM → structured JSON Logic output (Pydantic)
│ (Agent 1)        │  Model: GPT-4o / Claude Sonnet (configurable)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Validate         │  Execute each rule against examples
│ (Programmatic)   │  Check: syntax valid? Examples produce expected results?
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Review           │  LLM reviewer checks completeness/correctness
│ (Agent 2)        │  Uses different model or temperature for diversity
└────────┬─────────┘
         │
    ┌────┴────┐
    │Approved?│
    └────┬────┘
    No   │   Yes
    │    │    │
    ▼    │    ▼
  Loop   │  ┌──────────────────┐
  back   │  │ Post-process     │  Add cross-reference metadata
  to     │  │                  │  Normalise variable names
  Interp │  └────────┬─────────┘
         │           │
         │           ▼
         │    ┌──────────────────┐
         │    │ Score            │  LLM-as-judge evaluation
         │    │ (Evaluator)      │  Log to Langfuse
         │    └────────┬─────────┘
         │             │
         │             ▼
         │       Output JSON
         │
         └── (max 3 iterations)
```

### 4.2 Improvements Over Current Pipeline

| Area | Current | Upgraded |
|---|---|---|
| Model | GPT-4o only (outdated) | Configurable: Gemini 3.1 Pro (best value, 2M context), Claude Opus 4.6 (best coding), GPT-5.4 |
| Validation | None (examples not executed) | Programmatic JSON Logic execution check |
| Cross-references | Not detected | Regex + LLM detection of statute references |
| Variable naming | Inconsistent | Normalised naming convention enforced |
| Error handling | Basic try/catch | Per-statute retry with exponential backoff |
| Checkpointing | Overwrites | Skip already-processed, incremental runs |
| Prompts | Basic, no few-shot | Few-shot examples of excellent interpretations, chain-of-thought |
| Review loop | Exists but not used in batch | Always on, with configurable max iterations |
| Batch size | Hardcoded | CLI configurable |
| Output quality | Variable | Minimum score threshold (e.g. 0.7) to accept |
| Context strategy | Single statute per call | Gemini 3.1 Pro's 2M context = entire chapter + cross-references in one pass |

---

## 5. Cross-Reference Resolution

### 5.1 Approach: Layered Strategy

**Layer 1: Static detection** — Regex patterns to extract statute references from text:
- `§ 504B.235`, `section 504B.235`, `subdivision 3`, `chapter 504B`
- Build adjacency list: `{statute_id → [referenced_ids]}`

**Layer 2: LLM-enhanced** — During law-to-code pipeline, the LLM identifies:
- Which references are logically relevant (not just mentioned)
- The relationship type: `depends_on`, `exception_to`, `penalty_for`, `defines_term_in`

**Layer 3: Graph traversal** — At query time:
- When a statute is retrieved, also fetch its direct references (1-hop)
- For cross-reference questions, traverse the graph to compose logic

### 5.2 Graph RAG Consideration

| Approach | Pros | Cons | Recommendation |
|---|---|---|---|
| **Simple adjacency list + 1-hop fetch** | Fast, simple, deterministic | Doesn't capture deep chains | **Recommended for Phase 1** |
| **Knowledge graph (Neo4j)** | Rich queries, path finding | Heavy infrastructure, overkill initially | Phase 3 |
| **LLM-driven graph traversal** | Flexible, can reason about relevance | Slow, expensive per query | Hybrid with simple graph |
| **Microsoft GraphRAG** | Pre-built, community summaries | Complex setup, may not fit legal domain well | Evaluate in Phase 2 |

**Decision: Start with static adjacency list. The LLM agent already handles multi-hop reasoning through iterative tool calls. Layer in graph DB if evaluation shows cross-reference questions underperform.**

---

## 6. Evaluation Architecture

### 6.1 Evaluation Pipeline

```
Golden Dataset (100+ questions)
       │
       ├──→ Run through JSON Logic chatbot ──→ Collect answers, tool calls, latencies
       │
       ├──→ Run through RAG-only chatbot ────→ Collect answers, retrieved docs, latencies
       │
       ▼
┌──────────────────────┐
│  Evaluate & Compare  │
│                      │
│  Per-question:       │
│  • Answer correctness (LLM-as-judge vs golden answer)
│  • Factual grounding (every claim → statute citation?)
│  • Hallucination detection
│  • Retrieval precision/recall (vs golden statute set)
│  • Conversation efficiency (# turns to answer)
│  • Latency
│                      │
│  Aggregate:          │
│  • Mean scores per system
│  • Statistical significance test (paired t-test / Wilcoxon)
│  • Per-topic breakdown
│  • Per-difficulty breakdown
│  └──────────────────────┘
           │
           ▼
    Evaluation Report
    (tables, charts, per-question drill-down)
```

### 6.2 Evaluation Tools

| Tool | Use |
|---|---|
| **RAGAS** | RAG evaluation metrics (faithfulness, relevance, context precision/recall) |
| **DeepEval** | LLM evaluation framework, G-Eval, hallucination detection |
| **Custom scripts** | Paired comparison, statistical tests, report generation |
| **Langfuse** | Store all traces with scores for dashboard analysis |

---

## 7. Deployment Architecture

### 7.1 Development

```
Local machine (Mastra option):
├── Next.js + Mastra (pnpm dev, port 3000)  # Single process
├── Mastra Playground (built-in agent testing UI)
├── Qdrant (Docker, port 6333)
└── SQLite (dev database)

Local machine (Python option):
├── Next.js frontend (pnpm dev, port 3000)
├── FastAPI backend (uvicorn, port 8000)
├── Qdrant (Docker, port 6333)
└── SQLite (dev database)
```

### 7.2 Production

| Component | Mastra (Option A) | Python (Option B) |
|---|---|---|
| App | **Vercel** (single deploy: frontend + API routes + Mastra) | Vercel (frontend) + Railway (FastAPI backend) |
| Vector DB | **Qdrant Cloud** (free tier) | Same |
| Database | **Supabase** (Postgres) | Same |
| Tracing | **Langfuse Cloud** or Vercel AI SDK observability | Langfuse Cloud or Pydantic Logfire |

### 7.3 Cost Estimate (Monthly, Post-Launch)

| Item | Estimated cost | Notes |
|---|---|---|
| LLM API (free tier users) | $30–150 | Gemini 3.1 Pro is 5-10x cheaper than old GPT-4o pricing |
| LLM API (BYOK users) | $0 | User pays |
| Vercel | $0 | Free tier (Pro $20/mo if needed) |
| Railway (Python option only) | $5–10 | Hobby plan |
| Qdrant Cloud | $0 | Free tier (1GB) |
| Supabase | $0 | Free tier |
| Cohere Rerank v4.0 | $10–30 | ~$1/1k queries |
| Langfuse | $0 | Free tier |
| Vercel AI Gateway | $0–5 | $5/mo free credit |
| **Total (Mastra)** | **$40–185/mo** | Simpler, cheaper (no separate backend hosting) |
| **Total (Python)** | **$45–195/mo** | Slightly more due to Railway |

---

## 8. Project Structure (Proposed)

### Option A: Mastra full-stack (recommended)

```
json-lawgic/
├── plans/                           # This document + requirements
├── data/
│   ├── default/                     # Raw MN statutes (~54k)
│   ├── interpreted/                 # JSON Logic interpretations
│   ├── golden/                      # Golden evaluation dataset
│   │   ├── questions.json           # 100+ annotated questions
│   │   └── retrieval_labels.json    # Per-question relevant statutes
│   └── cross_references/            # Statute cross-reference graph
│       └── graph.json
├── src/                             # Mastra backend (TypeScript)
│   ├── mastra/
│   │   ├── index.ts                 # Mastra instance config
│   │   ├── agents/
│   │   │   ├── chat-agent.ts        # Main chatbot agent (tool-calling)
│   │   │   └── rag-agent.ts         # RAG-only baseline agent
│   │   ├── tools/
│   │   │   ├── search-statutes.ts   # Vector search + rerank
│   │   │   ├── evaluate-logic.ts    # JSON Logic execution tool
│   │   │   ├── get-statute-rules.ts # Fetch rules for a statute
│   │   │   └── get-related.ts       # Cross-reference lookup
│   │   ├── workflows/
│   │   │   └── law-to-code.ts       # Pipeline: interpret → validate → review
│   │   ├── rag/
│   │   │   ├── embedder.ts          # Embedding + indexing
│   │   │   ├── retriever.ts         # Hybrid retrieval
│   │   │   └── reranker.ts          # Cross-encoder reranking
│   │   └── evals/
│   │       ├── answer-correctness.ts
│   │       ├── faithfulness.ts
│   │       └── retrieval-metrics.ts
│   └── lib/
│       ├── json-logic.ts            # JSON Logic executor wrapper
│       ├── cross-refs.ts            # Cross-reference graph
│       └── db.ts                    # Database client (Drizzle + Supabase)
├── app/                             # Next.js frontend (extended)
│   ├── chat/                        # Chat interface
│   │   ├── page.tsx
│   │   ├── chat-message.tsx
│   │   ├── tool-call-card.tsx
│   │   ├── statute-reference.tsx
│   │   ├── confidence-badge.tsx
│   │   └── split-view.tsx
│   ├── api/                         # Next.js API routes (Mastra endpoints)
│   │   └── chat/route.ts
│   └── ...existing pages
├── scripts/                         # Utility scripts
│   ├── embed-statutes.ts            # One-time: embed all statutes
│   ├── build-cross-refs.ts          # One-time: build cross-reference graph
│   └── run-evaluation.ts            # Run A/B evaluation
└── markdown/                        # DSL specs
```

### Option B: Python backend fallback

```
json-lawgic/
├── backend/                         # FastAPI + PydanticAI
│   ├── pyproject.toml
│   ├── src/
│   │   ├── api/                     # FastAPI routes
│   │   ├── agents/                  # PydanticAI agents
│   │   ├── rag/                     # Retrieval components
│   │   ├── pipeline/                # Law-to-code (upgraded)
│   │   └── eval/                    # Evaluation framework
│   └── tests/
├── frontend/                        # Next.js + Vercel AI SDK v6
│   └── src/...
└── ...same data/ structure
```

---

## 9. Technology Stack Summary

### Option A: Mastra (TypeScript full-stack) — Recommended

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind, Vercel AI SDK v6, shadcn/ui |
| **Backend** | Mastra (TypeScript) — agents, workflows, RAG, memory, evals |
| **LLM (Chatbot)** | Claude Opus 4.6 (primary), GPT-5.4 (alternative) |
| **LLM (Pipeline)** | Gemini 3.1 Pro (interpreter), Claude Opus 4.6 (reviewer) |
| **LLM (Routing)** | GPT-4o-mini / Claude Sonnet 4 |
| **Embeddings** | Gemini Embedding 001 (or Voyage voyage-3-large) |
| **Vector DB** | Qdrant (or pgvector in Supabase) |
| **Reranker** | Cohere Rerank v4.0-pro |
| **Database** | PostgreSQL (Supabase) / SQLite (dev) |
| **Tracing** | Langfuse (or Vercel AI SDK observability dashboard) |
| **Evaluation** | Mastra Evals + RAGAS + custom scripts |
| **Deploy** | Vercel (single deploy) + Qdrant Cloud + Supabase |

### Option B: Python backend fallback

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, Vercel AI SDK v6, shadcn/ui |
| **Backend** | FastAPI + PydanticAI (or LangGraph) |
| **LLM** | Same model choices as Option A |
| **Tracing** | Langfuse (or Pydantic Logfire if using PydanticAI) |
| **Deploy** | Vercel (frontend) + Railway (backend) + Qdrant Cloud + Supabase |

---

## 10. Risk & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| JSON Logic can't represent all legal concepts (e.g. "reasonable", "good faith") | Core hypothesis weakened | Hybrid approach: tool-calling for deterministic logic + RAG for nuanced interpretation. Acknowledge limitations in UX. |
| Cross-references create deep dependency chains | Incomplete answers | Limit graph traversal depth; LLM can reason about references it can't execute |
| Rate-limited free tier gets abused | High API costs | IP-based limits, CAPTCHA on heavy use, BYOK as escape valve |
| LLM-as-judge evaluation is noisy | Unreliable comparisons | Use multiple judges (Opus 4.6 + GPT-5.4), aggregate scores, spot-check with human review |
| Legal liability from incorrect answers | Legal risk | Prominent disclaimers, no storage of personal legal situations, terms of use |
| Embedding quality for legal text | Poor retrieval | Gemini Embedding 001 tops MTEB; also consider Voyage for technical/legal text. Fine-tune in Phase 3 if needed. |
| Mastra framework maturity | Hitting framework limitations mid-build | Mastra is built on Vercel AI SDK v6 — can drop down to raw AI SDK if needed. PydanticAI is the Python escape hatch. |
| Model API costs spike with frontier models | Budget blow-out | Gemini 3.1 Pro at $2/$12 per 1M tokens for pipeline batch work; reserve Opus 4.6 for chatbot only. MiniMax M2.7 as budget fallback. |

---

## 11. Open Questions for Decision

1. **Mastra (TypeScript) or Python backend?** — This doc recommends Mastra for single-language simplicity and built-in RAG/evals/memory. But if you prefer Python's ML ecosystem or want to keep existing pipeline code unchanged, FastAPI + PydanticAI is the cleanest Python option. LangGraph is overkill for this use case but remains an option if the agent complexity grows.

2. **Qdrant vs pgvector?** — If you want absolute minimal infrastructure, pgvector in Supabase handles both vectors and conversations. Trade-off: slightly worse retrieval quality and no native hybrid search. Qdrant is better but adds a service.

3. **How deep should cross-reference resolution go?** — Start with 1-hop. If evaluation shows multi-hop questions failing, extend. Graph RAG is a Phase 3 enhancement.

4. **Should the law-to-code pipeline be part of the backend or stay separate?** — Recommendation: keep it as a separate CLI tool / batch process (Mastra Workflow or standalone script). It runs offline and doesn't need to be part of the API server.

5. **BYOK key handling** — Keys should never be stored server-side. Option A: send key in every request header (simplest). Option B: use Vercel AI SDK v6's AI Gateway (handles multi-provider routing with user keys). Recommendation: AI Gateway if using Vercel, otherwise Option A with HTTPS.

6. **How to handle statutes that JSON Logic simply can't represent?** — Flag them with a `complexity: "beyond_json_logic"` marker. The chatbot falls back to RAG for these statutes and explains that the logic is too nuanced for formal evaluation.

7. **Which models to use for the golden dataset?** — Generating 100+ high-quality test questions benefits from the best reasoning model. Gemini 3.1 Pro (94.3% GPQA Diamond) is the top reasoning model and cheapest. Use it for dataset generation, have Opus 4.6 review for quality.
