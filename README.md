# University Management System

A full-stack university operations platform built with **Next.js 16**, **ASP.NET Core**, **Entity Framework Core**, **SQL Server**, and **SignalR**. It showcases **RBAC** across frontend route protection and JWT-authorized backend endpoints, **real-time chat**, and capacity-aware **course enrollment with waitlist promotion**.

The project brings academic administration, course delivery, assessments, announcements, and role-aware student services into one workspace.

## Features

- **RBAC:** role-based frontend workspaces and route protection for Administrators, Doctors, Teaching Assistants, and Students, with JWT-backed backend endpoint authorization.
- **Real-time chat:** searchable student-to-doctor conversations with SignalR live updates and unread-message tracking.
- **Enrollment and waitlist promotion:** capacity-aware registration, automatic background promotion, transactional outbox messages, and SignalR enrollment updates.
- Academic year, semester, registration-window, add/drop-window, and course-offering management.
- Course registration with search, semester filtering, enrollment statuses, and pagination.
- Course announcements, comments, questionnaires, quizzes, grading, and student feedback.
- Consistent responsive UI with shared headers, breadcrumbs, table toolbars, filters, pagination, and sticky layouts.
- OpenAPI and interactive Swagger documentation for protected API endpoints.

## Product tour

The screenshots use seeded local demo data and reflect the current role-aware interface. Each non-home frontend view is included below.

### Shared views

| View | Screenshot |
| --- | --- |
| Sign in | ![Sign in](./screenshots/frontend/login.png) |

### Administrator views

| View | Screenshot |
| --- | --- |
| User management | ![Administrator user management](./screenshots/frontend/admin-user-management.png) |
| Staff profile | ![Administrator staff profile](./screenshots/frontend/admin-staff-profile.png) |
| Course applications | ![Administrator course applications](./screenshots/frontend/admin-course-applications.png) |
| Course management | ![Administrator course management](./screenshots/frontend/admin-course-management.png) |
| Academic calendar | ![Administrator academic calendar](./screenshots/frontend/admin-academic-calendar.png) |

### Doctor views

| View | Screenshot |
| --- | --- |
| Assigned courses | ![Doctor assigned courses](./screenshots/frontend/doctor-assigned-courses.png) |
| Course workspace | ![Doctor course workspace](./screenshots/frontend/doctor-course-workspace.png) |
| Chats | ![Doctor chats](./screenshots/frontend/doctor-chats.png) |

### Teaching Assistant views

| View | Screenshot |
| --- | --- |
| Assigned courses | ![Teaching Assistant assigned courses](./screenshots/frontend/ta-assigned-courses.png) |
| Course workspace | ![Teaching Assistant course workspace](./screenshots/frontend/ta-course-workspace.png) |

### Student views

| View | Screenshot |
| --- | --- |
| Registered courses | ![Student registered courses](./screenshots/frontend/student-registered-courses.png) |
| Quiz calendar | ![Student quiz calendar](./screenshots/frontend/student-quiz-calendar.png) |
| Course detail | ![Student course detail](./screenshots/frontend/student-course-detail.png) |
| Course registration | ![Student course registration](./screenshots/frontend/student-course-registration.png) |
| Chats | ![Student chats](./screenshots/frontend/student-chats.png) |

### API documentation

Swagger exposes the API contract, request/response schemas, controller groups, and JWT-protected endpoint testing. The documentation capture is split into one image per controller for easier review.

| Controller | Screenshot |
| --- | --- |
| AcademicCalendar | ![AcademicCalendar Swagger capture](./screenshots/swagger/academic-calendar.png) |
| Announcements | ![Announcements Swagger capture](./screenshots/swagger/announcements.png) |
| Auth | ![Auth Swagger capture](./screenshots/swagger/auth.png) |
| Chats | ![Chats Swagger capture](./screenshots/swagger/chats.png) |
| CourseContents | ![CourseContents Swagger capture](./screenshots/swagger/course-contents.png) |
| Courses | ![Courses Swagger capture](./screenshots/swagger/courses.png) |
| Enrollments | ![Enrollments Swagger capture](./screenshots/swagger/enrollments.png) |
| Health | ![Health Swagger capture](./screenshots/swagger/health.png) |
| Questionnaires | ![Questionnaires Swagger capture](./screenshots/swagger/questionnaires.png) |
| Quizzes | ![Quizzes Swagger capture](./screenshots/swagger/quizzes.png) |
| Setup | ![Setup Swagger capture](./screenshots/swagger/setup.png) |
| Staff | ![Staff Swagger capture](./screenshots/swagger/staff.png) |
| StaffCourses | ![StaffCourses Swagger capture](./screenshots/swagger/staff-courses.png) |
| Students | ![Students Swagger capture](./screenshots/swagger/students.png) |

