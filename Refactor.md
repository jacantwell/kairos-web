# Next.js project refactoring strategy

**human** (Sep 30, 2025, 11:06 AM)

Hey i am working on my website. The codebase has got quite large and complex and i think it is time to tackle some of the tech debt. It is a nextJS project using the app router pattern. I have attatched all of the current component files and want you to read through them and come up with a clean and effcient refactoring plan. Don't write any code but you can define a new repo structure.

**assistant** (Sep 30, 2025, 11:07 AM)

{"start_timestamp":"2025-09-30T10:06:57.656427+00:00","stop_timestamp":"2025-09-30T10:07:16.038500+00:00","type":"thinking","thinking":"Let me analyze this Next.js codebase to identify tech debt and create a comprehensive refactoring plan. I'll examine:\n\n1. Code organization and structure\n2. Component architecture\n3. State management patterns\n4. API integration approach\n5. Type safety and consistency\n6. Reusability and modularity\n7. Performance considerations\n\nLet me go through the files:\n\n**Hooks Analysis:**\n- `use-active-journey.ts` - Manages active journey state\n- `use-api.ts` - Simple API client wrapper\n- `use-auth.ts` - Auth guard with redirect\n- `use-journey-markers.ts` - CRUD for markers\n- `use-journeys.ts` - Orchestrates multiple hooks (composition pattern)\n- `use-user-journeys.ts` - User's journeys management\n\nIssues I see:\n1. The `useJourneys` hook is doing too much - it's composing 5 different hooks\n2. Local state management is scattered (useState in components + custom hooks)\n3. No clear data fetching/caching strategy\n4. Lots of manual state synchronization\n\n**Components Analysis:**\n\n**Journey Components:**\n- Multiple modal components with similar patterns\n- Map component is quite large and handles multiple responsibilities\n- Journey card components have inline styles and complex logic\n- Utils folder with route processing logic\n\nIssues:\n1. Modal components share a lot of boilerplate (overlay, close button, form handling)\n2. Map component handles: rendering, state, modals, markers, routes - violates SRP\n3. Form handling is repetitive across modals\n4. No form validation library\n5. Styling is mixed (Tailwind utility classes + inline styles)\n6. ProcessedMarker extends Marker but adds display-specific fields - mixing concerns\n\n**UI Components:**\n- Loading components are well organized\n- Logo component is fine\n- Navigation has some hardcoded logic\n\n**General Issues:**\n1. No error boundary components\n2. No centralized error handling\n\n\n3. Modal management is ad-hoc (each component manages its own modal state)\n4. API calls scattered throughout components\n5. No query/mutation abstraction (could use React Query)\n6. Type imports from generated API client mixed with local types\n7. No clear separation between business logic and presentation\n8. Commented out code in several places\n9. Console.logs in production code\n10. No consistent naming conventions (some use \"Point\", some \"Marker\")\n11. Journey route processing logic in utils but tightly coupled to components\n\nI'll focus on critical architectural improvements. The state management needs a complete overhaul, with centralized data fetching using React Query. I'll recommend extracting shared modal logic into reusable components, implementing a consistent type system, and creating clear boundaries between business logic and UI components. Error handling and type safety will be key priorities in the refactoring strategy.","summaries":[{"summary":"Thinking about restructuring NextJS project to reduce technical complexity"},{"summary":"Scrutinizing tech debt and crafting refactoring strategy"},{"summary":"Excavating tech debt and strategizing comprehensive refactoring plan"},{"summary":"Dissected Next.js codebase, unearthed tech debt, crafted refactoring strategy."}],"cut_off":false}

# Refactoring Plan for Kairos Next.js Application

After reviewing your codebase, I've identified several areas for improvement. Here's a comprehensive refactoring plan that will improve maintainability, scalability, and developer experience.

## 🎯 Key Issues Identified

1. **Over-composition in hooks** - `useJourneys` combines 5 hooks leading to complex dependencies
2. **Modal management chaos** - Each component manages modal state independently
3. **Map component doing too much** - Handles rendering, state, multiple modals, markers, and routes
4. **Repetitive form logic** - Similar patterns across all modal components
5. **Mixed concerns** - Display logic mixed with data fetching and business logic
6. **No data caching strategy** - Manual state synchronization everywhere
7. **Type inconsistencies** - Mixing API types with UI types (ProcessedMarker extends Marker)
8. **Styling inconsistencies** - Mix of Tailwind utilities and inline styles

