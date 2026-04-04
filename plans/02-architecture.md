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

### 2.1 Backend Framework

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **FastAPI + LangGraph** | Native async, excellent streaming (SSE/WebSocket), Pydantic-native, huge ecosystem, pairs perfectly with LangChain/LangGraph | Separate deploy from Next.js frontend | **Recommended** |
| **Next.js API routes (Node.js)** | Single deploy, same repo as frontend | Poor LangChain/LangGraph support in JS, JSON Logic execution less mature in JS, would need to rewrite Python pipeline | Not recommended |
| **LangServe** | Built for LangChain, auto-generates endpoints | Less flexibility, deprecated in favour of LangGraph Platform | Not recommended |
| **LangGraph Platform (Cloud)** | Managed hosting for LangGraph agents, built-in streaming, persistence | Vendor lock-in, cost, less control | Consider for Phase 3 |

**Decision: FastAPI + LangGraph**. The existing Python codebase, LangChain/LangGraph integrations, and JSON Logic execution all favour Python. FastAPI gives us native SSE streaming and Pydantic model sharing.

### 2.2 LLM Orchestration

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **LangGraph (stateful agents)** | Already used in codebase, excellent for multi-step tool-calling, built-in state management, checkpointing | Learning curve for complex graphs | **Recommended** |
| **Plain LangChain** | Simpler | No state management, harder to handle multi-turn tool-calling loops | Not recommended for the chatbot |
| **Raw OpenAI/Anthropic SDK** | Full control, lowest abstraction | Must build all orchestration from scratch | Not recommended |
| **Instructor + raw SDK** | Great for structured output | No agent/tool-calling framework | Good for pipeline only |

**Decision: LangGraph for the chatbot agent, with tool definitions**. Use the existing LangGraph graph_interpreter pattern for the law-to-code pipeline. The chatbot agent graph looks like:

```
START → route_intent → [retrieve_statutes] → [identify_rules] → [ask_clarifying_questions] 
    → [execute_json_logic] → [synthesise_answer] → respond → (loop if follow-up)
```

### 2.3 LLM Model Selection

| Model | Use case | Notes |
|---|---|---|
| **GPT-4o** | Chatbot, law-to-code pipeline | Best tool-calling support, fast, good structured output |
| **Claude 3.5/4 Sonnet** | Alternative chatbot, pipeline reviewer | Excellent at careful legal reasoning, long context |
| **GPT-4o-mini / Claude Haiku** | Embedding classification, intent routing | Low-cost for simple decisions |
| **Gemini 2.5 Pro** | Alternative for pipeline | Good at structured output, competitive pricing |

**Decision: Default to GPT-4o for tool-calling chatbot (best native tool-calling). Support Claude as configurable alternative. Use GPT-4o-mini for intent routing. Pipeline should support model switching.**

### 2.4 Vector Store

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **ChromaDB** | Simple, embedded, no infra | Not production-grade, limited features | Good for prototyping |
| **Qdrant** | Fast, good filtering, runs locally or hosted | Another service to run | **Recommended** |
| **pgvector (PostgreSQL)** | Reuse Postgres for everything (conversations + vectors) | Slower at scale, less sophisticated ANN | Good compromise |
| **Pinecone** | Managed, fast, serverless tier | Vendor lock-in, cost | Consider for production |
| **LanceDB** | Embedded, no server, good for prototyping | Less mature | Alternative to Chroma |

**Decision: Start with Qdrant** (can run locally in Docker or use Qdrant Cloud free tier). It handles the ~54k statute chunks well and supports metadata filtering and hybrid search. If simplicity is paramount, pgvector is the backup since we need Postgres anyway for conversations.

### 2.5 Embedding Model

| Option | Dimensions | Quality | Cost | Recommendation |
|---|---|---|---|---|
| **OpenAI text-embedding-3-large** | 3072 (or 256–1536 via dim reduction) | Excellent | $0.13/M tokens | **Recommended** |
| **OpenAI text-embedding-3-small** | 1536 | Good | $0.02/M tokens | Budget option |
| **Cohere embed-v3** | 1024 | Excellent, built-in search types | $0.10/M tokens | Strong alternative |
| **BGE-M3 (open source)** | 1024 | Very good, multi-lingual, hybrid | Free (self-hosted) | Best if cost-sensitive |
| **Jina embeddings v3** | 1024 | Good legal domain performance | $0.02/M tokens | Consider |

**Decision: OpenAI text-embedding-3-large** for best quality with minimal infrastructure. 54k statutes ≈ ~5M tokens to embed ≈ $0.65 one-time cost. Trivial.

### 2.6 Reranker

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Cohere Rerank v3.5** | Best-in-class, simple API | API cost per query | **Recommended** |
| **BGE-reranker-v2-m3** | Free, self-hosted, strong quality | Need to host the model | Good alternative |
| **Jina Reranker v2** | Good quality, API | Less proven | Alternative |
| **FlashRank** | Lightweight, fast, local | Lower quality | Budget option |
| **LLM-based reranking** | Use GPT-4o-mini to rerank | Slow, expensive at scale | Not recommended for production |

