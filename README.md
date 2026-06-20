# Knowledge Graph POC – Agentic AI & Conversational Analytics

This is a unified Next.js App Router project integrating conversational AI analytics with a Neo4j knowledge graph. The FastAPI backend has been migrated directly into Next.js API Routes, allowing the entire system to run under a single Next.js process plus a Neo4j container.

## Architecture & Features

- **Frontend UI**: Responsive, glassmorphic dark-mode interface built with Next.js, React 19, and TailwindCSS.
- **Backend API Routes**:
  - `/api/chat`: Runs the natural language to Cypher translation flow using the Cerebras LLM (OpenAI-compatible) and executes queries against Neo4j.
  - `/api/db/health`: Verifies connection to the Neo4j instance and monitors node count.
  - `/api/db/seed`: Wipes and seeds sample relational mock data (Customers, Products, Contracts, Support Cases) into the graph.
- **Explainability Panel**: Real-time inspection of generated Cypher queries and accessed graph records per answer.

---

## Prerequisites

- **Node.js**: `v18+` (Recommended `v20+`)
- **Docker**: For running the Neo4j instance.
- **API Key**: A valid Cerebras API Key (configured by default in `.env.local`).

---

## Getting Started

### 1. Start Neo4j Database
Start the pre-configured Neo4j instance using Docker Compose:
```bash
docker-compose up -d
```
This runs Neo4j with:
- Bolt Protocol on port `7687` (used by Next.js)
- HTTP Console on port `7474` (access via [http://localhost:7474](http://localhost:7474) with `neo4j/password`)

### 2. Configure Environment Variables
Verify that the variables in `.env.local` match your settings:
```ini
# LLM (Cerebras via OpenAI-compatible API)
LLM_BASE_URL="https://api.cerebras.ai/v1"
LLM_API_KEY="your-api-key"
LLM_MODEL_NAME="gpt-oss-120b"

# Neo4j Database
NEO4J_URI="bolt://localhost:7687"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="password"
```

### 3. Run Development Server
Start the Next.js application:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Seed Database
On first launch, click the **"Seed Sample Data"** button on the empty state screen. This will populate the Neo4j instance with sample customers, contracts, and support tickets so you can begin querying immediately.

---

## Example Questions to Try

- *"Why is Acme Corp at risk of renewal?"*
- *"Which customers have open critical support cases?"*
- *"List all products owned by Enterprise-tier customers."*
- *"What is the total contract value for Umbrella Ltd?"*
- *"Show me all contracts expiring before 2025."*