## 📁 Proposed Repository Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (protected)/
│   │   ├── home/
│   │   ├── profile/
│   │   └── layout.tsx
│   └── layout.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── queries/
│   │   │   ├── journeys.ts
│   │   │   ├── markers.ts
│   │   │   └── users.ts
│   │   └── mutations/
│   │       ├── journeys.ts
│   │       └── markers.ts
│   │
│   ├── hooks/
│   │   ├── api/
│   │   │   ├── use-journeys-query.ts
│   │   │   ├── use-markers-query.ts
│   │   │   ├── use-journey-mutations.ts
│   │   │   └── use-marker-mutations.ts
│   │   ├── ui/
│   │   │   ├── use-modal.ts
│   │   │   ├── use-disclosure.ts
│   │   │   └── use-toast.ts
│   │   └── features/
│   │       ├── use-active-journey.ts
│   │       └── use-map-state.ts
│   │
│   ├── context/
│   │   ├── session-provider.tsx
│   │   ├── modal-provider.tsx
│   │   └── query-provider.tsx
│   │
│   ├── types/
│   │   ├── api.ts (re-exports from generated client)
│   │   ├── ui.ts (UI-specific types)
│   │   └── domain.ts (business logic types)
│   │
│   ├── utils/
│   │   ├── journey/
│   │   │   ├── route-processor.ts
│   │   │   ├── marker-sorter.ts
│   │   │   └── color-generator.ts
│   │   ├── date.ts
│   │   └── validation.ts
│   │
│   └── config/
│       ├── constants.ts
│       └── map-config.ts
│
├── features/
│   ├── journey/
│   │   ├── components/
│   │   │   ├── journey-card/
│   │   │   │   ├── journey-card.tsx
│   │   │   │   ├── journey-card-menu.tsx
│   │   │   │   └── journey-card-actions.tsx
│   │   │   ├── journey-list/
│   │   │   │   ├── journey-list.tsx
│   │   │   │   ├── journey-filters.tsx
│   │   │   │   └── journey-sort.tsx
│   │   │   ├── journey-banner/
│   │   │   │   └── active-journey-banner.tsx
│   │   │   └── journey-forms/
│   │   │       ├── create-journey-form.tsx
│   │   │       └── journey-form-fields.tsx
│   │   ├── hooks/
│   │   │   └── use-journey-operations.ts
│   │   └── types/
│   │       └── journey.types.ts
│   │
│   ├── map/
│   │   ├── components/
│   │   │   ├── map-container/
│   │   │   │   ├── map-container.tsx
│   │   │   │   └── map-controls.tsx
│   │   │   ├── markers/
│   │   │   │   ├── marker.tsx
│   │   │   │   ├── marker-cluster.tsx
│   │   │   │   └── marker-popup.tsx
│   │   │   ├── routes/
│   │   │   │   └── route-layer.tsx
│   │   │   └── overlays/
│   │   │       ├── add-point-mode.tsx
│   │   │       └── map-legend.tsx
│   │   ├── hooks/
│   │   │   ├── use-map-interactions.ts
│   │   │   └── use-map-bounds.ts
│   │   └── utils/
│   │       └── geo-utils.ts
│   │
│   ├── markers/
│   │   ├── components/
│   │   │   ├── marker-modals/
│   │   │   │   ├── marker-detail-modal.tsx
│   │   │   │   ├── add-marker-modal.tsx
│   │   │   │   └── edit-marker-modal.tsx
│   │   │   └── marker-forms/
│   │   │       ├── marker-form.tsx
│   │   │       └── marker-form-fields.tsx
│   │   ├── hooks/
│   │   │   └── use-marker-operations.ts
│   │   └── types/
│   │       └── marker.types.ts
│   │
│   └── auth/
│       ├── components/
│       │   └── auth-guard.tsx
│       └── hooks/
│           └── use-require-auth.ts
│
├── components/
│   ├── ui/
│   │   ├── button/
│   │   │   └── button.tsx
│   │   ├── modal/
│   │   │   ├── modal.tsx
│   │   │   ├── modal-header.tsx
│   │   │   ├── modal-body.tsx
│   │   │   └── modal-footer.tsx
│   │   ├── form/
│   │   │   ├── form-field.tsx
│   │   │   ├── form-input.tsx
│   │   │   ├── form-textarea.tsx
│   │   │   ├── form-select.tsx
│   │   │   └── form-error.tsx
│   │   ├── loading/
│   │   │   ├── loading-screen.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── loading-dots.tsx
│   │   │   └── loading-skeleton.tsx
│   │   ├── badge/
│   │   │   └── badge.tsx
│   │   └── dropdown/
│   │       └── dropdown-menu.tsx
│   │
│   └── layout/
│       ├── navigation.tsx
│       ├── page-header.tsx
│       └── user-menu.tsx
│
└── styles/
    └── globals.css
