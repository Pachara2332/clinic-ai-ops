# Clinic AI Ops - Data Pool & Smart Staffing System

> 🚀 ระบบ AI-Powered Staff Allocation, Task Automation, และ KPI Tracking สำหรับคลินิก

## 📌 ภาพรวมโปรเจกต์

**Clinic AI Ops** เป็นโปรเจกต์ SaaS ขนาดใหญ่ที่จะช่วยคลินิกเวชสำอางค์จัดการและปรับปรุงประสิทธิภาพการทำงาน ด้วยการรวมข้อมูลจากทุกระบบของคลินิก แล้วใช้ AI มาวิเคราะห์และออกคำแนะนำในการจัดสรรกำลังคน การทำงานแบบอัตโนมัติ และการตรวจสอบ KPI ของพนักงาน

### วัตถุประสงค์หลัก
- ✅ **รวมข้อมูลจากหลายระบบ** → ทำให้ข้อมูลเป็นศูนย์กลาง (Data Pool) ที่ปลอดภัยและเป็นระเบียบ
- ✅ **ใช้ AI ช่วยวางแผน** → ทำนายภาระงาน และแนะนำการจัดตารางพนักงานที่เหมาะสม
- ✅ **ส่งงานและติดตามอัตโนมัติ** → ให้พนักงานได้รับงานโดยตรง และระบบจับเวลา KPI เองได้
- ✅ **ทำ Dashboard สำหรับผู้บริหาร** → ดูผลการดำเนินงาน KPI และต้นทุนได้อย่างชัดเจน

---

## 🎯 โครงสร้างโปรเจกต์ - 3 เฟสหลัก

### **เฟส 1️⃣ : Data Integration & Centralization**
**รวมข้อมูลจากทุกระบบมารวมกัน**

**เป้าหมาย:**
- ดึงข้อมูลจากระบบเดิมของคลินิก (API Integration)
- ออกแบบฐานข้อมูลกลาง (Data Pool) ที่ปลอดภัยและรองรับ PDPA
- สร้างระบบ Sync ข้อมูลแบบเรียลไทม์หรือรายวัน

**ข้อมูลที่จะรวบรวม:**
- 👥 ข้อมูลพนักงาน (หมอ, พยาบาล, receptionist, manager)
- 🏥 ข้อมูลคนไข้ (ปลอดภัย, ได้รับการเข้ารหัส)
- 💼 ตารางนัดหมาย (appointments)
- 💰 ยอดขาย (sales transactions)
- ⏱️ เวลาเข้า-ออกงานของพนักงาน

**ความท้าทาย:**
- การเชื่อมต่อ API ระบบเดิม (หลากหลายรูปแบบ)
- ความปลอดภัยข้อมูล PDPA
- การแก้ไขความผิดพลาดในการ Sync

---

### **เฟส 2️⃣ : AI Brain & Roster Optimization**
**สมอง AI ที่ช่วยวางแผนและจัดสรรทีมงาน**

**เป้าหมาย:**
- ส่งข้อมูลให้ AI (LLMs) วิเคราะห์
- ทำนายความต้องการทีมงานล่วงหน้า
- สร้าง Roster แนะนำให้พนักงานแต่ละคน

**Workflow ของ AI:**
```
ข้อมูลเบื้องต้น → AI Analysis → Roster Recommendation → Daily Task Creation
  ├─ สถิติคนไข้เก่า      ├─ Trend Analysis        ├─ วันไหนต้องทีมมากน้อย   └─ ใบสั่งงานรายบุคคล
  ├─ ยอดขายรายวัน       ├─ Demand Forecasting    └─ ตำแหน่งไหนต้องใครต่อใคร
  └─ Pattern ของคิว       └─ Load Optimization
```

**Output ที่ได้:**
- 📊 Recommendation: "วันจันทร์ของสัปดาห์หน้า ต้อง 3 หมอ 4 พยาบาล 2 receptionist"
- ✅ Daily Task: ใบสั่งงานรายบุคคล เช่น "หมอ A ลงตำแหน่ง Laser" "พยาบาล B ห้องคนไข้"
- 📈 Efficiency Score: "ทำนายจะลดต้นทุนแฝง 15%"

