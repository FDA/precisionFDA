---
name: modal-next-dialog-migration
description: "Use when migrating a packages/client modal from ModalNext to the Base UI Dialog, replacing modal styled-components with Tailwind, adding or updating its Storybook story, or completing an item in the ModalNext migration inventory. Also use for requests such as migrate the next modal, convert a legacy modal, or finish a modal migration batch."
---

# Migrate ModalNext to Dialog

Migrate one coherent modal or closely related batch at a time. Treat the [migration inventory](../../../.agents/plans/modal-next-migration.plan.md) as the source of truth for scope, ordering, special cases, and completion status.

## Start With Evidence

1. Read the inventory entry and the relevant constraints in the migration plan.
2. Read the modal, its owning hook or component, nearby tests, and any existing story that renders it directly or indirectly.
3. Read `packages/client/src/components/ui/dialog.tsx` and one nearby completed migration. Prefer `packages/client/src/features/actionModals/useForkAppToModal.tsx` for the controlled hook pattern.
4. Search the modal and its immediate dependencies for:
   - `ModalNext`, `ModalHeaderTop`, and floating portal host APIs;
   - `styled-components`, `modal.styles`, and colocated style modules;
   - existing shared controls under `packages/client/src/components/ui/**`;
   - stable IDs, test IDs, form associations, close side effects, pending states, and validation behavior.
5. State one local behavior-preservation hypothesis and one focused check that could disprove it before editing.

Do not broaden the migration into unrelated cleanup. Preserve the hook's public return shape unless changing it is required for the dialog behavior.

## Implement the Migration

Replace the legacy modal with the controlled shared primitives:

```tsx
<Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
  <DialogContent id="modal-id" variant="medium">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div>{/* body */}</div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Use imports from `@/components/ui/dialog` and prefer existing components from `@/components/ui/**` for buttons, inputs, labels, selects, alerts, feedback, and other controls. Create a feature-local component only for genuinely domain-specific behavior that no shared primitive covers.

Preserve:

- `id` and `data-testid` values;
- dialog size and responsive behavior;
- form IDs, submit-button `form` associations, validation, and error display;
- loading, pending, and disabled states;
- close-button, cancel, escape, backdrop, success, and failure side effects;
- focus behavior and accessible title and description semantics.

Use `DialogTitle` rather than carrying forward `headerText`. Keep `useModal` when it remains useful as state management.

## Replace Styling in the Same Change

Remove the migrated modal's imports from `styled-components`, `modal.styles.ts`, and modal-specific styled wrappers. Replace them with semantic elements, shared Dialog structure, and Tailwind classes.

Use Tailwind for spacing, scrolling, sizing, alignment, overflow, responsive layout, and state styling. Use the existing `cn` helper for conditional classes. Do not add styled-components or CSS Modules as an intermediate step.

Preserve scroll containment and responsive dimensions, especially for long forms and lists. Do not remove a shared legacy style export until a separate zero-reference search proves that no other consumer uses it.

## Add Storybook Coverage

Storybook coverage is required for every migrated dialog.

1. Find a colocated `*.stories.tsx` or a differently named story that renders the owning component or hook.
2. Update the existing story, or create a colocated story using the repository's `Meta` and `StoryObj` conventions.
3. Give each dialog its own Storybook component group, such as `Modals/Apps/Export To`, rather than grouping unrelated dialogs under a generic title such as `Modals/Apps`. Within that group, use concise state names such as `Default`, `Validation`, `Pending`, and `Error` so the sidebar communicates one dialog with multiple representative states.
4. Use args and controls for freely configurable inputs and variants, such as resource type, selection mode, content, or feature flags. Keep materially different states and workflows as separate stories when they need independent review, interaction coverage, or visual regression coverage. Do not create a separate story for every combination of controls.
5. For hook-based dialogs, add a small story-only harness that calls the hook and renders `modalComp`.
6. Reuse `StorybookProviders`, local fixtures, and feature-level MSW handlers. Do not add production switches for Storybook.
7. Use deterministic representative data and initialize the dialog open directly in the story harness. For hook-based dialogs, pass the hook's open setter to `useOpenModalInStory` from `@/stories/useOpenModalInStory`. Do not repeat the opening effect locally or use a `play` function merely to click a trigger and establish the initial visual state.
8. Add separate stories for materially different states when relevant, such as populated, empty, validation error, pending, destructive, upload conflict, or non-dismissible states.
9. Use `play` functions only for meaningful behavior beyond establishing initial state, such as submit, cancel, selection, keyboard behavior, disabled actions, dismissal policy, and focus return. Keep a trigger only when reopening or focus return is itself under test.
10. Leave the dialog open when a story's play function finishes so its final state remains inspectable. If dismissal behavior is exercised, reopen the dialog before the interaction completes.

Do not depend on live services, current user data, or generated Storybook output.

## Handle Special Cases Explicitly

### Floating Select Portals

For `useRecoverSpaceLeadModal`, `useBulkChangeMemberRolesModal`, and `useChangeMemberRoleModal`, do not remove the legacy floating host until one of the plan's supported approaches is implemented and verified. Test pointer selection, keyboard selection, focus return, escape behavior, and backdrop clicks while the select is open.

### Expiring Session

For `ExpiringSessionModal`, keep the dialog controlled, hide the close button, and ignore dismissal requests while the warning is active. Make an explicit, documented choice about preserving the legacy 6px backdrop blur or accepting the shared overlay. Verify escape and backdrop interactions cannot dismiss it.

### Shared Confirmations

When migrating `features/modal/useConfirm`, rename its legacy child component to avoid ambiguity with the shared `Dialog` import and preserve the injectable `DialogComponent` contract unless all custom implementations are removed together.

### Portals

Do not assume Base UI's portal mounts under `#modal-root`. Tests and stories must query and interact through accessible behavior rather than relying on the legacy portal container.

## Validate Before Marking Complete

After the first substantive edit, immediately run the narrowest existing test or behavior check for the touched modal. Fix failures in the same slice and rerun that check before expanding scope.

Before marking an inventory item complete:

1. Run targeted component or hook tests when they exist.
2. From `packages/client`, run `pnpm tsc`.
3. Run Biome lint and format checks for the touched source and story files, using the package scripts or equivalent focused Biome commands.
4. Build Storybook with `pnpm build-storybook`, or run the relevant story and inspect its representative states and interactions.
5. Confirm the migrated files have no imports from `ModalNext`, `ModalHeaderTop`, `styled-components`, or `modal.styles`.
6. Confirm shared `src/components/ui/**` primitives were reused where suitable.
7. Exercise open, close, cancel, escape, backdrop, submit, pending, validation-error, and focus-return behavior as applicable.
8. For nested selects, verify mouse and keyboard interaction. For long content, inspect relevant responsive sizes and scrolling.
9. Mark the corresponding plan checkbox complete only after the implementation, styling conversion, Storybook coverage, and validations all pass.

For a final batch, also run the completion searches from the migration plan. Remove `ModalNext.tsx` and legacy style exports only after zero-reference searches. Update `docs/guides/frontend.md` to Dialog-first, Tailwind-first guidance when completing the overall migration.

## Completion Report

Report:

- migrated modal files and preserved behavior;
- shared UI components reused and legacy styling removed;
- Storybook stories added or updated, including represented states;
- tests, typecheck, Biome, and Storybook checks run with results;
- unresolved special-case decisions or unrelated pre-existing failures;
- inventory checkbox updates.