**Decision: Cohere Rerank v3.5** — best quality, simple integration, low cost per query (~$1/1k searches). Fall back to BGE-reranker if self-hosting is preferred.

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
| **Remix** | Good streaming primitives | Less ecosystem | Not recommended |

**Decision: Next.js 15** — continue with existing frontend foundation, add chat UI as new route/page.

### 2.10 Chat UI Component

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **Vercel AI SDK (`ai` package)** | Best-in-class streaming hooks, `useChat`, tool-call rendering | Slightly opinionated | **Recommended** |
| **Custom WebSocket + state** | Full control | Lots of boilerplate | Not recommended |
| **CopilotKit** | Pre-built chat UI | Too opinionated, less control | Not recommended |

**Decision: Vercel AI SDK** (`ai` + `@ai-sdk/react`). It provides `useChat` hook with native streaming, tool-call events, and works seamlessly with Next.js. We render the tool-call display ourselves for full control over UX.

### 2.11 JSON Logic Execution

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **`json-logic-js` (npm)** | Already in frontend, well-tested | JavaScript only | Keep for frontend |
| **`json_logic` Python** | Native Python | Library is unmaintained, has bugs (noted in README TODO) | Need patching |
| **Custom Python executor** | Full control, can add legal-specific operators | Development cost | **Recommended** for backend |
| **`json-logic-py`** | Another Python option | Also limited | Evaluate |

**Decision: Use `json-logic-js` on frontend (already works). For backend tool execution, use `json_logic` Python library with a thin wrapper that handles errors gracefully and adds logging. If the library has issues, write a minimal evaluator (JSON Logic spec is small).**

---

## 3. Chatbot Agent Architecture (LangGraph)

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
| Model | GPT-4o only | Configurable: GPT-4o, Claude Sonnet, Gemini Pro |
| Validation | None (examples not executed) | Programmatic JSON Logic execution check |
| Cross-references | Not detected | Regex + LLM detection of statute references |
| Variable naming | Inconsistent | Normalised naming convention enforced |
| Error handling | Basic try/catch | Per-statute retry with exponential backoff |
| Checkpointing | Overwrites | Skip already-processed, incremental runs |
| Prompts | Basic, no few-shot | Few-shot examples of excellent interpretations, chain-of-thought |
| Review loop | Exists but not used in batch | Always on, with configurable max iterations |
| Batch size | Hardcoded | CLI configurable |
| Output quality | Variable | Minimum score threshold (e.g. 0.7) to accept |

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
Local machine:
├── Next.js frontend (pnpm dev, port 3000)
├── FastAPI backend (uvicorn, port 8000)
├── Qdrant (Docker, port 6333)
└── SQLite (dev database)
```

### 7.2 Production

| Component | Platform | Why |
|---|---|---|
| Frontend | **Vercel** | Free tier, excellent Next.js support, global CDN |
| Backend API | **Railway** or **Fly.io** | Simple Docker deploy, good free/hobby tier, persistent storage |
| Vector DB | **Qdrant Cloud** (free tier) or self-hosted on Railway | 1GB free, sufficient for 54k docs |
| Database | **Supabase** (Postgres) | Free tier: 500MB, 50k rows, built-in auth |
| Tracing | **Langfuse Cloud** | Free tier generous for this use case |

### 7.3 Cost Estimate (Monthly, Post-Launch)

| Item | Estimated cost | Notes |
|---|---|---|
| LLM API (free tier users) | $50–200 | Depends on usage, rate-limited |
| LLM API (BYOK users) | $0 | User pays |
| Vercel | $0 | Free tier |
| Railway (backend) | $5–10 | Hobby plan |
| Qdrant Cloud | $0 | Free tier |
| Supabase | $0 | Free tier |
| Cohere Rerank | $10–30 | ~$1/1k queries |
| Langfuse | $0 | Free tier |
| **Total** | **$65–240/mo** | Scales with free-tier usage |

---

## 8. Project Structure (Proposed)

```
json-lawgic/
├── plans/                         # This document + requirements
├── data/
│   ├── default/                   # Raw MN statutes (~54k)
│   ├── interpreted/               # JSON Logic interpretations
│   ├── golden/                    # Golden evaluation dataset
│   │   ├── questions.json         # 100+ annotated questions
│   │   └── retrieval_labels.json  # Per-question relevant statutes
│   └── cross_references/          # Statute cross-reference graph
│       └── graph.json
├── backend/                       # Python backend (NEW)
│   ├── pyproject.toml
│   ├── src/
│   │   ├── api/                   # FastAPI routes
│   │   │   ├── chat.py            # Chat endpoint (SSE streaming)
│   │   │   ├── statutes.py        # Statute lookup endpoints
│   │   │   └── eval.py            # Evaluation endpoints
│   │   ├── agents/                # LangGraph agents
│   │   │   ├── chat_agent.py      # Main chatbot agent graph
│   │   │   ├── tools.py           # Tool definitions
│   │   │   └── state.py           # Agent state schemas
│   │   ├── rag/                   # RAG components
│   │   │   ├── embedder.py        # Embedding + indexing
│   │   │   ├── retriever.py       # Hybrid retrieval
│   │   │   ├── reranker.py        # Cross-encoder reranking
│   │   │   └── store.py           # Vector store interface
│   │   ├── json_logic/            # JSON Logic execution
│   │   │   ├── executor.py        # Rule evaluation
│   │   │   └── cross_refs.py      # Cross-reference resolution
│   │   ├── pipeline/              # Law-to-code (upgraded from src/json_lawgic/)
│   │   │   ├── interpreter.py
│   │   │   ├── reviewer.py
│   │   │   ├── validator.py
│   │   │   ├── pipeline.py
│   │   │   └── prompts.py
│   │   ├── eval/                  # Evaluation framework
│   │   │   ├── runner.py          # Run both systems on golden set
│   │   │   ├── metrics.py         # Scoring functions
│   │   │   └── report.py          # Generate comparison report
│   │   └── db/                    # Database models & queries
│   │       ├── models.py
│   │       └── conversations.py
│   └── tests/
├── frontend/                      # Next.js frontend (EXTENDED)
│   └── src/
│       ├── app/
│       │   ├── chat/              # NEW: Chat interface
│       │   │   ├── page.tsx
│       │   │   ├── chat-message.tsx
│       │   │   ├── tool-call-card.tsx
│       │   │   ├── statute-reference.tsx
│       │   │   ├── confidence-badge.tsx
│       │   │   └── split-view.tsx
│       │   └── ...existing pages
│       └── lib/
│           └── api.ts             # Backend API client
├── markdown/                      # DSL specs
└── scripts/                       # Utility scripts
    ├── embed_statutes.py          # One-time: embed all statutes
    ├── build_cross_refs.py        # One-time: build cross-reference graph
    └── run_evaluation.py          # Run A/B evaluation