**ความท้าทาย:**
- การเลือก LLM ที่เหมาะสม (GPT, Claude, etc.)
- การเขียน Prompt ให้ AI เข้าใจ Context ของธุรกิจคลินิก
- การให้พนักงานเปลี่ยนตารางได้ แต่ยังรักษา Pattern ที่ดี

---

### **เฟส 3️⃣ : Automation Delivery & KPI Dashboard**
**ส่งงานให้พนักงานอัตโนมัติ และดึงผลการทำงานกลับมา**

**เป้าหมาย:**
- ส่งใบสั่งงานให้พนักงานทุกเช้า (LINE/App)
- เก็บ Timestamp การทำงาน (เริ่ม-จบ)
- คำนวณ KPI อัตโนมัติ
- ทำ Dashboard ให้ผู้บริหาร

**Delivery Channel:**
- 📱 **LINE Messaging** → ส่งงานและเก็บ Proof
- 🔔 **In-app Notification** → Push notification ผ่านแอป
- ⏰ **Automated Schedule** → ส่งตรง 6:00 AM ทุกเช้า

**KPI ที่ติดตาม:**
```
┌─ Task Completion Rate     → % งานที่เสร็จต่อทั้งหมด
├─ Efficiency Score         → เวลาเฉลี่ยต่องาน
├─ Revenue per Staff        → ยอดขายต่อคนทำงาน
├─ Patient Satisfaction     → คะแนนความพึงพอใจคนไข้
└─ Cost Optimization        → ประหยัดต้นทุนเทียบกับเป้า
```

**Dashboard Features:**
- 📊 Overview ยอดรวม (ยอดขาย, คนไข้, KPI, พนักงานทำงาน)
- 📈 Chart แบบเรียลไทม์ (Revenue, Task Completion, Staff Load)
- 👨‍💼 Staff Performance (ใครทำได้ดีสุด, ใครต้องช่วย)
- 🏢 Branch Comparison (สาขาไหนดีสุด)
- 📋 Task Board (งานที่ต้องทำ, กำลังทำ, เสร็จแล้ว)

**ความท้าทาย:**
- การจับเวลาที่แม่นยำ
- การโต้ตอบกับ LINE API
- การคำนวณ KPI ที่ยุติธรรมสำหรับทุกบทบาท

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLINIC AI OPS SYSTEM                    │
└─────────────────────────────────────────────────────────────┘

┌─ Frontend Layer (React + Vite + Tailwind)
│  ├─ Dashboard (KPI Display)
│  ├─ Staff Allocation UI
│  ├─ Task Management Board
│  ├─ Appointments Table
│  └─ AI Summary Widget
│
├─ API Layer (Backend - TBD)
│  ├─ /api/dashboard → ดึง Dashboard data
│  ├─ /api/tasks → จัดการงาน
│  ├─ /api/auth → Login/Auth
│  ├─ /api/roster → Roster recommendations
│  └─ /api/kpi → KPI calculations
│
├─ Data Integration Layer
│  ├─ Clinic Legacy Systems (API connectors)
│  ├─ Data Extraction & Validation
│  ├─ Data Transformation Pipeline
│  └─ PDPA Encryption Layer
│
├─ Database Layer (Supabase PostgreSQL)
│  ├─ branches, staff, appointments
│  ├─ sales, tasks, kpi_records
│  ├─ roster_recommendations, ai_summaries
│  └─ audit_logs (PDPA compliance)
│
├─ AI Layer
│  ├─ LLM Integration (GPT/Claude)
│  ├─ Workflow Engine (for Roster Optimization)
│  ├─ Prompt Templates
│  └─ Response Parser
│
└─ Messaging Layer
   ├─ LINE Bot Integration
   ├─ Task Delivery Scheduler
   ├─ Push Notifications
   └─ Timestamp Tracker
