# Frontend Specification

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   ├── contracts/       # Contract-related components
│   │   ├── analysis/        # Analysis display components
│   │   ├── comparison/      # Comparison components
│   │   └── billing/         # Billing/subscription components
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Contracts.tsx
│   │   ├── ContractDetail.tsx
│   │   ├── Comparison.tsx
│   │   ├── Settings.tsx
│   │   └── Billing.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useContracts.ts      # TanStack Query hooks for contracts
│   │   ├── useAnalysis.ts        # TanStack Query hooks for analyses
│   │   ├── useComparison.ts      # TanStack Query hooks for comparisons
│   │   └── useUpload.ts
│   ├── lib/
│   │   ├── queryClient.ts        # TanStack Query client setup
│   │   ├── api.ts                 # API client (used with TanStack Query)
│   │   ├── auth.ts                # Better-Auth client
│   │   ├── utils.ts               # Utility functions
│   │   └── constants.ts           # Constants
│   ├── types/
│   │   ├── contract.ts
│   │   ├── analysis.ts
│   │   └── user.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css            # Tailwind imports
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Pages & Routes

### Authentication Pages

#### `/signup`
- Sign up form (email, password, name)
- Link to sign in
- Better-Auth integration

#### `/signin`
- Sign in form (email, password)
- Link to sign up
- "Forgot password" link (future)

#### `/signout`
- Sign out handler (redirects to signin)

### Main Application Pages

#### `/` (Dashboard)
- Overview of user's contracts
- Recent analyses
- Quick stats (total contracts, comparisons, etc.)
- Upload contract CTA
- Recent activity feed

#### `/contracts`
- List of all contracts
- Filter by year, status, type
- Search functionality
- Upload new contract button
- **Checkbox selection** for each contract
- **"Get Report" button** (disabled if no contracts selected)
- Shows selected count
- Status indicators (uploaded, processing, analyzed, failed)
- Table/card view toggle

#### `/contracts/:id`
- Contract details
- File download button
- Analysis results display
- Request human review CTA (upsell)
- Delete contract button

#### `/contracts/:id/analysis`
- Full analysis view
- Key terms highlighted
- Coverage details breakdown
- Exclusions list
- Premium information
- Request human review button

#### `/comparisons`
- List of all comparisons
- Filter by year
- Side-by-side comparison view

#### `/comparisons/:id`
- Detailed comparison view
- Before/after comparison
- Changes highlighted
- Visual diff of key terms
- Request human review for comparison

#### `/upload`
- File upload component
- Drag & drop support
- Progress indicator
- **Coverage year input (REQUIRED)** - Must specify which coverage year this PDF is for
- Contract type input (optional)
- Upload button
- Note: Contracts are uploaded but NOT automatically analyzed

#### `/settings`
- User profile settings
- Email preferences
- Account management
- Delete account (future)

#### `/billing`
- Current subscription status
- Upgrade/downgrade options
- Payment history
- Stripe checkout integration
- Cancel subscription

## Components

### Layout Components

#### `AppLayout`
- Main application layout
- Header with navigation
- Sidebar (optional)
- Footer
- User menu dropdown

#### `Header`
- Logo/brand
- Navigation links
- User menu (profile, settings, sign out)
- Notifications icon (future)

#### `Sidebar` (optional)
- Navigation menu
- Quick links
- User stats

### Contract Components

#### `ContractCard`
- Contract preview card
- Year, type, status
- Quick actions (view, delete)
- Status badge

#### `ContractList`
- List of contracts
- **Checkbox selection** for batch operations
- Sorting/filtering
- Pagination
- Empty state
- **Selected contracts count** indicator
- **"Get Report" button** (triggers batch analysis)

#### `ContractUpload`
- File upload component
- Drag & drop zone
- File validation
- Upload progress
- Metadata form

#### `ContractDetail`
- Contract information display
- File download
- Status indicators
- Actions menu

