# ONBP Real-Time Quickstart Guide — AI Server Builder

Learn how to clone ONBP from GitHub, set your **NVIDIA API Key**, run the **AI Builder** prompt to generate a new backend server (e.g. *"build a server for photo management"*), and start the server.

---

## 1. Clone & Install Dependencies

```bash
# 1. Clone the ONBP Repository
git clone https://github.com/advijithkumar/Open-Node-Backend-Platform.git
cd Open-Node-Backend-Platform

# 2. Install workspace packages using pnpm
pnpm install

# 3. Build framework workspace
pnpm build
```

---

## 2. Configure Environment & NVIDIA API Key

Create or edit your `.env` configuration file in the project root:

```bash
# Set active AI Provider to NVIDIA
AI_PROVIDER="nvidia"

# Configure your NVIDIA API Key (obtain from https://build.nvidia.com)
NVIDIA_API_KEY="nvapi-YOUR-NVIDIA-API-KEY-HERE"

# (Optional) Override default completion model
NVIDIA_MODEL="meta/llama-3.1-8b-instruct"
```

---

## 3. Build Server using Prompt (`onbp ai:build`)

Run the prompt-driven AI Builder command:

```bash
# Test architecture generation without modifying filesystem (Dry Run)
pnpm -F @onbp/api onbp ai:build "build a server for photo management" --dry-run --provider nvidia

# Scaffold and generate live ONBP server module
pnpm -F @onbp/api onbp ai:build "build a server for photo management" --provider nvidia
```

### What happens under the hood:
1. `onbp ai:build` connects to **NVIDIA AI Foundation** (`https://integrate.api.nvidia.com/v1`) using your `NVIDIA_API_KEY`.
2. Analyses ONBP framework standards (StorageService, AIService, Workflow, Drizzle ORM).
3. Automatically scaffolds a clean module in `apps/api/src/modules/photo-management/` with API routers (`/upload`, `/list`, `/:id`).

---

## 4. Run Doctor & Start the Server

```bash
# 1. Verify framework health using Doctor
pnpm -F @onbp/api onbp doctor

# 2. Run the development server
pnpm -F @onbp/api dev
```

Your API endpoints will be live at `http://localhost:3000/api/v1/photo-management/`!