```

---

## 🚀 Current State (Phase 1/3)

### ✅ ปัจจุบันเพิ่มเติมแล้ว

**Frontend:**
- ✅ React 19 + Vite + TypeScript Setup
- ✅ Dashboard UI พร้อมใช้งาน (KPI, Staff, Tasks, Appointments)
- ✅ Dark/Light theme support with Tailwind CSS 4
- ✅ Mock Data ทดสอบในตัวของ Frontend
- ✅ API Integration layer พร้อม (fetchDashboard, loginDemo, updateTaskStatus)
- ✅ Responsive Design (Mobile, Tablet, Desktop)

**Data Model:**
- ✅ Type definitions (Branch, Staff, Appointment, Sale, Task, KPI, etc.)
- ✅ Mock data structure สำหรับ 3 สาขา

### ⏳ ต้องเพิ่มเติมต่อ

**Backend:**
- ❌ API Server (Node.js/Python/Go - TBD)
- ❌ Database Schema (Supabase)
- ❌ Authentication/Authorization

**Data Integration (Phase 1):**
- ❌ API Connectors สำหรับระบบคลินิกเดิม
- ❌ Data Pipeline & Sync logic
- ❌ PDPA Encryption implementation

**AI Layer (Phase 2):**
- ❌ LLM Integration
- ❌ Roster Recommendation Engine
- ❌ Workflow orchestration

**Delivery (Phase 3):**
- ❌ LINE Bot
- ❌ Push Notifications
- ❌ KPI Calculation Engine

---

## 📂 Project Structure

```
clinicaiopsfrontend/
├── src/
│   ├── api/
│   │   └── dashboardApi.ts          # API calls (fetchDashboard, loginDemo, etc)
│   │
│   ├── components/
│   │   └── common/
│   │       └── Metric.tsx           # Reusable KPI metric card
│   │
│   ├── constants/
│   │   ├── clinicData.ts            # Mock data (branches, staff, tasks, etc)
│   │   └── environment.ts           # API URL & Supabase config
│   │
│   ├── hooks/
│   │   └── useDashboard.ts          # Main state management hook
│   │
│   ├── providers/
│   │   └── supabaseClient.ts        # Supabase initialization
│   │
│   ├── screens/
│   │   └── HomeScreen/
│   │       ├── HomeScreen.tsx       # Main dashboard layout
│   │       └── components/
│   │           ├── Header.tsx       # Top bar (Title, Refresh, Notice)
│   │           ├── Sidebar.tsx      # Branch selector, Login
│   │           ├── KpiCharts.tsx    # KPI visualization
│   │           ├── TaskBoard.tsx    # Task management
│   │           ├── StaffAllocation.tsx  # Roster view
│   │           ├── AppointmentsTable.tsx # Appointments list
│   │           └── AiSummary.tsx    # AI generated insights
│   │
│   ├── types/
│   │   └── clinic.ts                # TypeScript types & interfaces
│   │
│   ├── utils/
│   │   ├── formatters.ts            # Formatting helpers
│   │   └── formatters.test.ts       # Unit tests
│   │
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
│
├── public/                          # Static assets
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
├── eslint.config.js                 # ESLint config
└── index.html                       # HTML template
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ (LTS)
- npm หรือ yarn
- Git

### Installation Steps

1. **Clone Repository & Install Dependencies**
```bash
cd clinicaiopsfrontend
npm install
```

2. **Setup Environment Variables**
```bash
# สร้างไฟล์ .env.local
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
```

3. **Run Development Server**
```bash
npm run dev
```
Dashboard จะเปิดที่ `http://localhost:5173`

4. **Build for Production**
```bash
npm run build
npm run preview
```

### Demo Login
```
Email: admin@clinic.ai
Password: clinic1234
```

---

## 📊 Key Features

### 1. **Dashboard Overview**
- ยอดขายวันนี้ (Revenue)
- จำนวนคนไข้ (Patient Count)
- ตารางนัดหมาย (Appointments)
- พนักงานที่ทำงาน (Active Staff)

### 2. **KPI Charts**
- Revenue chart (Daily/Weekly/Monthly)
- Task completion rate
- Staff efficiency metrics
- Cost optimization overview

### 3. **Task Management**
- Todo → In Progress → Completed workflow
- Start/Stop timer ติดตามเวลา
- Auto-update KPI when task completes

### 4. **Staff Allocation**
- ดูตารางการเลงของแต่ละคน
- Load distribution visualization
- AI recommendations

### 5. **Appointments Table**
- ตารางนัดหมายรายวัน
- Status tracking (confirmed, waiting, done)
- Sort/filter by service

