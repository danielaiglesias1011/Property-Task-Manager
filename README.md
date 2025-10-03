# Property Task Manager

A comprehensive task management system designed specifically for real estate and property management companies. This application provides a complete solution for managing properties, projects, tasks, approvals, and financial forecasting.

## Features

### 🏢 Property Management
- **Property Portfolio**: Manage multiple properties with detailed information
- **Property Dashboard**: View projects and tasks associated with each property
- **Property Statistics**: Track active tasks, completed tasks, and project counts

### 📋 Project Management
- **Project Creation**: Create projects with detailed information and funding details
- **Approval Workflow**: Multi-level approval system (Level 1, 2, 3)
- **Project Status Tracking**: Track projects from draft to completion
- **Attachment Management**: Support for estimates, invoices, quotes, contracts, and custom types

### ✅ Task Management
- **Comprehensive Task Creation**: Name, description, start/end dates, assignee, priority
- **Task Relationships**: Tasks can be linked to projects or standalone
- **Comments System**: Add and track comments on tasks
- **Attachment Support**: Multiple attachment types for documentation
- **Status Tracking**: Pending, in-progress, completed, cancelled statuses
- **Priority Management**: Low, medium, high priority levels

### 💰 Financial Forecasting
- **Funding Details**: Track deposits, progress payments, final payments, and budgets
- **Financial Overview**: Comprehensive dashboard with funding summaries
- **Filtering & Sorting**: Advanced filtering by property, type, date, and amount
- **Export Capabilities**: Export financial data for reporting

### 🔐 Approval System
- **Multi-Level Approvals**: Three-tier approval system with user groups
- **Approval History**: Complete audit trail of all approval actions
- **Status Management**: Approve, reject, or request changes
- **Comment System**: Add comments during approval process

### ⚙️ Settings & Configuration
- **Custom Attachment Types**: Add your own attachment categories
- **User Management**: Level-based user roles and permissions
- **System Configuration**: Customize the application to your needs

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router for navigation
- **State Management**: React Context API with useReducer
- **Date Handling**: date-fns for date manipulation
- **Build Tool**: Create React App

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone or download the project files**
   ```bash
   # If you have the files, navigate to the project directory
   cd property-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

## Usage Guide

### Getting Started

1. **Dashboard Overview**: Upon login, you'll see the main dashboard with:
   - Property, project, and task statistics
   - Recent activity overview
   - Pending approvals and overdue tasks alerts

2. **Managing Properties**: 
   - Navigate to the Properties section
   - Click on any property to view its projects and tasks
   - Create new projects and tasks directly from property details

### Creating Projects

1. Go to a property's detail page
2. Click "New Project"
3. Fill in project information:
   - Name and description
   - Approval level required (1-3)
   - **Funding details** (mandatory):
     - Type: Deposit, Progress, Final, or Budget
     - Amount: Must be greater than 0
     - Date: Required for each funding entry
4. Add attachments (estimates, invoices, quotes, contracts)
5. Submit for approval

### Managing Tasks

1. Tasks can be created from:
   - Property detail pages (linked or unlinked to projects)
   - Project contexts (automatically linked)

2. Required task fields:
   - Name and description
   - Start and end dates
   - Assignee selection
   - Priority level

3. Optional features:
   - Initial comments
   - File attachments
   - Project linking

### Approval Workflow

1. **Project Submission**: All new projects require approval
2. **Approval Levels**: Users can only approve projects at or below their level
3. **Actions Available**:
   - Approve: Move project to approved status
   - Reject: Reject with required comments
   - Request Changes: Request modifications with comments

### Financial Forecasting

1. **Access**: Navigate to Forecast section
2. **View Options**:
   - Summary cards showing totals by funding type
   - Detailed table with all funding entries
   - Filter by property or funding type
   - Sort by date, amount, or type

### Settings Configuration

1. **Attachment Types**: 
   - Add custom attachment categories
   - Organize by project or task types
   - Default types cannot be deleted

## Default Data

The application comes with sample data including:

### Users
- **Admin User** (Level 3 approval)
- **Manager User** (Level 2 approval)  
- **Regular User** (Level 1 approval)

### Properties
- Downtown Office Building
- Residential Complex A

### Attachment Types
- **Project**: Estimate, Invoice, Quote, Contract
- **Task**: Photo, Document

## Key Features Explained

### Approval System
- Projects automatically enter "pending-approval" status upon creation
- Users can only approve projects at their authorization level or below
- Complete audit trail maintained for all approval actions

### Task Relationships
- Tasks can exist independently or be linked to projects
- Project tasks are grouped together for better organization
- Unlinked tasks provide flexibility for ad-hoc work

### Funding Requirements
- All projects must have at least one funding detail
- Mandatory fields ensure complete financial tracking
- Supports multiple funding types for comprehensive project costing

### Attachment Management
- Configurable attachment types in settings
- Separate categories for projects and tasks
- Default types provided, custom types can be added

## Development

### Available Scripts

- `npm start`: Run development server
- `npm build`: Build for production
- `npm test`: Run test suite
- `npm eject`: Eject from Create React App (not recommended)

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Navigation and layout components
│   ├── Properties/     # Property management components
│   ├── Projects/       # Project management components
│   ├── Tasks/          # Task management components
│   ├── Forecast/       # Financial forecasting components
│   ├── Approvals/      # Approval workflow components
│   └── Settings/       # Configuration components
├── context/            # React Context for state management
├── pages/              # Main page components
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## Browser Support

This application supports all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Support

This is a demo application built for property management companies. The application includes comprehensive task management, approval workflows, and financial forecasting specifically designed for real estate operations.

For questions or customization requests, please refer to the code documentation and comments throughout the application.


