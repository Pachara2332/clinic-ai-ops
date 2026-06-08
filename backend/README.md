# ClinicAIops Backend
## ระบบจัดสรรกำลังคนและวิเคราะห์ KPI สำหรับคลินิก

**ClinicAIops** เป็นระบบ Data Pool ที่รวมข้อมูลจากหลายสาขาของคลินิก เพื่อให้ AI ช่วยวิเคราะห์ข้อมูล จัดสรรกำลังคน (Staff Allocation) และสร้างใบสั่งงานอัตโนมัติสำหรับพนักงาน พร้อมทำให้ผู้บริหารติดตามผลงานและ KPI ได้อย่างเรียลไทม์

---

## 📋 ภาพรวมโปรเจกต์

### เป้าหมายหลัก

ระบบนี้ออกแบบมาให้เป็น **SaaS (Software as a Service)** ที่สามารถจำหน่ายให้คลินิกต่างๆ ใช้งานได้ โดยมี 3 เฟสหลักดังนี้:

```
│ Phase 1 │  →  │ Phase 2 │  →  │ Phase 3 │
│  Data   │     │   AI    │     │ Delivery│
│ Pool &  │     │ Brain & │     │  & KPI  │
│ Sync    │     │ Roster  │     │Dashboard│
```

---

## 🎯 3 เฟสหลัก (Technical Scope)

### **Phase 1: Data Integration & Centralization (รวมฐานข้อมูล)**

**เป้าหมาย**: ดึงข้อมูลจากระบบเดิมของคลินิกหลายๆ สาขา มารวมอยู่ที่ "อ่างเก็บข้อมูล (Data Pool)" ของระบบอย่างถูกต้องและปลอดภัย

**เนื้องาน**:
- ✅ ศึกษา API หรือวิธีดึงข้อมูล (Data Extraction) จากระบบเดิมของคลินิก
  - ข้อมูลการเข้า-ออกงานของพนักงาน
  - ยอดขายและรายรับรายวัน
  - ตารางนัดหมายคนไข้
  - ข้อมูลผู้ป่วย (PII/PDPA Sensitive)
  
- ✅ ออกแบบระบบฐานข้อมูล (Database Design) ที่ปลอดภัย
  - ใช้ PostgreSQL + Prisma ORM
  - รองรับการเข้ารหัส (Encryption) ข้อมูลคนไข้ตามกฎ PDPA
  - Organize data by branch + role-based access
  
- 🔄 ทำระบบ Sync ข้อมูลแบบเรียลไทม์ หรืออัปเดตประจำวัน (Data Pipeline)
  - ETL process สำหรับดึงข้อมูลจากระบบเดิม
  - Queue system สำหรับ process ข้อมูลขนาดใหญ่
  - Error handling และ data validation

**ผลลัพธ์**: ฐานข้อมูลกลางที่เชื่อมต่อหลายสาขา พร้อมข้อมูล appointment, sales, staff scheduling

---

### **Phase 2: AI Brain & Roster Optimization (สมอง AI จัดสรรคน)**

**เป้าหมาย**: ให้ AI วิเคราะห์ข้อมูลและแนะนำ "วันไหนควรเอาใครไปลงตำแหน่งไหน" เพื่อลดต้นทุนแฝงและเพิ่มประสิทธิภาพ

**เนื้องาน**:
- 🔄 เขียน Workflow สำหรับส่งข้อมูลดิบให้ AI (LLMs) วิเคราะห์
  - เตรียมข้อมูล historical (สถิติลูกค้าปีก่อนๆ, ยอดขายรายวัน)
  - ส่งไปยัง LLM APIs (OpenAI, Claude, Gemini) เพื่อวิเคราะห์เทรนด์
  - พยากรณ์ภาระงานล่วงหน้า (Forecasting)

- 🧠 พัฒนาเงื่อนไข Logic ให้ AI ช่วยคำนวณการจัดตารางทำงาน
  - ใช้ข้อมูล historical + forecasting
  - คำนวณจำนวนหมอ พยาบาล ผู้รับ/ชำระเงิน ที่เหมาะสม
  - ให้พอดีกับจำนวนคนไข้ในแต่ละช่วงเวลา (Peak hours vs Off hours)

- 📋 สร้างระบบแปลงคำสั่ง AI เป็น Daily Task
  - Convert recommendations เป็น Actionable tasks
  - Assign tasks ให้พนักงานแต่ละคน (by skill, availability)
  - Generate Daily Task sheet รายวัน

**ผลลัพธ์**: AI recommendations สำหรับ roster ที่เหมาะสมกับปริมาณงาน + Daily task list อัตโนมัติ

---

### **Phase 3: Automation Delivery & KPI Dashboard (ส่งงานและจับตา)**

**เป้าหมาย**: ส่งงานให้พนักงานโดยตรง จับเวลาการทำงาน คำนวณ KPI อัตโนมัติ และสร้าง Dashboard สำหรับผู้บริหาร

