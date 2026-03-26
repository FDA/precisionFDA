# Frontend Best Practices & Coding Standards

This document outlines the coding patterns, conventions, and best practices used in `packages/client`. The **Discussions**, **Spaces**, and **Data Portals** features are considered reference implementations for these patterns.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Component Patterns](#component-patterns)
5. [Styling](#styling)
6. [State Management & Data Fetching](#state-management--data-fetching)
7. [Forms](#forms)
8. [Routing](#routing)
9. [Tables](#tables)
10. [Actions Menu](#actions-menu)
11. [Modals](#modals)
12. [Icons](#icons)
13. [Accessibility](#accessibility)
14. [Drag and Drop](#drag-and-drop)
15. [Rich Text Editing](#rich-text-editing)
16. [Testing](#testing)
17. [Mocking](#mocking)
18. [Storybook](#storybook)
19. [Error Handling](#error-handling)
20. [Naming Conventions](#naming-conventions)
21. [File Organization Summary](#file-organization-summary)
22. [Quick Reference](#quick-reference)

---

## Technology Stack

Our frontend technology stack is built on:

| Technology | Purpose |
|------------|---------|
| **React 19.2** | UI framework with modern features including `useEffectEvent` |
| **TypeScript** | Static typing - use proper types, avoid `any` |
| **Vite** | Build tool and dev server |
| **TanStack Query** | Server state management and data fetching |
| **TanStack Table** | Headless table library |
| **React Router v7** | Client-side routing |
| **react-hook-form + Yup** | Form handling and validation |
| **axios** | HTTP client for API calls |
| **CSS Modules** | Scoped component styling |
| **Base UI** | Accessible unstyled components |
| **Lucide React** | Icon library |
| **Vitest** | Unit testing framework |
| **Playwright** | E2E testing framework |
| **MSW** | API mocking for development and tests |
| **@dnd-kit** | Drag and drop functionality |
| **Lexical** | Rich text editor for data portal pages |

### Core Principles

- **TypeScript**: Use proper types everywhere, avoid `any` at all costs
- **React 19**: Leverage modern React features like `useEffectEvent` for stable event handlers
- **CSS Modules**: Prefer CSS Modules for component styling over styled-components
- **Accessibility First**: Use Base UI components for accessible primitives

---

## Project Structure

The client package follows a feature-based architecture with clear separation of concerns:

```
packages/client/
├── src/
│   ├── api/                    # Shared API utilities
│   │   ├── mutations/          # Shared mutation hooks
│   │   ├── queries/            # Shared query hooks
│   │   └── types.ts            # API type definitions
│   ├── assets/                 # Static assets (images, SVGs)
│   ├── components/             # Shared UI components
│   │   ├── Button/
│   │   ├── Table/              # Custom TanStack Table wrapper
│   │   ├── Menu/
│   │   ├── Pill/
│   │   └── ...
│   ├── constants/              # Application constants
│   ├── declarations/           # TypeScript declaration files
│   ├── features/               # Feature modules (domain-driven)
│   │   ├── discussions/
│   │   │   ├── api.ts          # API request functions
│   │   │   ├── discussions.types.ts
│   │   │   ├── DiscussionShow.tsx
│   │   │   ├── form/           # Feature-specific forms
│   │   │   └── card/           # Feature-specific components
│   │   ├── spaces/
│   │   ├── files/
│   │   ├── admin/
│   │   └── ...
│   ├── hooks/                  # Shared custom hooks
│   ├── layouts/                # Layout components
│   ├── mocks/                  # MSW mock handlers
│   │   └── handlers/           # Domain-specific handlers
│   ├── pages/                  # Top-level page components
│   ├── routes/                 # Route definitions
│   ├── stories/                # Storybook utilities
│   ├── styles/                 # Global styles and variables
│   ├── test/                   # Test utilities and setup
│   ├── types/                  # Shared type definitions
│   └── utils/                  # Utility functions
├── e2e/                        # Playwright E2E tests
│   ├── tests/
│   ├── fixtures/
│   └── playwright.config.ts
├── .storybook/                 # Storybook configuration
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

### Key Principles

- **Feature-driven structure**: Group related code by domain in `features/`
- **Shared components in components/**: Reusable UI components live in `src/components`
- **Co-locate feature code**: Keep API, types, and components together in feature folders
- **Path aliases**: Use `@/` alias for imports (e.g., `@/components/Button`)

---

## Development Setup

### Starting the Development Server

```bash
cd packages/client
pnpm install
pnpm run dev
```

The dev server runs at `https://localhost:4000` with proxy configuration for API calls.

### With MSW Mocking

```bash
pnpm run dev:msw
# or
ENABLE_DEV_MSW=true pnpm run dev
```

### Build for Production

```bash
pnpm run build
```

The build outputs to `../rails/public/packs` for integration with the Rails application.

---

## Component Patterns

### Functional Components with TypeScript

Always use functional components with proper TypeScript interfaces:

```tsx
import React from 'react'
import styles from './MyComponent.module.css'
import { cn } from '@/utils/cn'

export interface MyComponentProps {
  /** The content to display */
  children: React.ReactNode
  /** Optional CSS class name */
  className?: string
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ children, className, onClick }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(styles.container, className)}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }
)

MyComponent.displayName = 'MyComponent'
```

### Component Organization

Each component should follow this structure:

```
ComponentName/
├── index.tsx          # Main component (or index.ts for re-exports)
├── ComponentName.tsx  # Component implementation (if using index.ts)
├── ComponentName.module.css  # Styles
├── ComponentName.test.tsx    # Tests
└── ComponentName.stories.tsx # Storybook stories
```

### Using `useEffectEvent` (React 19)

For stable callbacks in effects, use `useEffectEvent`:

```tsx
import { useEffect, useEffectEvent } from 'react'

function Chat({ roomId, onMessage }) {
  // Stable reference that always has the latest onMessage
  const onReceive = useEffectEvent((message) => {
    onMessage(message)
  })

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on('message', onReceive)
    return () => connection.disconnect()
  }, [roomId]) // No need to include onReceive
}
```

### Lazy Loading

Use React.lazy for route-level code splitting:

```tsx
const DataPortalRoutes = React.lazy(() => import('../features/data-portals/routes'))
const ExpertsSinglePage = React.lazy(() => import('../features/experts/details/index'))

// In routes
{
  path: 'data-portals/*',
  element: (
    <React.Suspense fallback={<LayoutLoader />}>
      <DataPortalRoutes />
    </React.Suspense>
  )
}
```

---

## Styling

### CSS Modules (Preferred)

Use CSS Modules for component styling. This is the preferred approach over styled-components.

**Component file (`Pill.tsx`):**
```tsx
import React from 'react'
import styles from './Pill.module.css'
import { cn } from '@/utils/cn'

export const Pill = ({ children, variant = 'default', className }) => {
  return (
    <div className={cn(styles.pill, styles[`pill${variant}`], className)}>
      {children}
    </div>
  )
}
```

**Styles file (`Pill.module.css`):**
```css
.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.pillDefault {
  background-color: var(--tertiary-100);
  color: var(--c-text-600);
  border-color: var(--tertiary-200);
}

.pillDefault:hover {
  background-color: var(--tertiary-200);
}

.pillPrimary {
  background-color: var(--primary-100);
  color: var(--primary-700);
}
```

### CSS Variables

Use CSS variables defined in `src/styles/variables.ts` for consistent theming:

**Color Scales:**
- `--primary-50` through `--primary-900` (blue tones)
- `--tertiary-30` through `--tertiary-900` (grays)
- `--success-50` through `--success-900` (greens)
- `--warning-50` through `--warning-900` (reds)
- `--highlight-50` through `--highlight-900` (yellows/oranges)
- `--purple-50` through `--purple-900`

**Semantic Variables:**
- `--background` - Page background
- `--base` - Base text color
- `--c-link` / `--c-link-hover` - Link colors
- `--c-layout-border` - Border colors
- `--c-text-700` through `--c-text-100` - Text colors

### The `cn()` Utility

Use the `cn()` utility for combining class names:

```tsx
import { cn } from '@/utils/cn'

<div className={cn(
  styles.base,
  isActive && styles.active,
  disabled && styles.disabled,
  className
)} />
```

### Dark Mode Support

Variables automatically adjust for dark mode via `:global(html.dark)` selectors. Use the semantic variables (e.g., `--background`, `--c-text-600`) rather than hardcoded colors.

### shadcn/ui Inspiration

When creating new UI components, take inspiration from [shadcn/ui](https://ui.shadcn.com/) for:
- Component API design
- Visual styling patterns
- Variant naming conventions
- Accessibility patterns

---

## State Management & Data Fetching

### TanStack Query Setup

The app uses TanStack Query for server state management. The QueryClient is configured in `src/index.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
```

### Query Hooks

Create query hooks for data fetching:

```tsx
// features/discussions/api.ts
import axios from 'axios'

export async function fetchDiscussionRequest(discussionId: number) {
  return axios.get<Discussion>(`/api/v2/discussions/${discussionId}`)
    .then(r => r.data)
}

// api/queries/discussion.ts
import { useQuery } from '@tanstack/react-query'

export const getFetchDiscussionQueryKey = (discussionId: number) => 
  ['discussion', { id: discussionId }]

export const useFetchDiscussionQuery = (discussionId: number) =>
  useQuery({
    queryKey: getFetchDiscussionQueryKey(discussionId),
    queryFn: () => fetchDiscussionRequest(discussionId),
  })
```

### Mutation Hooks

Create mutation hooks for data modifications:

```tsx
// api/mutations/user.ts
import { useMutation } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'

export const useResendActivationEmailMutation = () =>
  useMutation({
    mutationKey: ['resend-activation-email'],
    mutationFn: resendActivationEmail,
    onSuccess: () => {
      toastSuccess('Activation email was resent to the user')
    },
    onError: (e: BackendError) => {
      toastError('Failed to resend activation email: ' + e.error.message)
    },
  })
```

### API Request Patterns

Use axios for all API requests with relative URLs:

```tsx
import axios from 'axios'

// GET request
export async function fetchItems(params: Params) {
  const query = new URLSearchParams(params).toString()
  return axios.get(`/api/v2/items?${query}`).then(r => r.data)
}

// POST request
export async function createItem(payload: ItemPayload) {
  return axios.post<IdResponse>('/api/v2/items', payload).then(r => r.data)
}

// PATCH request
export async function updateItem(id: number, payload: Partial<ItemPayload>) {
  return axios.patch<IdResponse>(`/api/v2/items/${id}`, payload).then(r => r.data)
}

// DELETE request
export async function deleteItem(id: number) {
  return axios.delete(`/api/v2/items/${id}`).then(r => r.data)
}
```

CSRF tokens are set globally in `src/index.tsx`:

```tsx
Axios.defaults.headers.common['X-CSRF-Token'] = getAuthenticityToken()
```

---

## Forms

### react-hook-form with Yup Validation

Use react-hook-form with yupResolver for form handling:

```tsx
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ErrorMessage } from '@hookform/error-message'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  title: Yup.string().min(3).max(255).required('Title is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  description: Yup.string().max(1000).optional(),
})

interface FormData {
  title: string
  email: string
  description?: string
}

export const MyForm = ({ onSubmit, defaultValues }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: '',
      email: '',
      description: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup label="Title" required>
        <InputText {...register('title')} disabled={isSubmitting} />
        <ErrorMessage
          errors={errors}
          name="title"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      <FieldGroup label="Email" required>
        <InputText type="email" {...register('email')} />
        <ErrorMessage errors={errors} name="email" 
          render={({ message }) => <InputError>{message}</InputError>} />
      </FieldGroup>

      <Button 
        type="submit" 
        data-variant="primary"
        disabled={!isValid || isSubmitting}
      >
        Submit
      </Button>
    </form>
  )
}
```

### Form Components

Use the shared form components:

- `FieldGroup` - Wrapper with label and layout
- `InputText` / `InputTextArea` - Text inputs
- `InputDate` - Date picker
- `Checkbox` - Checkbox input
- `RadioButtonGroup` - Radio buttons
- `InputError` - Error message display

---

## Routing

### React Router v7

Routes are defined in `src/routes/root.tsx`:

```tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { RouterProvider } from 'react-router/dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootComponent />,
    children: [
      // Public routes
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },

      // Protected routes
      {
        element: <AuthWall />,
        children: [
          { path: 'admin/*', element: <Admin /> },
          { path: 'home/*', element: <HomeShowLayout />, children: homeRoutes },
          { path: 'spaces/*', children: spacesRoutes },
        ],
      },
    ],
  },
])

export default function Root() {
  return <RouterProvider router={router} />
}
```

### Route Organization

The routes are organized to maximize code reuse between similar contexts (home and spaces):

```
routes/
├── root.tsx              # Main router configuration
├── home/
│   └── index.tsx         # Home-specific routes (extends shared)
├── spaces/
│   └── index.tsx         # Spaces-specific routes (extends shared)
├── shared.tsx            # Common routes shared between home & spaces
└── resource-pages.tsx    # Page components that work in both contexts
```

### Shared Routes Pattern

The application uses a shared routes pattern where common resource pages (files, apps, databases, etc.) work identically in both `/home/*` and `/spaces/:spaceId/*` contexts.

**`shared.tsx`** - Defines routes common to both home and spaces:

```tsx
import { type RouteObject, Navigate } from 'react-router'
import {
  FilesListPage,
  FileShowPage,
  AppsListPage,
  DatabaseListPage,
  // ... more page components
} from './resource-pages'

/**
 * Common routes shared between home and spaces.
 * These routes work with the unified context system.
 */
export const commonResourceRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="files" replace /> },
  { path: 'files', Component: FilesListPage },
  { path: 'files/:fileId', Component: FileShowPage },
  { path: 'apps', Component: AppsListPage },
  { path: 'databases', Component: DatabaseListPage },
  { path: 'executions', Component: ExecutionListPage },
  { path: 'discussions', Component: DiscussionListPage },
  // ... more shared routes
]
```

**`home/index.tsx`** - Extends shared routes with home-specific routes:

```tsx
import { commonResourceRoutes } from '../shared'
import { AssetsListPage, AssetShowPage } from '../resource-pages'

export const homeRoutes: RouteObject[] = [
  ...commonResourceRoutes,
  // Home-only routes
  { path: 'apps/create', Component: CreateAppPage },
  { path: 'assets', Component: AssetsListPage },
  { path: 'assets/:assetUid/*', Component: AssetShowPage },
]
```

**`spaces/index.tsx`** - Extends shared routes with space-specific routes:

```tsx
import { commonResourceRoutes } from '../shared'
import { MembersListPage } from '../resource-pages'

export const spaceResourceRoutes: RouteObject[] = [
  ...commonResourceRoutes,
  // Space-only routes
  { path: 'members', Component: MembersListPage },
  { path: 'edit', Component: SpaceSettings },
]
```

### Unified Route Context

The `resource-pages.tsx` file contains page components that adapt to both home and space contexts using the `useUnifiedRouteContext` hook:

```tsx
// resource-pages.tsx

interface HomeContextResult {
  isHome: true
  homeContext: HomeScopeContextValue
  space?: undefined
}

interface SpaceContextResult {
  isHome: false
  homeContext?: undefined
  space: ISpace
  isLoading: boolean
}

type UnifiedContextResult = HomeContextResult | SpaceContextResult

export function useUnifiedRouteContext(): UnifiedContextResult {
  const homeContext = useHomeScope()
  const spaceContext = useOutletContext<SpaceOutletContext | undefined>()

  // If we have a space in the outlet context, we're in a space route
  if (spaceContext?.space) {
    return {
      isHome: false,
      space: spaceContext.space,
      isLoading: spaceContext.isLoading,
    }
  }

  // Otherwise we're in home context
  return {
    isHome: true,
    homeContext,
  }
}
```

### Using Unified Context in Page Components

Page components use the unified context to adapt their behavior:

```tsx
// resource-pages.tsx

export const FilesListPage = () => {
  const context = useUnifiedRouteContext()
  const user = useAuthUser()
  const [searchParams] = useSearchParams()

  // Redirect to default scope if not specified (home only)
  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  return (
    <FileList
      homeScope={context.homeContext?.homeScope}
      space={context.space}
      isAdmin={user?.isAdmin}
      showFolderActions
    />
  )
}

export const AppsListPage = () => {
  const context = useUnifiedRouteContext()
  const user = useAuthUser()

  // Calculate permissions based on context
  const isContributorOrHigher = context.space
    ? ['lead', 'admin', 'contributor'].includes(context.space.current_user_membership.role)
    : undefined

  return (
    <AppList
      homeScope={context.homeContext?.homeScope}
      spaceId={context.space?.id.toString()}
      isAdmin={user?.isAdmin}
      isContributorOrHigher={isContributorOrHigher}
    />
  )
}
```

### Context-Specific Redirects

Some resources are only available in certain contexts:

```tsx
export const AssetsListPage = () => {
  const context = useUnifiedRouteContext()

  // Assets not available in spaces - redirect back
  if (!context.isHome) {
    return <Navigate to=".." replace />
  }

  return <AssetList homeScope={context.homeContext?.homeScope} />
}

export const MembersListPage = () => {
  const spaceContext = useOutletContext<SpaceOutletContext | undefined>()

  // Members only available in spaces
  if (!spaceContext?.space) {
    return <Navigate to=".." replace />
  }

  return <MembersList space={spaceContext.space} />
}
```

### Protected Routes

Use `AuthWall` component to protect authenticated routes:

```tsx
{
  element: <AuthWall />,
  children: [
    // All children require authentication
    { path: 'dashboard', element: <Dashboard /> },
  ],
}
```

### Home vs Spaces: Similarities and Differences

The application has two primary contexts for managing resources: **My Home** and **Spaces**. Understanding their relationship is key to working with the shared routes architecture.

#### Similarities

| Aspect | Description |
|--------|-------------|
| **Shared Resources** | Both contexts manage the same resource types: files, apps, databases, workflows, executions, discussions |
| **Same UI Components** | Tables, action menus, modals, and detail pages are reused across both contexts |
| **Shared Routes** | `commonResourceRoutes` defines identical route structures for both |
| **Unified Context Hook** | `useUnifiedRouteContext()` provides consistent access to context data |
| **Actions Pattern** | Same `useXxxSelectActions` hooks work in both contexts |
| **Data Fetching** | Same query patterns with context-aware parameters |

#### Fundamental Differences

| Aspect | My Home | Spaces |
|--------|---------|--------|
| **URL Structure** | `/home/files`, `/home/apps` | `/spaces/:spaceId/files`, `/spaces/:spaceId/apps` |
| **Scope System** | Uses `?scope=` query param (`me`, `featured`, `everybody`, `spaces`) | Implicitly scoped to the space via `spaceId` |
| **Ownership Model** | Individual user ownership | Collaborative team ownership |
| **Access Control** | User owns their private resources; public resources visible to all | Role-based: `lead`, `admin`, `contributor`, `viewer` |
| **Exclusive Features** | Assets (not available in spaces), Create App | Members list, Space settings, Space activation |
| **Context Provider** | `HomeScopeContext` with `homeScope` value | `SpaceOutletContext` with `space` object |
| **Publishing** | Can publish private → public | Can copy to/from spaces |

#### Home Scopes Explained

My Home uses a scope system via query parameters:

| Scope | URL | Description |
|-------|-----|-------------|
| `me` | `/home/files?scope=me` | User's private resources |
| `featured` | `/home/files?scope=featured` | Admin-featured public resources |
| `everybody` | `/home/files?scope=everybody` | All public resources |
| `spaces` | `/home/files?scope=spaces` | Resources from user's spaces (limited actions) |

```tsx
// Redirect to default scope if not specified
if (context.isHome && !searchParams.has('scope')) {
  return <Navigate to="?scope=me" replace />
}
```

#### Space Roles and Permissions

Spaces use role-based access control:

| Role | Permissions |
|------|-------------|
| `lead` | Full control, can manage members, edit space settings |
| `admin` | Manage members, full resource access |
| `contributor` | Create, edit, delete resources |
| `viewer` | Read-only access to resources |

```tsx
// Check if user can perform contributor actions
const isContributorOrHigher = context.space
  ? ['lead', 'admin', 'contributor'].includes(context.space.current_user_membership.role)
  : undefined
```

#### Context-Specific Route Handling

Some routes only exist in one context:

```tsx
// home/index.tsx - Home-only routes
export const homeRoutes: RouteObject[] = [
  ...commonResourceRoutes,
  { path: 'apps/create', Component: CreateAppPage },     // Home only
  { path: 'assets', Component: AssetsListPage },         // Home only
  { path: 'assets/:assetUid/*', Component: AssetShowPage },
]

// spaces/index.tsx - Space-only routes
export const spaceResourceRoutes: RouteObject[] = [
  ...commonResourceRoutes,
  { path: 'members', Component: MembersListPage },       // Spaces only
  { path: 'edit', Component: SpaceSettings },            // Spaces only
]
```

#### Adapting Components to Context

Components adapt their behavior based on context:

```tsx
export const DiscussionListPage = () => {
  const context = useUnifiedRouteContext()

  // Permission logic differs between contexts
  const canCreateDiscussion = context.isHome
    ? context.homeContext?.homeScope === 'everybody'  // Only in public scope
    : ['lead', 'admin', 'contributor'].includes(     // Role-based in spaces
        context.space!.current_user_membership.role
      )

  return (
    <DiscussionList
      homeScope={context.homeContext?.homeScope}
      spaceId={context.space?.id}
      canCreateDiscussion={canCreateDiscussion}
    />
  )
}
```

#### API Calls with Context

API calls include context-specific parameters:

```tsx
// Home context - uses scope
const { data } = useQuery({
  queryKey: ['files', { scope: homeScope }],
  queryFn: () => fetchFiles({ scope: homeScope }),
})

// Space context - uses spaceId
const { data } = useQuery({
  queryKey: ['files', { spaceId: space.id }],
  queryFn: () => fetchFiles({ spaceId: space.id }),
})
```

### Benefits of This Pattern

1. **DRY**: Resource pages (files, apps, etc.) are defined once and work in both contexts
2. **Type Safety**: The `UnifiedContextResult` union type ensures correct handling of each context
3. **Flexibility**: Easy to add context-specific behavior or routes
4. **Maintainability**: Changes to shared functionality only need to be made in one place

---

## Tables

### Custom Table Component

Use the custom Table component in `src/components/Table` which wraps TanStack Table:

```tsx
import Table from '@/components/Table'
import { ColumnDef } from '@tanstack/react-table'

interface User {
  id: number
  name: string
  email: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
]

export const UserTable = ({ users, isLoading }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  return (
    <Table
      data={users}
      columns={columns}
      isLoading={isLoading}
      columnSortBy={sorting}
      setColumnSortBy={setSorting}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      rowSelection={rowSelection}
      setSelectedRows={setRowSelection}
      emptyText="No users found"
    />
  )
}
```

### Column Definition Patterns

```tsx
import { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router'

const columns: ColumnDef<Item>[] = [
  // Simple accessor
  {
    accessorKey: 'name',
    header: 'Name',
  },
  
  // Custom cell renderer
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Pill variant={row.original.status}>{row.original.status}</Pill>,
  },
  
  // Link column
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <Link to={`/items/${row.original.id}`}>{row.original.title}</Link>
    ),
  },
  
  // Actions column
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <ActionsMenu item={row.original} />,
    enableSorting: false,
    enableColumnFilter: false,
  },
]
```

### Row Selection

Use the `selectColumnDef` helper for row selection:

```tsx
import { selectColumnDef } from '@/components/Table/selectColumnDef'

const columns = [
  selectColumnDef<MyRowType>(),
  // ... other columns
]
```

### Expandable Rows

Use the `expanderColumnDef` helper:

```tsx
import { expanderColumnDef } from '@/components/Table/expanderColumnDef'

const columns = [
  expanderColumnDef<MyRowType>(),
  // ... other columns
]
```

---

## Actions Menu

Resource list and detail pages use a consistent Actions pattern for performing operations on selected items. This pattern supports single and bulk operations through dropdown menus.

### Overview

The Actions system consists of:

1. **`ActionsMenu`** - A dropdown component built on Base UI
2. **Action Types** - Different action behaviors (modal, route, link, function)
3. **`useXxxSelectActions`** hooks - Feature-specific hooks that return actions and modals
4. **`ActionsMenuContent`** - Renders action items from an actions array
5. **`ActionModalsRenderer`** - Renders modal components associated with actions

### ActionsMenu Component

The `ActionsMenu` component is a dropdown menu built with Base UI:

```tsx
import { ActionsMenu } from '@/components/Menu'
import { ActionsMenuContent } from '@/features/home/ActionMenuContent'

<ActionsMenu data-testid="files-actions-button">
  <ActionsMenuContent actions={actions} />
</ActionsMenu>
```

**ActionsMenu Subcomponents:**

| Component | Purpose |
|-----------|---------|
| `ActionsMenu` | Root dropdown with trigger button |
| `ActionsMenu.Item` | Standard menu item |
| `ActionsMenu.CheckboxItem` | Toggleable checkbox item |
| `ActionsMenu.Separator` | Visual separator |
| `ActionsMenu.Message` | Informational message |

### Action Types

Actions are defined in `features/home/action-types.ts`:

```tsx
interface BaseAction {
  name: string                    // Display name
  isDisabled?: boolean            // Disable the action
  shouldHide?: boolean            // Hide from menu
  modal?: ReactNode               // Associated modal component
  cloudResourcesConditionType?: CloudResourcesConditionType
}

// Route action - navigates to a route
interface RouteAction extends BaseAction {
  type: 'route'
  to: string                      // React Router path
}

// Link action - navigates to external/Rails link
interface LinkAction extends BaseAction {
  type: 'link'
  link: string | { url: string; method: 'GET' | 'POST' }
}

// Modal action - opens a modal
interface ModalAction extends BaseAction {
  type: 'modal'
  func: () => void                // Function to show modal
  showModal?: boolean             // Current modal visibility
}

// Function action - executes a function
interface FunctionAction extends BaseAction {
  type?: undefined                // No type for function actions
  func: () => void
  children?: ReactNode            // Custom render content
}

// Selection action - checkbox toggle
interface SelectionAction extends BaseAction {
  type: 'selection'
  title: string
  isSelected: boolean
  func: (isSelected: boolean) => void
}

type Action = ModalAction | RouteAction | LinkAction | SelectionAction | FunctionAction
```

### Creating a SelectActions Hook

Each resource has a `useXxxSelectActions` hook that returns actions based on selected items:

```tsx
// features/apps/useAppSelectionActions.ts
import { Action } from '@/features/home/action-types'
import { extractModalsFromActions } from '@/features/home/extractModalsFromActions'

export interface UseAppSelectionActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useAppSelectionActions = ({
  homeScope,
  spaceId,
  selectedItems,
  resourceKeys,
  resetSelected,
}: {
  homeScope?: HomeScope
  spaceId?: string
  selectedItems: IApp[]
  resourceKeys: string[]
  resetSelected?: () => void
}): UseAppSelectionActionsResult => {
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const selected = selectedItems.filter(x => x !== undefined)

  // Initialize modal hooks
  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'app',
    selected,
    request: deleteAppsRequest,
    onSuccess: () => {
      resetSelected?.()
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({
    resource: 'apps',
    selected,
    updateFunction: copyAppsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  // Define actions array
  const actions: Action[] = [
    {
      name: 'Run',
      type: 'route',
      to: `/home/apps/${selected[0]?.uid}/jobs/new`,
      isDisabled: selected.length !== 1 || !selected[0].links.run_job,
      cloudResourcesConditionType: 'all',
    },
    {
      name: 'Edit',
      type: 'route',
      to: `/home/apps/${selected[0]?.uid}/edit`,
      isDisabled: selected.length !== 1 || selected[0].added_by !== user?.dxuser,
    },
    {
      name: 'Delete',
      type: 'modal',
      func: () => setDeleteModal(true),
      isDisabled: selected.length === 0,
      modal: deleteModal,
      showModal: isShownDeleteModal,
    },
    {
      name: 'Copy to space',
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    {
      name: 'Make public',
      type: 'route',
      to: `/publish?identifier=${selected[0]?.uid}&type=app`,
      isDisabled: selected.length !== 1,
      shouldHide: selected[0]?.location !== 'Private',
    },
  ]

  // Extract modals from actions
  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
```

### Using Actions in List Pages

```tsx
// features/apps/AppList.tsx
import { ActionsMenu } from '@/components/Menu'
import { ActionsMenuContent } from '@/features/home/ActionMenuContent'
import { ActionModalsRenderer } from '@/features/home/ActionModalsRenderer'
import { useAppSelectionActions } from './useAppSelectionActions'

export const AppList = ({ homeScope, spaceId }) => {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({})
  
  // Get selected items from table data
  const selectedItems = useMemo(() => {
    return Object.keys(selectedRows)
      .map(id => data?.find(item => item.id.toString() === id))
      .filter(Boolean) as IApp[]
  }, [selectedRows, data])

  const { actions, modals } = useAppSelectionActions({
    homeScope,
    spaceId,
    selectedItems,
    resourceKeys: ['apps', homeScope],
    resetSelected: () => setSelectedRows({}),
  })

  return (
    <>
      <ActionsRow>
        <ActionsMenu 
          data-testid="apps-actions-button"
          disabled={selectedItems.length === 0}
        >
          <ActionsMenuContent 
            actions={actions}
            message={homeScope === 'spaces' 
              ? 'To perform other actions, access from the Space' 
              : undefined
            }
          />
        </ActionsMenu>
      </ActionsRow>

      <Table
        data={data}
        columns={columns}
        rowSelection={selectedRows}
        setSelectedRows={setSelectedRows}
        // ... other props
      />

      {/* Render all modals */}
      <ActionModalsRenderer modals={modals} />
    </>
  )
}
```

### Using Actions in Detail Pages

For single-item detail pages, pass a single-item array:

```tsx
// features/apps/AppsShow.tsx
const DetailActionsDropdown = ({ app }: { app: IApp }) => {
  const { actions, modals } = useAppSelectionActions({
    homeScope: app.scope === 'private' ? 'me' : (app.scope as HomeScope),
    selectedItems: [app],  // Single item in array
    resourceKeys: ['app', app.uid],
  })

  return (
    <>
      <ActionsMenu data-testid="app-show-actions-button">
        <ActionsMenuContent actions={actions} />
      </ActionsMenu>
      <ActionModalsRenderer modals={modals} />
    </>
  )
}
```

### Action Visibility and State

Actions automatically handle:

- **`isDisabled`** - Grays out menu items (e.g., no items selected, missing permissions)
- **`shouldHide`** - Completely hides actions from the menu (e.g., admin-only actions)
- **Single vs. Multi-select** - Use `selected.length === 1` for single-item actions
- **Permission checks** - Check `item.links.*` or user roles

```tsx
{
  name: 'Edit',
  type: 'route',
  to: `/home/apps/${selected[0]?.uid}/edit`,
  // Only enable for single selection where user owns the item
  isDisabled: selected.length !== 1 || selected[0].added_by !== user?.dxuser,
},
{
  name: 'Delete',
  type: 'modal',
  func: () => setDeleteModal(true),
  // Enable for any selection count where all items can be deleted
  isDisabled: selected.length === 0 || !selected.every(e => e.links.delete),
},
{
  name: 'Feature',
  type: 'modal',
  func: () => handleFeature(),
  // Only show for admins viewing public scope
  shouldHide: !isAdmin || homeScope !== 'everybody',
},
```

### Helper Utilities

**`extractModalsFromActions`** - Extracts modal components from actions array:

```tsx
import { extractModalsFromActions } from '@/features/home/extractModalsFromActions'

const modals = extractModalsFromActions(actions)
// Returns: { 'Delete': <DeleteModal />, 'Copy to space': <CopyModal />, ... }
```

**`ActionModalsRenderer`** - Renders all modals from the extracted object:

```tsx
import { ActionModalsRenderer } from '@/features/home/ActionModalsRenderer'

<ActionModalsRenderer modals={modals} />
```

---

## Modals

### useModal Hook

Use the `useModal` hook for modal state management:

```tsx
import { useModal } from '@/features/modal/useModal'

export interface UseModal {
  isShown: boolean
  toggle: () => void
  setShowModal: (val: boolean) => void
}

const { isShown, toggle, setShowModal } = useModal()
```

### ModalNext Component

Use the `ModalNext` component with its subcomponents for consistent modal structure:

```tsx
import { ModalNext, ModalHeaderTop } from '@/features/modal/ModalNext'
import { ModalScroll, Footer, ButtonRow, StyledForm } from '@/features/modal/styles'
```

**Modal Structure:**

```
┌─────────────────────────────────────┐
│  ModalHeaderTop (header + close)    │
├─────────────────────────────────────┤
│                                     │
│  ModalScroll (scrollable content)   │
│                                     │
├─────────────────────────────────────┤
│  Footer (action buttons)            │
└─────────────────────────────────────┘
```

**Subcomponents:**

| Component | Purpose |
|-----------|---------|
| `ModalNext` | Main modal wrapper with animation and backdrop |
| `ModalHeaderTop` | Header with title and close button |
| `ModalScroll` | Scrollable content area with max-height |
| `StyledModalScroll` | ModalScroll with left padding |
| `Footer` | Bottom section for action buttons |
| `ButtonRow` | Flex container for buttons |
| `StyledForm` | Form styled for modal content |

### Basic Modal Example

```tsx
import { useModal } from '@/features/modal/useModal'
import { ModalNext, ModalHeaderTop } from '@/features/modal/ModalNext'
import { ModalScroll, Footer, ButtonRow } from '@/features/modal/styles'
import { Button } from '@/components/Button'

export function useConfirmModal() {
  const { isShown, setShowModal } = useModal()

  const handleClose = () => setShowModal(false)

  const modalComp = (
    <ModalNext
      id="confirm-modal"
      data-testid="modal-confirm"
      isShown={isShown}
      hide={handleClose}
      variant="small"  // 'small' | 'medium' | 'large'
    >
      <ModalHeaderTop headerText="Confirm Action" hide={handleClose} />
      <ModalScroll>
        <div style={{ padding: '1rem' }}>
          Are you sure you want to proceed?
        </div>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button data-variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )

  return { modalComp, setShowModal, isShown }
}
```

### Modal with Form

For modals containing forms, use `StyledModalScroll` and `StyledForm`:

```tsx
import { ModalNext, ModalHeaderTop } from '@/features/modal/ModalNext'
import { Footer, StyledModalScroll, StyledForm } from '@/features/modal/styles'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

export function useCreateItemModal({ onSuccess }) {
  const { isShown, setShowModal } = useModal()
  const mutation = useCreateItemMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { name: '', description: '' },
  })

  const handleClose = () => {
    reset()
    setShowModal(false)
  }

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data)
    onSuccess?.()
    handleClose()
  }

  const modalComp = (
    <ModalNext
      id="create-item-modal"
      data-testid="modal-create-item"
      isShown={isShown}
      hide={handleClose}
      variant="medium"
    >
      <ModalHeaderTop headerText="Create Item" hide={handleClose} />
      <StyledModalScroll>
        <StyledForm id="create-item-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup label="Name" required>
            <InputText {...register('name')} disabled={isSubmitting} />
            <ErrorMessage errors={errors} name="name" 
              render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup label="Description">
            <InputTextArea {...register('description')} disabled={isSubmitting} />
          </FieldGroup>
        </StyledForm>
      </StyledModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            data-variant="primary"
            type="submit"
            form="create-item-form"
            disabled={mutation.isPending}
          >
            Create
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )

  return { modalComp, setShowModal, isShown }
}
```

### Modal Hook Pattern

The standard pattern for feature modals returns `modalComp`, `setShowModal`, and `isShown`:

```tsx
// Definition
export function useDeleteItemModal({ selected, onSuccess }) {
  const { isShown, setShowModal } = useModal()
  const mutation = useDeleteMutation()

  const handleDelete = async () => {
    await mutation.mutateAsync(selected.id)
    onSuccess?.()
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="delete-item-modal"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="small"
    >
      <ModalHeaderTop headerText="Delete Item" hide={() => setShowModal(false)} />
      <ModalScroll>
        <div style={{ padding: '1rem' }}>
          Are you sure you want to delete <b>{selected.name}</b>?
        </div>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="warning" onClick={handleDelete}>
            Delete
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )

  return { modalComp, setShowModal, isShown }
}

// Usage
const MyList = () => {
  const [selectedItem, setSelectedItem] = useState(null)
  const { modalComp, setShowModal } = useDeleteItemModal({
    selected: selectedItem,
    onSuccess: () => refetch(),
  })

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  return (
    <>
      <Button onClick={() => handleDeleteClick(item)}>Delete</Button>
      {modalComp}
    </>
  )
}
```

### ModalNext Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for the modal |
| `isShown` | `boolean` | Controls modal visibility |
| `hide` | `() => void` | Function to close the modal |
| `headerText` | `string` | Optional header text (also used for aria-label) |
| `variant` | `'small' \| 'medium' \| 'large'` | Modal width variant |
| `blur` | `boolean` | Enable backdrop blur effect |

### ModalHeaderTop Props

| Prop | Type | Description |
|------|------|-------------|
| `headerText` | `ReactNode` | Title displayed in the header |
| `hide` | `() => void` | Close button handler |
| `disableClose` | `boolean` | Hide the close button |

---

## Icons

### Lucide React

Use Lucide icons for general UI icons:

```tsx
import { Search, ChevronDown, X, Check, AlertTriangle } from 'lucide-react'

export const MyComponent = () => (
  <Button>
    <Search size={16} />
    Search
  </Button>
)
```

Browse available icons at: https://lucide.dev/icons/

### Icon Sizing

Standard icon sizes:
- Small: `size={14}` or `size={16}`
- Medium: `size={20}`
- Large: `size={24}`

---

## Accessibility

### Base UI Components

Use Base UI for accessible primitives. These are unstyled components that handle accessibility concerns:

```tsx
import { Select } from '@base-ui/react/select'

export const MySelect = ({ options, value, onChange }) => (
  <Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger className={styles.trigger}>
      <Select.Value />
      <Select.Icon>
        <ChevronDown size={16} />
      </Select.Icon>
    </Select.Trigger>
    
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup className={styles.popup}>
          <Select.List>
            {options.map((option) => (
              <Select.Item key={option.value} value={option}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={12} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
)
```

Reference: https://base-ui.com/llms.txt

### Accessibility Patterns

- Use semantic HTML elements (`button`, `nav`, `main`, `article`)
- Provide `aria-label` for icon-only buttons
- Use `aria-disabled` instead of `disabled` for better screen reader support
- Ensure keyboard navigation works (`tabIndex`, `onKeyDown`)
- Add `role` attributes when semantic HTML isn't sufficient

```tsx
// Icon button with aria-label
<Button aria-label="Close dialog">
  <X size={16} />
</Button>

// Clickable div with proper accessibility
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
>
  Click me
</div>
```

---

## Drag and Drop

### @dnd-kit Setup

Use @dnd-kit for drag and drop functionality:

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

export const SortableList = ({ items, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Table Drag and Drop

See `src/components/Table/DnD.tsx` for table-specific drag and drop patterns with custom sensors.

---

## Rich Text Editing

### Lexical Editor

The Lexical editor is used for data portal page editing. Configuration is in `src/features/lexi/`:

```tsx
import { LexiContext } from '@/features/lexi'

export const PageEditor = ({ initialState, onChange }) => (
  <LexiContext editorState={initialState}>
    <EditorContainer onChange={onChange} />
  </LexiContext>
)
```

Key components:
- `LexiContext` - Provides editor configuration
- `PlaygroundNodes` - Custom node types
- `PlaygroundEditorTheme` - Editor styling

---

## Testing

### Vitest Configuration

Tests run with Vitest in browser mode using Playwright:

```bash
pnpm test        # Watch mode
pnpm test:run    # Single run
pnpm test:ui     # With Vitest UI
```

### Writing Unit Tests

```tsx
// MyComponent.test.tsx
import { render } from '@/test/test-utils'

test('renders correctly', async () => {
  const screen = render(<MyComponent title="Hello" />)
  await expect.element(screen.getByText('Hello')).toBeInTheDocument()
})

test('handles click', async () => {
  const handleClick = vi.fn()
  const screen = render(<MyComponent onClick={handleClick} />)
  
  await screen.getByRole('button').click()
  expect(handleClick).toHaveBeenCalled()
})
```

### Test Utilities

Use the custom render function from `src/test/test-utils.tsx` which includes all necessary providers:

```tsx
import { render } from '@/test/test-utils'

// Render with route
const screen = render(<MyComponent />, { route: '/my-page' })
```

### E2E Tests with Playwright

E2E tests are in `e2e/tests/`:

```bash
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # With Playwright UI
pnpm test:e2e:headed  # With browser visible
```

```tsx
// e2e/tests/my-feature.spec.ts
import { test, expect } from 'playwright/test'

test('user can create item', async ({ page }) => {
  await page.goto('/items')
  await page.getByRole('button', { name: 'Create' }).click()
  await page.getByLabel('Name').fill('New Item')
  await page.getByRole('button', { name: 'Submit' }).click()
  
  await expect(page.getByText('New Item')).toBeVisible()
})
```

---

## Mocking

### MSW Setup

MSW handlers are in `src/mocks/handlers/`:

```tsx
// src/mocks/handlers/items.handlers.ts
import { http, HttpResponse } from 'msw'

export const itemsHandlers = [
  http.get('/api/v2/items', () => {
    return HttpResponse.json({
      data: [{ id: 1, name: 'Item 1' }],
      meta: { currentPage: 1, totalPages: 1 },
    })
  }),
  
  http.post('/api/v2/items', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 2, ...body })
  }),
]
```

Register handlers in `src/mocks/handlers.ts`:

```tsx
import { itemsHandlers } from './handlers/items.handlers'

export const handlers = [
  ...itemsHandlers,
  // ... other handlers
]
```

### Enabling MSW in Development

```bash
ENABLE_DEV_MSW=true pnpm run dev
```

---

## Storybook

### Configuration

Storybook runs on port 6006:

```bash
pnpm storybook
```

### Writing Stories

```tsx
// Button.stories.tsx
import { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '.'
import { StorybookProviders } from '@/stories/StorybookProviders'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    'data-variant': 'primary',
    children: 'Primary Button',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Search size={16} />
        Search
      </>
    ),
  },
}
```

---

## Error Handling

### Toast Notifications

Use the toast helpers for user feedback:

```tsx
import { toastSuccess, toastError, toastWarning } from '@/components/NotificationCenter/ToastHelper'

// Success
toastSuccess('Item created successfully')

// Error
toastError('Failed to create item')

// Error with no auto-close
toastError('Critical error occurred', { autoClose: false })

// Warning
toastWarning('Please review your input')
```

### Error Boundaries

Use the ErrorBoundary component for catching rendering errors:

```tsx
import { ErrorBoundary } from '@/utils/ErrorBoundry'

<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

### API Error Handling

Handle API errors in mutations:

```tsx
const mutation = useMutation({
  mutationFn: createItem,
  onError: (error: AxiosError<ApiErrorResponse>) => {
    const errorMessage = error.response?.data?.error?.message
    if (errorMessage) {
      toastError(errorMessage)
    } else {
      toastError('An unexpected error occurred')
    }
  },
})
```

---

## Naming Conventions

### Files and Folders

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `UserList.tsx` |
| Hooks | camelCase with `use` prefix | `useModal.ts`, `useFetchUser.ts` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |
| Types | camelCase or PascalCase | `user.ts`, `discussion.types.ts` |
| CSS Modules | PascalCase matching component | `Button.module.css` |
| Tests | Match source with `.test.tsx` | `Button.test.tsx` |
| Stories | Match source with `.stories.tsx` | `Button.stories.tsx` |

### Variables and Functions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UserProfile`, `DataTable` |
| Hooks | camelCase with `use` prefix | `useModal`, `useFetchUsers` |
| Event handlers | camelCase with `handle` prefix | `handleClick`, `handleSubmit` |
| Boolean variables | camelCase with `is`/`has`/`can` prefix | `isLoading`, `hasError` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL` |

### Query Keys

Use arrays with descriptive structure:

```tsx
// Simple
['users']
['discussions']

// With ID
['user', { id: userId }]
['discussion', { id: discussionId }]

// With filters
['users', { page, filters }]
```

---

## File Organization Summary

```
src/
├── api/                    # Shared API layer
│   ├── mutations/          # Mutation hooks
│   ├── queries/            # Query hooks
│   └── types.ts            # API types
├── components/             # Shared UI components
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.module.css
│   └── Table/
│       ├── index.tsx
│       └── components/
├── features/               # Feature modules
│   └── discussions/
│       ├── api.ts          # API functions
│       ├── discussions.types.ts
│       ├── DiscussionShow.tsx
│       ├── form/
│       └── useDiscussionColumns.tsx
├── hooks/                  # Shared hooks
├── mocks/                  # MSW handlers
├── routes/                 # Route definitions
│   ├── root.tsx            # Main router config
│   ├── home/
│   │   └── index.tsx       # Home routes (extends shared)
│   ├── spaces/
│   │   └── index.tsx       # Spaces routes (extends shared)
│   ├── shared.tsx          # Common routes (files, apps, etc.)
│   └── resource-pages.tsx  # Unified page components
├── styles/                 # Global styles
├── test/                   # Test utilities
├── types/                  # Shared types
└── utils/                  # Utility functions
```

---

## Quick Reference

### Common Imports

```tsx
// React
import React, { useState, useEffect, useEffectEvent } from 'react'

// Routing
import { Link, useNavigate, useParams } from 'react-router'

// Data Fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Forms
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

// Table
import Table from '@/components/Table'
import { ColumnDef } from '@tanstack/react-table'

// Icons
import { Search, ChevronDown, X } from 'lucide-react'

// Utilities
import { cn } from '@/utils/cn'
```

### Common Component Patterns

```tsx
// Feature component with data fetching
export const FeaturePage = () => {
  const { data, isLoading, error } = useFetchItemsQuery()
  
  if (isLoading) return <Loader />
  if (error) return <Error message={error.message} />
  
  return <ItemList items={data} />
}

// Form with mutation
export const CreateForm = ({ onSuccess }) => {
  const mutation = useCreateItemMutation()
  const form = useForm({ resolver: yupResolver(schema) })
  
  const onSubmit = async (data) => {
    await mutation.mutateAsync(data)
    onSuccess()
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  )
}
```

### Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:msw          # Start with MSW mocking

# Testing
pnpm test             # Run unit tests (watch)
pnpm test:run         # Run unit tests (single run)
pnpm test:e2e         # Run E2E tests

# Building
pnpm build            # Production build
pnpm build:dev        # Development build

# Other
pnpm storybook        # Start Storybook
pnpm lint             # Run Biome
pnpm tsc              # TypeScript check
```

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [React Router](https://reactrouter.com/)
- [react-hook-form](https://react-hook-form.com/)
- [Base UI](https://base-ui.com/)
- [Lucide Icons](https://lucide.dev/icons/)
- [shadcn/ui](https://ui.shadcn.com/) (for design inspiration)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)