## Architecture at a glance

```text
Next.js App Router
  ├─ Server Actions / authenticated BFF operations
  ├─ Role-aware workspaces and shared UI primitives
  └─ SignalR client for live enrollment updates
            │
            ▼
ASP.NET Core Web API
  ├─ JWT authentication and role authorization
  ├─ Academic calendar, courses, staff, enrollment, and assessment APIs
  ├─ EnrollmentHub for realtime events
  └─ Background workers for waitlist promotion and outbox delivery
            │
            ▼
Entity Framework Core → SQL Server
```

## Technology

### Frontend

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Radix/shadcn UI primitives
- Server Actions for authenticated client-to-server operations
- `@microsoft/signalr` for realtime enrollment updates

### Backend

- ASP.NET Core Web API on .NET 8
- Entity Framework Core with SQL Server
- JWT authentication and role-based authorization
- Swagger UI and OpenAPI v3
- SignalR enrollment hub
- Hosted workers for waitlist promotion and outbox delivery
- Database migrations and development data seeding

## Project structure

```text
frontend/
  app/                  Next.js routes, pages, actions, and workflows
  components/           Shared layout and UI primitives
  public/               Static frontend assets

UMS.Api/
  Controllers/          HTTP API endpoints
  Hubs/                 SignalR hubs
  Models/               EF Core entities and enums
  Services/             Enrollment, calendar, token, and worker services
  Data/                 DbContext and demo seeding
  Migrations/           EF Core migrations

screenshots/            Portfolio screenshots used in this README
docker-compose.yml      SQL Server, API, and frontend development stack
```

## Run the project locally

### Prerequisites

- Docker Desktop
- Node.js 18 or newer for frontend-only work
- .NET 8 SDK for backend-only work

### Start the full stack

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5219](http://localhost:5219)
- SQL Server: `localhost:14333`

The API applies migrations and seeds demo data on startup. The login screen includes a demo-account selector; seeded development accounts use the password `password`.

### Run the frontend without Docker

```bash
cd frontend
npm install
npm run dev
```

## Realtime enrollment flow

1. A student registers for a full offering and is placed on the waitlist.
2. The enrollment service stores the waitlist position and writes an outbox message in the same transaction.
3. `WaitlistPromotionWorker` checks published offerings during registration and add/drop windows.
4. When capacity opens, the next eligible student is promoted.
5. `EnrollmentOutboxWorker` publishes the event through `EnrollmentHub`.
6. The Next.js client updates the visible status without a full-page reload.

This separates business rules, reliable event delivery, and UI updates while keeping enrollment changes observable to the user.

## API documentation

When the API runs in Development, open [Swagger UI](http://localhost:5219/swagger).

| Area | Base route | Examples |
| --- | --- | --- |
| Authentication | `/api/auth` | Login and user creation |
| Academic calendar | `/api/academic-years`, `/api/semesters`, `/api/offerings` | Years, terms, dates, and offerings |
| Courses and staff | `/api/courses`, `/api/staff`, `/api/staff-courses`, `/api/students` | Profiles and teaching assignments |
| Enrollment | `/api/enrollments` | Register, withdraw, waitlist, and leave waitlist |
| Course delivery | `/api/announcements`, `/api/quizzes`, `/api/questionnaires`, `/api/course-contents` | Learning material and assessments |
| System health | `/api/health` | API availability |

To test protected endpoints in Swagger:

1. Call `POST /api/auth/login` with a seeded development account.
2. Copy the returned access token.
3. Select **Authorize** and enter `Bearer {token}`.

## User roles

| Role | Main capabilities |
| --- | --- |
| **Administrator** | Manage staff, courses, academic years, semesters, offerings, and publication state |
| **Doctor** | Manage assigned courses, announcements, quizzes, questionnaires, and grades |
| **Teaching Assistant** | Support assigned courses, assessments, announcements, and grading workflows |
| **Student** | Browse offerings, register or join waitlists, view courses, complete assessments, and comment on announcements |

## Development checks

```bash
# Frontend lint
cd frontend
npm run lint

# Backend build
dotnet build ../UMS.Api/UMS.Api.csproj --no-restore
```