### Analysis Components

#### `AnalysisSummary`
- High-level summary card
- Key metrics

#### `KeyTermsDisplay`
- Structured key terms
- Visual representation (cards, tables)
- Highlight important values

#### `CoverageDetails`
- Coverage breakdown
- Expandable sections
- Visual indicators

#### `ExclusionsList`
- List of exclusions
- Highlighted warnings

#### `PremiumInfo`
- Premium structure
- Payment schedule
- Visual charts (optional)

### Comparison Components

#### `ComparisonView`
- Side-by-side layout
- Highlighted differences
- Change indicators (+/-)
- Summary section

#### `ChangeIndicator`
- Visual indicator for changes
- Color coding (green for additions, red for removals)
- Percentage changes

### Billing Components

#### `SubscriptionCard`
- Current plan display
- Two tiers:
  - **AI Analyzer**: Basic AI analysis features
  - **AI Analyzer Plus**: AI analysis + human review access
- Features list
- Upgrade/downgrade buttons

#### `PaymentHistory`
- Table of past payments
- Status indicators
- Receipt download links

#### `HumanReviewUpsell`
- Modal/dialog for upsell
- **Pricing: $150 (configurable)**
- Benefits list
- Note: Available to AI Analyzer Plus subscribers or as one-time purchase
- Stripe checkout button

### UI Components (shadcn/ui)

Use shadcn/ui for:
- Button
- Card
- Dialog/Modal
- Form (with react-hook-form)
- Input
- Select
- Table
- Badge
- Alert
- Progress
- Tabs
- Dropdown Menu
- Toast/Notifications

## State Management

### TanStack Query (React Query) - REQUIRED
- **Primary library for all data fetching**
- Data fetching and caching
- Automatic refetching
- Optimistic updates
- Loading/error states
- Query invalidation
- Background refetching
- Stale-while-revalidate pattern

### Context API
- Auth context (Better-Auth)
- Theme context (if needed)
- Toast notifications

### Local State
- Form state (react-hook-form)
- UI state (modals, tabs, etc.)
- Component-specific state

### TanStack Query Setup
- QueryClient provider in App.tsx
- Default query options (staleTime, cacheTime, retry logic)
- Query keys organized by resource type
- Mutations for create/update/delete operations

## Styling

### Tailwind CSS
- Utility-first approach
- Custom color palette
- Responsive design (mobile-first)
- Dark mode support (optional)

### Design System
- Consistent spacing (4px grid)
- Typography scale
- Color palette:
  - Primary: Blue
  - Success: Green
  - Warning: Yellow
  - Error: Red
  - Neutral: Gray

### Component Styling
- shadcn/ui components (customizable)
- Consistent border radius
- Shadow system
- Animation/transitions

## User Experience

### Loading States
- Skeleton loaders for content
- Progress indicators for uploads
- Spinner for API calls

### Error Handling
- Error boundaries
- Toast notifications for errors
- Inline error messages for forms
- Retry mechanisms

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## File Upload Flow

1. User selects/drops PDF file
2. Validate file (type, size)
3. Show upload progress
4. Upload to backend
5. Backend returns contract ID
6. Redirect to contract detail page
7. Show processing status
8. Poll or use WebSocket for completion
9. Display analysis when ready
10. Send email notification (backend)

## Integration Points

### Better-Auth
- Client-side auth hooks
- Session management
- Protected routes
- Auto-refresh tokens

### Stripe
- Stripe.js for checkout
- Elements for payment forms
- Webhook handling (backend)

### API Client
- Axios or fetch wrapper
- Automatic token injection
- Error handling
- Request/response interceptors

## Performance Optimization

- Code splitting (route-based)
- Lazy loading components
- Image optimization (if needed)
- Memoization (React.memo, useMemo)
- Virtual scrolling for long lists
- Debounced search

## Testing Strategy (Future)

- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Visual regression (optional)