**เนื้องาน**:
- 📲 ทำระบบเชื่อมต่อกับ Application clinic เพื่อส่งงาน
  - Integration กับ LINE API หรือ Mobile App
  - ส่ง daily tasks ไปหาพนักงานในตอนเช้า
  - พนักงานกด "ส่งงาน" ผ่าน LINE หรือ app
  - Real-time notification system

- ⏱️ ทำระบบหลังบ้านคอยจับเวลา (Timestamp) + ประมวลผลประสิทธิภาพ
  - Record start time และ end time ของแต่ละ task
  - Capture task completion status
  - Calculate speed metrics (avg time per patient, throughput)

- 📊 คำนวณ KPI อัตโนมัติ
  - Task completion rate (ทำเสร็จหรือไม่)
  - Speed score (ทำเร็วหรือช้า)
  - Quality score (จำนวนคนไข้ / workload)
  - Revenue contribution (ยอดขายจากการทำงานของพนักงาน)

- 📈 สร้าง Dashboard สำหรับผู้บริหาร
  - Overview page: วันนี้สาขาไหนทำ KPI ได้ดีที่สุด
  - Staff ranking: พนักงานคนไหนผลงานเด่น
  - Revenue analytics: ต้นทุนตรงไหนลดลงไปเท่าไหร่
  - Trend charts: ติดตาม KPI ประจำวัน/สัปดาห์/เดือน

**ผลลัพธ์**: Fully automated task delivery system + Real-time KPI tracking + Executive dashboard

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Dashboard)                        │
│  - React / Vue.js                                               │
│  - Real-time KPI display                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│               ClinicAIops Backend API (Express.js)              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  Auth Module    │  │  Dashboard   │  │   Task Module   │    │
│  │ - JWT Login     │  │  Module      │  │ - Task CRUD     │    │
│  │ - User Session  │  │ - KPI Stats  │  │ - Assignment    │    │
│  └─────────────────┘  └──────────────┘  └─────────────────┘    │
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐     │
│  │    AI Module             │  │   Data Integration       │     │
│  │ - Roster Recommendation  │  │ - ETL Pipelines          │     │
│  │ - AI Summaries           │  │ - Data Validation        │     │
│  │ - LLM Integration        │  │ - PDPA Compliance        │     │
│  └──────────────────────────┘  └──────────────────────────┘     │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│               PostgreSQL Database (Prisma ORM)                  │
├──────────────────────────────────────────────────────────────────┤
│  - Branch             - Staff              - PatientAppointment │
│  - Sale               - Task               - KPIRecord          │
│  - RosterRecommendation    - AISummary                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (Prisma Models)

### Key Models:

```prisma
model Branch {
  id, name, city, targetRevenue
  ↓ relations
  staff[], appointments[], sales[], tasks[], kpiRecords[]
}

model Staff {
  id, branchId, name, role (doctor|nurse|reception|manager)
  isWorking, taskLoad
  ↓ relations
  tasks[], kpiRecords[]
}

model PatientAppointment {
  id, branchId, patientName, service
  startsAt, status (confirmed|waiting|done)
}

model Sale {
  id, branchId, amount, service, soldAt
}

model Task {
  id, branchId, staffId, title, queueCount
  status (todo|in-progress|completed)
  startedAt, completedAt
  ↓ relations
  kpiRecords[]
}

model KPIRecord {
  id, branchId, staffId, taskId
  durationMinutes, score, recordedAt
}

model RosterRecommendation {
  branchId, dayName
  doctors, nurses, reception (recommended count)
  reason (why this allocation)
}

model AISummary {
  branchId, summary, generatedAt
}
```

---

## 🚀 API Endpoints

### **Authentication**
```
POST /api/auth/login
└─ Body: { email, password }
└─ Returns: { token, user }
```

### **Dashboard**
```
GET /api/dashboard
└─ Returns: Complete dashboard payload
   ├─ branches[]
   ├─ staff[]
   ├─ appointments[]
   ├─ sales[]
   ├─ tasks[]
   ├─ kpiRecords[]
   ├─ recommendations[] (roster)
   ├─ aiSummaries[]
   └─ branchKpis[]
```

### **Tasks Management**
```
GET /api/tasks                    ← Get all tasks
POST /api/tasks/:taskId/start     ← Start a task (set startedAt)
POST /api/tasks/:taskId/complete  ← Complete a task (set completedAt + score)
```

### **AI Roster**
```
POST /api/ai/roster
└─ Body: { "branchId": "<database-branch-id>", "dayName": "Saturday" }
└─ Returns: { branchId, dayName, doctors, nurses, reception, reason }
```

### **Health Check**
```
GET /api/health
└─ Returns: { status: "ok", service: "clinic-ai-ops-api" }
```

---

## 🛠️ การติดตั้ง & พัฒนา

### ข้อกำหนด
- Node.js v18+
- npm v9+
- PostgreSQL (สำหรับ production)

### ติดตั้ง

```bash
# 1. Clone repository
git clone <repo-url>
cd clinicaiopsbackend

# 2. ติดตั้ง dependencies
npm install

# 3. สร้าง .env file
cp .env.example .env
# แก้ไข DATABASE_URL, JWT_SECRET, etc.

# 4. Setup database
npm run db:push          # Push schema to database
npm run db:generate      # Generate Prisma client
```