```

## 🔄 Refactoring Strategy

### Phase 1: Foundation (Week 1)

**1.1 Introduce React Query for Data Management**
- Replace manual state management in hooks with React Query
- Create query and mutation factories
- Implement proper caching and invalidation
- Benefits: Automatic loading states, error handling, caching, optimistic updates

**1.2 Create Reusable Modal System**
- Build a `ModalProvider` context for centralized modal management
- Create base `Modal` component with composition pattern
- Extract common modal patterns (confirmation, form modals)
- Replace all 5 modal implementations with new system

**1.3 Establish Type System**
- Separate API types from UI types from domain types
- Create adapter functions to transform between layers
- Remove `ProcessedMarker extends Marker` anti-pattern
- Define clear interfaces for each domain

### Phase 2: Component Decomposition (Week 2)

**2.1 Refactor Map Component**
- Split into: MapContainer, MapControls, MarkerLayer, RouteLayer
- Move marker click handling to dedicated hook
- Extract map state management to `useMapState` hook
- Separate coordinate picking logic into dedicated component

**2.2 Standardize Form Handling**
- Integrate React Hook Form for all forms
- Create reusable form field components
- Implement Zod for validation schemas
- Build form submission wrapper with error handling

**2.3 Journey Component Cleanup**
- Extract dropdown menu logic to reusable component
- Separate card presentation from business logic
- Create dedicated hooks for journey operations
- Simplify Journey List filters and sorting

### Phase 3: Business Logic Layer (Week 3)

**3.1 Create Service Layer**
- Move business logic out of hooks
- Create journey service, marker service
- Implement proper error handling and logging
- Add retry logic for failed requests

**3.2 Simplify Hook Composition**
- Remove `useJourneys` mega-hook
- Create focused, single-responsibility hooks
- Use React Query's built-in composition
- Document hook dependencies clearly

**3.3 Route Processing**
- Move route processing to dedicated service
- Implement memoization for expensive calculations
- Create testable pure functions
- Add route optimization algorithms

### Phase 4: Polish & Performance (Week 4)

**4.1 Error Handling**
- Create error boundary components
- Implement toast notification system
- Add retry mechanisms
- Create user-friendly error messages

**4.2 Performance Optimization**
- Implement marker clustering for large datasets
- Add virtualization for long lists
- Optimize re-renders with proper memoization
- Lazy load modals and heavy components

**4.3 Code Quality**
- Remove all console.logs
- Remove commented code
- Add JSDoc comments to complex functions
- Implement consistent naming conventions

## 🎨 Design Patterns to Implement

### 1. **Compound Component Pattern** (for Modal, Card, Form)
```
<Modal>
  <Modal.Header>...</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

### 2. **Custom Hook Pattern** (single responsibility)
```
useJourneyQuery() // just data fetching
useJourneyMutations() // just mutations
useActiveJourney() // just active state logic
```

### 3. **Adapter Pattern** (type transformation)
```
API Response → Domain Model → UI Model
```

### 4. **Service Layer Pattern** (business logic)
```
Component → Hook → Service → API
```

### 5. **Provider Pattern** (global state)
```
QueryProvider → ModalProvider → SessionProvider
```

## 🎯 Success Metrics

- **Reduced Lines of Code**: Target 30% reduction through reusability
- **Type Safety**: 100% TypeScript coverage with no `any`
- **Performance**: Map renders under 100ms with 100+ markers
- **Bundle Size**: Reduce by 20% through code splitting
- **Developer Experience**: New modal in 10 lines instead of 100

## 🚨 Quick Wins (Can Do Now)

1. **Extract Modal Boilerplate** - Create base modal component immediately
2. **Add React Hook Form** - Start with one form as proof of concept
3. **Remove Console Logs** - Quick cleanup pass
4. **Create Constants File** - Extract magic strings/numbers
5. **Split Map Component** - Just separate into 3-4 components

## 📝 Notes

- Keep existing functionality working during refactor (feature flags if needed)
- Write tests for critical business logic as you refactor
- Consider using Storybook for component documentation
- Set up ESLint rules to enforce new patterns
- Create ADR (Architecture Decision Records) for major decisions

This plan prioritizes **developer experience**, **maintainability**, and **scalability** while being pragmatic about the effort required. Start with Phase 1 as it provides the foundation for everything else.