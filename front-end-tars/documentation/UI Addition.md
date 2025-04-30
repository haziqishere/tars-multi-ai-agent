# TARS Multi-Agent System Implementation Guide

## Overview
This document outlines the implementation plan for creating a proper user onboarding flow for the TARS Multi-Agent System for the Microsoft Hackathon. The flow includes a landing page, simple login, and data source selection page before redirecting users to the main system interface.

## Flow Summary
1. Landing Page → 2. Login Page → 3. Data Source Selection → 4. Main System Interface

## Pages Requirements & Specifications

### 1. Landing Page
**Purpose:** Provide a simple introduction to the TARS Multi-Agent System.

**Key Elements:**
- Clean headline introducing TARS
- Simple CTA button: "Get Started"
- Microsoft Hackathon branding reference
- Dark-themed UI consistent with the main application

**Technical Notes:**
- Create as new page component at `/src/app/page.tsx`
- Move current system interface to `/src/app/chat/page.tsx`

### 2. Login Page
**Purpose:** Provide a simplified login experience (no credentials needed).

**Key Elements:**
- "Login via Existing User" prominent heading
- Large "Sign In" button (no credential fields)
- Text noting dummy users: "For demo, you'll be logged in as either 'Head of Operations' or 'CEO' under Contoso example company"
- Microsoft branding elements
- Clean dark-themed design

**Technical Notes:**
- Create as new page component at `/src/app/login/page.tsx`
- Single button login - no credential forms
- Button click navigates directly to data source page
- No actual authentication logic required

### 3. Data Source Selection Page
**Purpose:** Allow users to select Microsoft data sources to connect to.

**Key Elements:**
- Header: "Connect to your company data"
- Two prominent selectable cards:
  1. Microsoft Fabric with SVG logo placeholder
  2. SharePoint with SVG logo placeholder
- Brief description for each option
- Simple instruction text about data access
- Continue button that becomes active after selection
- Consistent dark-themed UI

**Technical Notes:**
- Create as new page component at `/src/app/datasource/page.tsx`
- Include placeholder SVG elements for Microsoft Fabric and SharePoint logos
- Simple selection UI - clicking either card should highlight it
- "Continue" button navigates to main system interface
- No actual connection logic required

### 4. System Interface (Existing)
**Purpose:** The main application interface (already developed)

**Technical Notes:**
- Move existing application from `/src/app/page.tsx` to `/src/app/chat/page.tsx`
- Ensure all imports and routing work correctly after the move
- No functionality changes needed for this page

## Implementation Guidelines

### Navigation & Routing
- Implement proper routing using Next.js App Router
- Create routes:
  - `/` → Landing page
  - `/login` → Login page
  - `/datasource` → Data source selection
  - `/chat` → Main application (renamed from /system)

### Design & UI
- Maintain existing dark theme from the main app
- Use accent-orange and accent-green as highlight colors
- Keep consistent neomorphic design elements
- Simple animations for transitions between pages

### Code Structure
- Create new folder for each page in the app directory
- Reuse existing UI components where possible
- Use layout components for consistency

### Dummy Data Handling
- No actual user data needed - just a simple redirect flow
- Create mock data source information for the data source selection page

## Assets Needed
- Microsoft Fabric logo (placeholder SVG initially)
- SharePoint logo (placeholder SVG initially)
- Microsoft hackathon branding elements

## Logo Placeholders
For initial development, use placeholder SVGs for the data source logos:

### Microsoft Fabric Logo Placeholder
```jsx
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="8" fill="#4B53BC" />
  <path d="M16 20H48V44H16V20Z" fill="#8B91E2" />
  <path d="M22 26H42V38H22V26Z" fill="#E2E4FF" />
  <path d="M22 32L32 26L42 32L32 38L22 32Z" fill="#4B53BC" />
</svg>
```

### SharePoint Logo Placeholder
```jsx
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="8" fill="#0078D4" />
  <rect x="16" y="20" width="32" height="24" fill="#2B88D8" />
  <circle cx="32" cy="32" r="8" fill="#81CAFF" />
  <rect x="26" y="31" width="12" height="2" fill="#0078D4" />
  <rect x="31" y="26" width="2" height="12" fill="#0078D4" />
</svg>
```

## Implementation Timeline
Suggested implementation order:
1. Set up routing structure and move existing app to /chat
2. Create minimal landing page
3. Implement simplified login page (single button)
4. Create data source selection page with placeholder SVGs
5. Connect all pages with proper navigation

## Special Notes
- This is for a Microsoft hackathon demo - focus on flow and visuals
- All functionality is simulated/mocked
- The landing page is a lower priority - more focus will be placed on it in future iterations
- Prioritize creating a cohesive flow that demonstrates the concept clearly
- You can replace the placeholder SVGs with actual Microsoft Fabric and SharePoint logos later