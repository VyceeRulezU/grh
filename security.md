# Security Assessment & Policy

## 🛡️ Executive Summary
This document outlines the security audit results, identified vulnerabilities, and implemented fixes for the Governance Resource Hub (GRH) V2.

## 🚨 Critical Findings & Fixes

### 1. Exposed OpenAI API Key (Resolved)
- **Vulnerability**: The `VITE_OPENAI_API_KEY` was being used directly in the frontend (`ExplorePage.jsx`). Environment variables prefixed with `VITE_` are bundled into the client-side code, exposing them to any user via the browser's developer tools.
- **Fix**: 
  - Created a secure **Supabase Edge Function** (`openai-assistant`) to act as a proxy.
  - The API key is now stored securely in Supabase Secrets (backend-only).
  - The frontend now invokes the Edge Function, ensuring the key is never exposed to the client.
- **Action Required**: 
  - [ ] Remove `VITE_OPENAI_API_KEY` from your Vercel/Frontend environment variables.
  - [ ] Add `OPENAI_API_KEY` to your Supabase project secrets:
    ```bash
    supabase secrets set OPENAI_API_KEY=sk-...
    ```

## 🔍 Security Audit Results

### Dependency Audit (`npm audit`)
- **Status**: ✅ **Resolved**. All 17 vulnerabilities have been fixed using `npm audit fix --force`.
- **Details**:
  - The updates included major version bumps for several sub-dependencies (including `braces`, `micromatch`, and `ws`) to address critical and high-severity security advisories.
  - Current audit status: `found 0 vulnerabilities`.

### Secret Scanning (`gitleaks`)
- **Status**: ✅ No persistent hardcoded secrets found in the current codebase (excluding the resolved environment variable exposure).
- **Manual Grep**: Verified that no patterns matching `sk-...` (OpenAI) or `AIza...` (Google) are present in the source files.

## 🔐 Security Best Practices
- **Environment Variables**: Never use the `VITE_` prefix for sensitive keys (API keys, Database secrets). Use them only for public configurations.
- **Row Level Security (RLS)**: Ensure all Supabase tables have RLS enabled and proper policies in place to restrict data access by user role.
- **Admin Access**: Admin-only operations (like user deletion) are handled via secure Edge Functions with role verification.

---
*Maintained by the GRH Security Team.*