### 6. **AI Summary Widget**
- Auto-generated insights from AI
- Branch-level recommendations
- Performance analysis

---

## 🔧 Technology Stack

### Frontend
| Layer | Technologies |
|-------|----------------|
| **UI Framework** | React 19, TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4, CVA |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Testing** | Vitest 4 |
| **Linting** | ESLint 10 |

### Backend (To Be Implemented)
- **API**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL (via Supabase)
- **Auth**: JWT or Supabase Auth
- **Message Queue**: Redis (for async tasks)
- **AI**: OpenAI GPT / Anthropic Claude

### Infrastructure
- **Deployment**: Vercel / Netlify (Frontend)
- **Database**: Supabase
- **Message**: LINE Bot API
- **Storage**: Supabase Storage (PDPA encrypted)

---

## 📋 Development Workflow

### Available Commands
```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production
npm run lint       # Run ESLint
npm run test       # Run tests
npm run preview    # Preview production build
```

### Project Convention
- **Components**: PascalCase (e.g., `HomeScreen.tsx`)
- **Utilities**: camelCase (e.g., `formatters.ts`)
- **Types**: PascalCase interfaces (e.g., `Branch`, `Staff`)
- **Styling**: Tailwind utility classes only (no CSS modules)

---

## 🎓 Learning Path

### To Understand the Project:
1. **Start with types** → [src/types/clinic.ts](src/types/clinic.ts) - data model
2. **Check mock data** → [src/constants/clinicData.ts](src/constants/clinicData.ts) - sample structure
3. **Main hook** → [src/hooks/useDashboard.ts](src/hooks/useDashboard.ts) - state management
4. **Main screen** → [src/screens/HomeScreen/HomeScreen.tsx](src/screens/HomeScreen/HomeScreen.tsx) - layout

### To Start Development:
1. **Understand the phase** you're working on (1, 2, or 3)
2. **Check the Spec** in this README
3. **Look at existing API calls** in [src/api/dashboardApi.ts](src/api/dashboardApi.ts)
4. **Create features incrementally** with tests

---

## 🚦 Roadmap

### Phase 1: Data Integration & Centralization ⏳
- [ ] Backend API Setup (Express/FastAPI)
- [ ] Database Schema Design (Supabase)
- [ ] API Connectors for legacy clinic systems
- [ ] Data validation & transformation
- [ ] PDPA Encryption layer
- [ ] Real-time data sync pipeline

**Timeline**: ~3-4 months

### Phase 2: AI Brain & Roster Optimization ⏳
- [ ] LLM Integration (OpenAI/Claude)
- [ ] Roster recommendation engine
- [ ] Demand forecasting model
- [ ] Workflow orchestration
- [ ] A/B testing framework for recommendations

**Timeline**: ~2-3 months

### Phase 3: Automation Delivery & KPI Dashboard ⏳
- [ ] LINE Bot integration
- [ ] Push notification system
- [ ] KPI calculation engine
- [ ] Enhanced dashboard with real-time updates
- [ ] Export/Report generation

**Timeline**: ~2 months

**Total**: ~7-9 months to MVP

---

## 🔐 Security & PDPA Compliance

⚠️ **Important**: Patient data must be encrypted and handled securely

- ✅ All patient data must be end-to-end encrypted
- ✅ Implement audit logs for data access
- ✅ Use HTTPS/TLS for all communications
- ✅ Regular security audits
- ✅ Data retention policy (keep only needed data)
- ✅ User roles & permissions (Doctor, Admin, Manager)

---

## 📞 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API connection errors
- Check `.env.local` is set up correctly
- Verify backend is running on `http://localhost:4000`
- Check browser console for detailed errors

### Demo data not showing
- Ensure `useDashboard.ts` hook is initialized
- Check `clinicData.ts` mock data is populated

---

## 📚 References

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

---

## 📝 License

Private Project - Not for public distribution

---

## 👥 Team

- **Project Lead**: 
- **Frontend**: Your name here
- **Backend**: TBD
- **AI/Data**: TBD

---

**Last Updated**: June 2026
**Status**: 🟡 Phase 1 - Frontend Ready (Waiting for Backend)
