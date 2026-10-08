# Nexora — Autonomous Placement Copilot for Students

> Built for **LLOYD Hackathon — Problem Statement 4: Open Innovation (Student Pain Points)**

---

## 1. What It Does

**Nexora** is an intelligent, privacy-first campus placement copilot designed specifically for undergraduate and engineering students navigating on-campus placement seasons. 

Instead of juggling fragmented Telegram channels, confusing Training & Placement Office (TPO) PDFs, and ambiguous cutoffs, Nexora provides students with an end-to-end placement control center:
1. **Instant Cutoff & Eligibility Verification**: Evaluates academic requirements (CGPA, branch, backlogs) transparently against campus hiring drives before applying.
2. **Company & Role-Specific Intelligence**: Delivers deep-dive insights per company and specific role (e.g. *Microsoft Frontend Engineer* vs. *Microsoft Backend Engineer*).
3. **"Why This Company?" AI Readiness Diagnosis**: Pinpoints a student's exact skill strengths, weaknesses, and biggest technical gaps for target openings.
4. **Targeted MCQ & Technical Drills**: 4-option practice and PYQ questions tailored to specific roles with timer, accuracy scoring, and mistake reviews.
5. **Direct Application & Pipeline Tracker**: Tracks status across *Applied*, *In Progress*, *Interview*, *Selected*, and *Rejected* with automated stage transitions.
6. **Rejection Autopsy & Continuous Improvement**: Translates online assessment failures into concrete recovery directives.

---

## 2. Problem Statement 4: Open Innovation (Student Pain Points)

College students face severe cognitive overload, anxiety, and operational friction during placement drives:
- **TPO Circular Chaos**: Crucial eligibility criteria, CTC breakdowns, and registration deadlines are buried in poorly formatted circulars or WhatsApp chains.
- **Accidental Disqualifications**: Students spend hours preparing only to find out they were ineligible due to strict active backlog or branch cutoff rules.
- **Generic Prep Without Role Alignment**: Students prepare general DSA for hours without knowing that the company's first round is a machine coding UI drill or SQL window functions challenge.
- **Opaque Rejections**: When students fail an Online Assessment (OA), they rarely understand why or how to prevent repeating the mistake in the next drive.

---

## 3. The Student Pain Point & Evidence

### The Core Frustrations
- **High Operational Friction**: 5–8 company drives announced weekly with conflicting timelines, Google Forms, and career portal links.
- **Fragmented Preparation**: Lack of role-specific MCQ preparation matching actual company interview rounds.
- **Post-Rejection Fatigue**: No systematic way to record takeaways from past online assessments.

### Evidence / Student Research
> *Evidence to be added from institutional campus surveys and TPO interviews.*

---

## 4. How Nexora Solves It

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Search Company │ ──> │ Select Job Role  │ ──> │ Check Eligibility│
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ MCQ & Prep Grill│ <── │ Today's Placement│ <── │ Why This Company │
└─────────────────┘     └──────────────────┘     └──────────────────┘
        │
        ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Direct Apply Now│ ──> │ Interview Track  │ ──> │ Rejection Autopsy│
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

Nexora unifies the entire lifecycle into a single reactive interface:
- **Zero Ambiguity Eligibility**: Compares student profile (`CGPA`, `Active Backlogs`, `Branch`) against company criteria with zero false-negative errors.
- **Company + Role Decoupling**: Lets students choose a company (e.g. *Razorpay*, *Microsoft*, *Google*) and explore multiple roles with distinct skill graphs.
- **Actionable Daily Milestones**: "Today's Placement" gives students 3 focused daily tasks (e.g. *Complete 10 DSA MCQs*, *Fix DBMS weakness*, *Apply to 2 eligible drives*).

---

## 5. What Makes Nexora Different

| Feature | Conventional Portals / Sheets | Nexora Placement Copilot |
| :--- | :--- | :--- |
| **Eligibility Verification** | Manual comparison by student | Automated, instant, mathematical verification with zero false negatives |
| **Role Alignment** | Generic company tag | Independent role selection (*Frontend*, *Backend*, *Data*, *DevOps*, *Product*) |
| **Preparation Mode** | Generic problem lists | Role-targeted 4-option MCQs with explanations & mistake logs |
| **Rejection Feedback** | "Not shortlisted" email | Systematic Rejection Autopsy with root cause breakdown |
| **Daily Routine** | Overwhelming bookmarks | Curated "Today's Placement" 3-action daily roadmap |
| **Privacy & Security** | Data scraped to cloud | Client-side persistent storage; no third-party data tracking |

---

## 6. Core Features

