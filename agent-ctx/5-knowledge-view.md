# Task 5 — Knowledge Base Management Component

**Agent**: main
**Status**: ✅ Complete
**File**: `src/components/dashboard/knowledge/KnowledgeView.tsx`

## Summary
Created a full-featured Knowledge Base management component exported as `default function KnowledgeView()`.

## Key deliverables
1. **Header** with "Knowledge Base" title + "Add Document" button
2. **AddDocumentDialog** — segmented toggle (Paste Text / Upload File), title input, content textarea or drag-and-drop file zone, source dropdown, POST to `/api/knowledge`
3. **Document list** — responsive 3-column grid of cards with title, file type badge, size, source badge, 150-char preview, relative date, active/inactive Switch, edit/delete/view actions
4. **ViewDocumentDialog** — read-only full content view
5. **EditDocumentDialog** — editable title + content, PUT to `/api/knowledge/[id]`
6. **Empty state** — animated BookOpen icon + CTA
7. **Loading skeletons** matching card layout
8. **Framer Motion** staggered entrance, hover scale, AnimatePresence exit

## API calls
- `GET /api/knowledge` — fetch docs
- `POST /api/knowledge` — create doc
- `PUT /api/knowledge/[id]` — update title/content
- `PATCH /api/knowledge/[id]` — toggle isActive
- `DELETE /api/knowledge/[id]` — delete doc

## Style
- Teal-600 primary accent, no blue/indigo
- shadcn/ui components throughout
- ESLint clean (pre-existing error in examples/ only)
