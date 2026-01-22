# Phase 1: Foundation - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up project infrastructure — Next.js app, Supabase database, Vercel deployment pipeline. Basic page structure with routes for home, archive, and admin.

</domain>

<decisions>
## Implementation Decisions

### Project structure
- Claude's discretion on folder organization
- Claude's discretion on component organization style
- Claude's discretion on types location
- Claude's discretion on file naming convention

### Database schema
- Trends should store additional fields: image/thumbnail URL, description text, external links
- Trends can have multiple categories (e.g., "burgundy blazer" = color + clothing)
- History retention: 90 days detailed daily snapshots, then monthly aggregates
- Claude's discretion on category storage approach (enum vs free text)

### Deployment setup
- Two environments: Production + Vercel Preview deploys
- Custom domain: Later (use Vercel subdomain for now)
- Environment variables: Managed in Vercel dashboard only
- Claude's discretion on branch strategy

### Page layouts
- Minimal header: Logo + nav links only, bubbles take full focus
- Navigation: Header nav links (Home | Archive | Admin)
- Color scheme: Light mode default
- Footer: Standard (disclosure, copyright, about link, contact)

### Claude's Discretion
- Folder organization and file structure
- Component organization (feature folders vs flat)
- TypeScript types location (central vs co-located)
- File naming convention (kebab-case vs PascalCase)
- Category storage implementation
- Branch deployment strategy

</decisions>

<specifics>
## Specific Ideas

- Bubbles should take full visual focus — header is just navigation
- Light mode default gives a cleaner, more fashion-forward feel
- Standard footer for affiliate compliance and credibility

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-01-22*