1. **Onboarding & Personalized Profile**:
   - Captures Name, College, Degree, Branch, CGPA, Active Backlogs, Skills, and Target Role.
   - Saves locally to personalize all cutoffs and match scores.

2. **Company Search & Role Switcher**:
   - Search across Tier-1 Day 0 / Day 1 companies (*Microsoft*, *Razorpay*, *Google*, *Amazon*, *Atlassian*, *PhonePe*, *Morgan Stanley*).
   - Switch between active roles (*Frontend*, *Backend*, *Full Stack*, *Data Analyst*, *Data Scientist*, *DevOps*, *SRE*).

3. **"Why This Company?" AI Placement Diagnosis**:
   - Computes Company Readiness Score (e.g. `88% Ready`).
   - Diagnostic checklist for DSA, Aptitude, DBMS, OOP, and Web Standards.
   - One-click `Fix This Gap →` action button.

4. **MCQ Practice Engine & Exam Results**:
   - 14+ CS topics (DSA, DBMS, OS, Computer Networks, OOP, SQL, JavaScript, Python, System Design, etc.).
   - Practice vs. verified PYQ mode across Easy, Medium, and Hard difficulties.
   - Post-quiz diagnostic: Score, Accuracy %, time elapsed, incorrect questions list, and weak topic identification.

5. **Direct "APPLY NOW" Application Pipeline**:
   - Opens official company portals in a new tab without mock URLs.
   - Automatically synchronizes applications across *Applied*, *Interview*, *Selected*, and *Rejected* pipelines.

6. **Resume Grill & Rejection Autopsy**:
   - Evaluates resume bullet points for quantitative impact and concurrency depth.
   - Analyzes past round failures (e.g. *Quant speed bottleneck*, *React fiber reconciliation hesitation*) to prevent recurring mistakes.

---

## 7. Architecture & Technology Stack

- **Framework**: React 18 + Vite + TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Lavender / Purple / Dark Luxe palette with GPU-accelerated transforms)
- **State Management & Persistence**: React Hooks + Browser `localStorage` for responsive zero-latency state synchronization
- **Icons**: Lucide React
- **Build Tool**: Vite 8 / Rolldown compiler

### Why This Stack?
- **Speed & Zero Latency**: Instantaneous tab transitions and instant client-side cutoff computation without network round-trips.
- **Privacy First**: Student resumes, academic credentials, and application states remain completely local to the student's browser.

---

## 8. What We Added

- [x] Full Company $\rightarrow$ Role selection system with independent role requirements.
- [x] Dynamic "Why This Company?" diagnosis and readiness percentage.
- [x] "Today's Placement" 3-action daily roadmap with streak counter and reset triggers.
- [x] Centralized mathematical eligibility evaluator eliminating false rejections.
- [x] Comprehensive 14-topic MCQ practice module with full results analytics.
- [x] Direct "Apply Now" official redirect and application pipeline tracking.
- [x] Rejection Autopsy analysis and interview stage tracker.

---

## 9. Done / Left / Plan

### Completed (Done)
- Robust end-to-end user journey: Search Company $\rightarrow$ Select Role $\rightarrow$ Check Eligibility $\rightarrow$ Read Diagnosis $\rightarrow$ Practice MCQs $\rightarrow$ Apply $\rightarrow$ Track Pipeline.
- Zero TypeScript errors and production build verification.
- Mobile, tablet, and desktop responsive UI.

### In Progress / Next Iteration (Left & Plan)
- Integration with institutional campus TPO single sign-on (SSO).
- Live email/calendar notification sync for interview dates.
- Peer benchmark analytics across college batches.

---

## 10. How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/jethalalmehta/team-39-ideathon-2.0.git
   cd team-39-ideathon-2.0
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 11. Tools and AI Used

- **Development Assistant**: Google DeepMind Antigravity AI agent.
- **Frontend Core**: React 18, TypeScript, Vite.
- **UI & Icons**: Tailwind CSS, Lucide React.
- **Testing & Verification**: Automated component state verification and TypeScript compiler validation.

---

## 12. Who It Is For

- **Final & Pre-Final Year College Students** actively preparing for on-campus placements and off-campus internships.
- **Training & Placement Cells (TPO)** looking to reduce student inquiries regarding eligibility criteria and cutoff mismatches.
- **Engineering Departments** seeking structured placement roadmaps and technical diagnostic frameworks.

---

## 13. Live Demo URL

- **Local Development URL**: `http://localhost:3000`
- **GitHub Repository**: `https://github.com/jethalalmehta/team-39-ideathon-2.0`