### รัน Development Server

```bash
npm run dev
```

Server จะเริ่ม: `http://localhost:4000`

### Build & Production

```bash
# Build check
npm run build

# Start production
npm start

# Run tests
npm test
```

---

## 📁 โครงสร้างไฟล์

```
clinicaiopsbackend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── configs/
│   │   ├── auth.ts              # JWT & auth config
│   │   ├── env.ts               # Environment variables
│   │   └── prisma.ts            # Prisma client config
│   ├── data/
│   │   ├── clinic-data.ts        # Dashboard calculation helpers
│   │   └── clinic-data.test.ts   # Tests for data
│   ├── middlewares/
│   │   └── error.middleware.ts   # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Auth endpoints
│   │   │   ├── auth.route.ts       # Auth routes
│   │   │   └── auth.service.ts     # Auth business logic
│   │   ├── dashboard/
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.route.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── dashboard.repository.ts
│   │   ├── tasks/
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.route.ts
│   │   │   └── tasks.service.ts
│   │   └── ai/
│   │       ├── ai.controller.ts
│   │       ├── ai.route.ts
│   │       └── ai.service.ts
│   ├── types/
│   │   └── clinic.ts             # TypeScript type definitions
│   └── utils/
│       ├── appError.ts           # Custom error class
│       └── asyncHandler.ts       # Async handler wrapper
├── prisma/
│   └── schema.prisma             # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Authentication

Create a user through `POST /api/auth/register` or insert one in the `User` table before logging in. The API no longer ships with demo credentials.

---

## 📌 Current Status & Next Steps

### ✅ Implemented (Phase 1 - MVP)
- [x] Express.js REST API structure
- [x] JWT authentication
- [x] Prisma ORM + PostgreSQL schema
- [x] Dashboard endpoint (database aggregation)
- [x] Task management (CRUD + status tracking)
- [x] AI roster recommendation (rule-based)
- [x] KPI records tracking
- [x] Error handling & validation

### 🔄 In Progress (Phase 2 - AI Integration)
- [ ] Connect to LLM APIs (OpenAI, Claude, Gemini)
- [ ] Advanced forecasting models
- [ ] Workflow for AI analysis
- [ ] Daily task generation from AI recommendations

### ⏳ Coming Soon (Phase 3 - Delivery & KPI)
- [ ] LINE API integration for task delivery
- [ ] Mobile app integration
- [ ] Real-time KPI calculation
- [ ] Executive Dashboard (React/Vue frontend)
- [ ] Notification system
- [ ] Advanced analytics & reporting

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with watch mode
npm test -- --watch
```

---

## 📚 Technology Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js 5.x |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6.x |
| **Language** | TypeScript |
| **Auth** | JWT (jsonwebtoken) |
| **Testing** | Vitest + Supertest |
| **Build** | TypeScript Compiler (tsx) |
| **Security** | bcryptjs, CORS |

---

## 🚨 Important Notes

### PDPA Compliance (ข้อมูลส่วนบุคคล)
- ข้อมูลคนไข้ต้องเก็บ encrypt ในฐานข้อมูล
- ต้องมี access control แบบ role-based
- ต้องมี audit log สำหรับทุก data access
- ต้องสามารถ delete/anonymize ข้อมูลได้

### Security Best Practices
- ใช้ environment variables สำหรับ secrets
- Validate ทุก input data
- ใช้ HTTPS for production
- ทำ rate limiting สำหรับ API endpoints
- Monitor & log ทุก errors

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

---

## 📞 Support

For questions or issues:
- 📧 Contact: [Your Email]
- 📋 Issues: GitHub Issues
- 💬 Team: Slack/Teams channel

---

## 📄 License

ISC

---

**Last Updated**: June 2026
**Version**: 1.0.0 (MVP)
**Status**: Active Development
- `POST /api/ai/summary`

## Database

The Prisma schema contains:

- `User`
- `Branch`
- `Staff`
- `PatientAppointment`
- `Sale`
- `Task`
- `KPIRecord`
- `RosterRecommendation`
- `AISummary`

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` with your Supabase Postgres connection string, then run:

```bash
npm run db:generate
npm run db:push
```

The API reads clinic data from PostgreSQL through Prisma. Empty tables return empty API collections instead of in-memory demo records.

## Multica AI

Multica AI is an open-source managed agents platform from `multica-ai/multica`. For Windows, the upstream install command is:

```powershell
irm https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.ps1 | iex
```

Then:

```bash
multica setup
```

This project is ready to be added as a Multica-managed workspace later, but the MVP runtime does not require the Multica CLI.

## Skills

Installed with:

```bash
npx skills add supabase/agent-skills
```

Installed with:

```bash
npx impeccable skills install
```

The Windows machine did not have `unzip` in `PATH`, so installation used a temporary local shim that called PowerShell `Expand-Archive`; the shim was removed after installation.
