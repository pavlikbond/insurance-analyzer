# Feature Requirements

## Core Features

### 1. User Authentication & Authorization

#### 1.1 User Registration
- **Priority**: High
- **Description**: Users can create an account with email and password
- **Requirements**:
  - Email validation
  - Password strength requirements
  - Email verification (optional, future)
  - Terms of service acceptance

#### 1.2 User Sign In
- **Priority**: High
- **Description**: Users can sign in to their account
- **Requirements**:
  - Email/password authentication
  - "Remember me" functionality
  - Session management
  - Password reset (future)

#### 1.3 User Profile
- **Priority**: Medium
- **Description**: Users can view and edit their profile
- **Requirements**:
  - View/edit name and email
  - Change password
  - Account deletion (future)

### 2. Contract Upload & Management

#### 2.1 Upload Contract
- **Priority**: High
- **Description**: Users can upload insurance contract PDFs. Uploads are NOT automatically analyzed.
- **Requirements**:
  - Drag & drop file upload
  - File type validation (PDF only)
  - File size limit (10MB)
  - Progress indicator
  - **Coverage year input (REQUIRED)** - Users must specify which coverage year this PDF is for
  - Contract type input (optional)
  - Duplicate detection (optional)
  - Error handling for invalid files
  - Contract stored with status "uploaded" (ready for analysis)

#### 2.2 Contract List
- **Priority**: High
- **Description**: Users can view all their uploaded contracts and select which ones to analyze
- **Requirements**:
  - List view with pagination
  - Filter by year, status, type
  - Search by filename
  - Sort by date, year, status
  - Status indicators (uploaded, processing, analyzed, failed)
  - **Checkbox selection** - Users can select multiple contracts
  - **"Get Report" button** - Triggers batch analysis for selected contracts
  - Quick actions (view, delete)
  - Visual indication of which contracts are analyzed vs. uploaded

#### 2.3 Contract Details
- **Priority**: High
- **Description**: Users can view contract details and download original file
- **Requirements**:
  - Contract metadata display
  - Download original PDF
  - View processing status
  - Link to analysis
  - Delete contract option

#### 2.4 Contract Deletion
- **Priority**: Medium
- **Description**: Users can delete contracts and associated data
- **Requirements**:
  - Confirmation dialog
  - Cascade delete (analysis, comparisons)
  - S3 file deletion
  - Audit log (optional)

### 3. AI Analysis

#### 3.1 Batch Analysis
- **Priority**: High
- **Description**: Users select contracts and trigger batch analysis via "Get Report" button
- **Requirements**:
  - User selects one or more uploaded contracts
  - User clicks "Get Report" button
  - System processes selected contracts in batch
  - Extract text from PDF using pdf-parse
  - Send to OpenAI for analysis
  - Parse and structure response
  - Store in database
  - Error handling and retry logic
  - Processing status updates
  - Email notification when analysis complete

#### 3.2 Analysis Display
- **Priority**: High
- **Description**: Users can view AI-generated analysis with focus on potential issues
- **Requirements**:
  - Summary section
  - Key terms extraction (deductibles, limits, premiums)
  - Coverage details breakdown
  - Exclusions list
  - Premium information
  - **Missed coverage detection** - Highlight areas not covered
  - **Coverage gaps identification** - Identify gaps in coverage
  - **Hidden clauses warning** - Flag concerning clauses
  - **Common issues section** - Highlight common problems for this type of coverage
  - **Roofing & siding coverage analysis** - Special focus on roofing/siding coverage (major concern area)
  - Visual formatting
  - Export to PDF (optional, future)

#### 3.3 Re-analysis
- **Priority**: Low
- **Description**: Users can trigger re-analysis of a contract
- **Requirements**:
  - Button to re-analyze
  - Confirmation dialog
  - Update existing analysis or create new version

### 4. Contract Comparison

#### 4.1 Year-over-Year Comparison
- **Priority**: High
- **Description**: Compare new contract with previous year's contract (auto-detected from database)
- **Requirements**:
  - User selects new contract to compare
  - **Auto-detect previous contract** from database:
    - Find contract with `coverageStart` date approximately 1 year before the new contract's start date
    - If multiple exist, use most recently uploaded
  - Manual override option (user can select different previous contract)
  - AI-powered change detection
  - Highlight differences
  - Summary of changes (especially roofing/siding coverage changes)
  - Visual diff view

#### 4.2 Comparison Display
- **Priority**: High
- **Description**: Users can view comparison results
- **Requirements**:
  - Side-by-side comparison
  - Change indicators (+, -, modified)
  - Percentage changes
  - Summary of key changes
  - Detailed change list
  - Export comparison report (optional, future)

