# Admin Dashboard CRM Features Plan

## Overview
The admin dashboard will serve as the core CRM for client retention, management, and business operations.

## Core Panels & Features

### 1. User Management Panel
**Purpose**: Central view of all students and their status

**Features**:
- **User List** with search/filter
  - Name, email, plan (free/pro/elite)
  - Registration date, last login
  - Status (active, inactive, trial)
- **Quick Actions** per user:
  - "Upgrade to Pro" button (manual control)
  - Send WhatsApp message
  - View detailed profile
  - Add notes

**Data Points**:
```typescript
interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  plan: 'free' | 'pro' | 'elite';
  registrationDate: string;
  lastLogin: string;
  totalSessions: number;
  status: 'active' | 'inactive' | 'trial';
  notes: AdminNote[];
}
```

### 2. Bookings Management Panel
**Purpose**: Track and manage all lesson bookings

**Features**:
- **Calendar View** of all bookings
- **Upcoming Sessions** list with teacher assignments
- **Booking History** with completion status
- **Cancel/Reschedule** capabilities
- **Revenue Tracking** per booking

**Data Points**:
```typescript
interface AdminBooking {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  revenue: number;
  teacher?: string;
  notes: string;
}
```

### 3. Session Notes Panel
**Purpose**: Track student progress and engagement (retention engine)

**Features**:
- **Per-Student Notes** with timestamps
- **Progress Tracking** (fluency level, topics covered)
- **Next Session Prep** notes
- **Tag System** (grammar, pronunciation, vocabulary, etc.)

**Data Points**:
```typescript
interface AdminNote {
  id: string;
  studentId: string;
  authorId: string;
  content: string;
  tags: string[];
  createdAt: string;
  type: 'progress' | 'prep' | 'general';
}
```

### 4. Revenue & Analytics Panel
**Purpose**: Simple business tracking

**Features**:
- **Monthly Revenue** chart
- **Student Growth** metrics
- **Session Completion** rates
- **Plan Distribution** pie chart
- **Revenue per Student** tracking

**Data Points**:
```typescript
interface RevenueMetrics {
  monthly: number;
  ytd: number;
  avgPerStudent: number;
  growthRate: number;
}
```

## High-Leverage Features (Priority)

### 1. Manual Plan Upgrades
- **Why**: Powerful early-stage control
- **Implementation**: Simple button that updates user plan in Firestore
- **Benefit**: Convert trial users to paid manually

### 2. "Last Seen / Engagement" Tracking
- **Why**: Identify at-risk students
- **Implementation**: Track last login, session frequency
- **Benefit**: Proactive retention efforts

### 3. WhatsApp Quick Actions
- **Why**: Brazil market = WhatsApp dominant
- **Implementation**: Pre-filled messages with user context
- **Benefit**: High conversion communication

### 4. Session Notes System
- **Why**: Personalized service = retention
- **Implementation**: Rich text notes with tags
- **Benefit**: Better student experience and progress tracking

## Technical Implementation Plan

### Phase 1: Core Structure
1. **Admin Layout Component**
2. **User Management** (list + basic actions)
3. **Bookings Overview** (calendar view)
4. **Basic Analytics** (revenue tracking)

### Phase 2: Advanced Features
1. **Session Notes** system
2. **WhatsApp Integration** (pre-filled messages)
3. **Advanced Analytics** (retention metrics)
4. **Export Functionality** (CSV reports)

### Phase 3: Automation
1. **Automated Reminders** (WhatsApp/email)
2. **Engagement Alerts** (inactive students)
3. **Revenue Reports** (monthly summaries)
4. **Teacher Assignment** (if multiple teachers)

## Security Considerations
- **Role-based Access** (admin vs teacher)
- **Audit Trail** for all actions
- **Data Privacy** compliance
- **Session Management** for admin users

## Success Metrics
- **Student Retention Rate** (target: >80%)
- **Session Completion Rate** (target: >90%)
- **Revenue per Student** growth
- **Admin Time Saved** (automation efficiency)

## Next Steps
1. Implement basic admin layout
2. Create user management with search/filter
3. Add booking management calendar
4. Implement manual plan upgrade feature
5. Add session notes system
6. Integrate WhatsApp quick actions
