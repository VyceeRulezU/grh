# Governance Resource Hub (GRH) V2

> [!IMPORTANT]
> **Status**: Production Stable. Optimized for high performance with React.lazy code-splitting. High-impact animations via GSAP and premium UI via custom HSL design systems. Integrated with TanStack Query, React-Hook-Form, and Zod.

A premium, unified platform for governance excellence, featuring interactive e-learning, a digital research library, AI-powered insights, and advanced institutional diagnostics.

## 🚀 Key Features

### 🎓 Modern Learning & Student Experience
- **Student Dashboard**: Personalized learning portal for tracking progress, courses, and certifications.
- **E-Learning Platform**: Comprehensive expert-led courses with progress tracking and achievement badges.
- **Professional Course Player**: Immersive learning interface with lesson navigation.
- **Achievement System**: Real-time badge awarding and institutional certifications.

### 🏢 Digital Institutional Intelligence
- **Institutional Readiness Index (IRI)**: Data-driven diagnostics for governance health.
- **WGI Trends**: Deep-dive analytics into Worldwide Governance Indicators.
- **Admin Shield Portal**: Global analytics for institutional monitoring.

### 📚 Digital E-Library
- **Resource Hub**: Professional PDF viewer for books, reports, and white papers powered by `@react-pdf-viewer`.
- **Filtered Research**: Advanced topic and category-based resource discovery.

### 🤖 AI Research Assistant
- **Explore Module**: AI-powered chat assistant (Gemini) trained on governance resources for instant insights and summaries.

## 🛠️ Technology Stack
- **Frontend**: React 18 (Vite)
- **State Management**: TanStack Query (React Query)
- **Animations**: GSAP (GreenSock) for high-impact UI & Framer Motion
- **Styling**: Vanilla CSS (Apple-style aesthetic with Glassmorphism)
- **PDF Core**: `@react-pdf-viewer/core`
- **Charts**: Recharts
- **Icons**: Remix Icons
- **Imagery**: Pixabay API (Dynamic Localized Visuals)
- **Auth & DB**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Validation**: React-Hook-Form + Zod
- **Error Handling**: react-error-boundary

## 🏃 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/VyceeRulezU/grh.git
   ```
2. Navigate to the project directory:
   ```bash
   cd grh
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and fill in your environment variables.

### Development
Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Production Build
Build for production:
```bash
npm run build
```

### Deployment
This project is deployed on **Vercel**. Production URL: [https://governanceresourcehub.com](https://governanceresourcehub.com)

## 📜 License
This project is proprietary software. All rights reserved by Governance Resource Hub. See the [LICENSE](LICENSE) file for specific terms and conditions.

---
*Empowering Governance Excellence through Evidence-Based Insights.*