#### 4.3 Comparison History
- **Priority**: Medium
- **Description**: Users can view past comparisons
- **Requirements**:
  - List of all comparisons
  - Filter by year
  - View comparison details
  - Delete comparisons

### 5. Human Review (Upsell Feature)

#### 5.1 Request Human Review
- **Priority**: High
- **Description**: Users can request human review of analysis or comparison (upsell feature)
- **Requirements**:
  - Upsell modal/CTA
  - **Pricing display ($150, configurable)** - Can be adjusted via configuration
  - Stripe payment integration
  - Request submission
  - Status tracking
  - Only available to users with "ai_analyzer_plus" plan, or as one-time purchase

#### 5.2 Human Review Status
- **Priority**: High
- **Description**: Users can track human review requests
- **Requirements**:
  - Status indicators (pending, in progress, completed)
  - Estimated completion time
  - Notification when complete
  - View reviewer notes

#### 5.3 Human Review Display
- **Priority**: High
- **Description**: Users can view human review results
- **Requirements**:
  - Reviewer notes display
  - Comparison with AI analysis
  - Highlighted insights
  - Download review report (optional)

### 6. Billing & Subscriptions

#### 6.1 Subscription Management
- **Priority**: High
- **Description**: Users can manage their subscription (two tiers only, no free tier)
- **Requirements**:
  - View current plan
  - Two subscription tiers:
    - **AI Analyzer**: Basic tier with AI analysis features
    - **AI Analyzer Plus**: Same as basic + human review access included
  - Upgrade/downgrade options
  - Stripe checkout integration
  - Cancel subscription
  - Resume subscription

#### 6.2 Payment History
- **Priority**: Medium
- **Description**: Users can view payment history
- **Requirements**:
  - List of all payments
  - Payment status
  - Receipt download links
  - Filter by date, type

#### 6.3 Usage Limits
- **Priority**: Medium
- **Description**: Both tiers have same usage limits (unlimited contracts)
- **Requirements**:
  - AI Analyzer: Unlimited contract uploads and analyses
  - AI Analyzer Plus: Same as AI Analyzer + human review access
  - Usage tracking (for analytics)
  - Future: May add usage limits if needed

### 7. Notifications

#### 7.1 Email Notifications
- **Priority**: High
- **Description**: Users receive email notifications for important events
- **Requirements**:
  - Analysis ready notification
  - Comparison ready notification
  - Human review ready notification
  - Billing notifications
  - Email preferences (future)

#### 7.2 In-App Notifications
- **Priority**: Medium
- **Description**: In-app notification system
- **Requirements**:
  - Notification center
  - Unread count
  - Mark as read
  - Notification history

## Future Features

### 8. Advanced Features (Future)

#### 8.1 Multi-Contract Comparison
- Compare more than 2 contracts
- Timeline view
- Trend analysis

#### 8.2 Custom Analysis Prompts
- Users can specify what to analyze
- Custom questions
- Focus areas

#### 8.3 Contract Templates
- Pre-defined contract types
- Template matching
- Auto-categorization

#### 8.4 Team/Organization Features
- Multiple users
- Shared contracts
- Role-based access

#### 8.5 API Access
- REST API for developers
- Webhook support
- Integration marketplace

#### 8.6 Advanced Analytics
- Usage analytics
- Cost tracking
- Trend analysis
- Reports dashboard

## User Stories

### As a user, I want to...
1. Sign up and create an account
2. Upload my insurance contract PDFs (specifying coverage year for each)
3. Select which contracts I want analyzed
4. Click "Get Report" to trigger AI analysis
5. View AI analysis of my contracts (with focus on missed coverage, gaps, hidden clauses, and roofing/siding issues)
6. Compare this year's contract with last year's (automatically detected)
7. See what changed in my contract
8. Request a human review for important contracts ($150)
9. Manage my subscription and billing (AI Analyzer or AI Analyzer Plus)
10. Receive email notifications when analysis is ready
11. Download my original contract files
12. Delete contracts I no longer need

## Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- File upload progress tracking
- Real-time status updates
- Efficient PDF processing

### Security
- Encrypted file storage
- Secure authentication
- API rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### Scalability
- Handle 1000+ concurrent users
- Support files up to 10MB
- Efficient database queries
- S3 storage optimization

### Reliability
- 99.9% uptime
- Error handling and recovery
- Data backup and recovery
- Graceful degradation

### Usability
- Intuitive UI/UX
- Mobile-responsive design
- Clear error messages
- Helpful tooltips and guides
- Accessibility compliance (WCAG 2.1 AA)

## Success Metrics

### User Engagement
- Number of contracts uploaded per user
- Number of comparisons performed
- Human review conversion rate
- User retention rate

### Business Metrics
- Subscription conversion rate
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)
- Customer lifetime value (CLV)

### Technical Metrics
- API response time
- PDF processing time
- Error rate
- System uptime