```

---

## 9. Technology Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind, Vercel AI SDK, shadcn/ui |
| **Backend** | Python 3.12, FastAPI, LangGraph, LangChain, Pydantic v2 |
| **LLM** | GPT-4o (primary), Claude Sonnet (alternative), GPT-4o-mini (routing) |
| **Embeddings** | OpenAI text-embedding-3-large |
| **Vector DB** | Qdrant |
| **Reranker** | Cohere Rerank v3.5 |
| **Database** | PostgreSQL (Supabase) / SQLite (dev) |
| **Tracing** | Langfuse |
| **Evaluation** | RAGAS, DeepEval, custom scripts |
| **Deploy** | Vercel (frontend), Railway (backend), Qdrant Cloud, Supabase |

---

## 10. Risk & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| JSON Logic can't represent all legal concepts (e.g. "reasonable", "good faith") | Core hypothesis weakened | Hybrid approach: tool-calling for deterministic logic + RAG for nuanced interpretation. Acknowledge limitations in UX. |
| Cross-references create deep dependency chains | Incomplete answers | Limit graph traversal depth; LLM can reason about references it can't execute |
| Rate-limited free tier gets abused | High API costs | IP-based limits, CAPTCHA on heavy use, BYOK as escape valve |
| LLM-as-judge evaluation is noisy | Unreliable comparisons | Use multiple judges, aggregate scores, spot-check with human review |
| Legal liability from incorrect answers | Legal risk | Prominent disclaimers, no storage of personal legal situations, terms of use |
| Embedding quality for legal text | Poor retrieval | Fine-tune embeddings on legal corpus (Phase 3), or use legal-specific model |

---

## 11. Open Questions for Decision

1. **Monorepo vs separate repos?** — Recommendation: monorepo (simpler for this project size). The existing repo already has both Python and Next.js.

2. **Qdrant vs pgvector?** — If you want absolute minimal infrastructure, pgvector in Supabase handles both vectors and conversations. Trade-off: slightly worse retrieval quality and no native hybrid search. Qdrant is better but adds a service.

3. **How deep should cross-reference resolution go?** — Start with 1-hop. If evaluation shows multi-hop questions failing, extend. Graph RAG is a Phase 3 enhancement.

4. **Should the law-to-code pipeline be part of the backend or stay separate?** — Recommendation: keep it as a separate CLI tool / batch process. It runs offline and doesn't need to be part of the API server. Share code via a shared `pipeline` package.

5. **BYOK key handling** — Keys should never be stored server-side. Option A: send key in every request header (simplest). Option B: encrypt in session cookie. Recommendation: Option A with HTTPS.

6. **How to handle statutes that JSON Logic simply can't represent?** — Flag them with a `complexity: "beyond_json_logic"` marker. The chatbot falls back to RAG for these statutes and explains that the logic is too nuanced for formal evaluation.
