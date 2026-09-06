# Project TODO

- [x] Convert the workbook's 17 checklist worksheets into structured checklist definitions with cadence, category, activity, status, and remarks fields.
- [x] Establish the checklist domain schema and persistence for daily/weekly/monthly/quarterly/annual runs.
- [x] Add typed server helpers and protected procedures for checklist definitions, run progress, remarks, and escalations.
- [x] Build the internal operations dashboard shell with persistent sidebar navigation and customer context.
- [x] Build the Daily Operations view with progress summary, checklist rows, status controls, remarks, and escalation capture.
- [x] Add cadence views for weekly, monthly, quarterly, and annual operational reviews.
- [x] Add resource-area grouping and filters for Compute, Storage, Network, IAM, Backup, Patch, Capacity, Security, and other workbook categories.
- [x] Add checklist search, status filtering, and overdue/open-item visibility.
- [x] Add responsive, accessible visual styling with a calm cloud-operations theme and useful empty/loading/error states.
- [x] Add Vitest coverage for checklist data and server procedures.
- [x] Verify the rendered desktop and mobile experience and resolve console/runtime issues. Desktop screenshots captured for / and /analytics; TypeScript checks, tests, and build pass.
- [x] Review TODO completion and save a stable project checkpoint for delivery.

- [x] Add a visual analytics dashboard for daily cloud operation metrics and checklist completion rates.
- [x] Add analytics navigation, cadence/date controls, KPI cards, trend chart, category performance chart, and completion breakdown.
- [x] Add Vitest coverage for analytics aggregation helpers and verify the analytics build.

- [x] Add customer inventory with customer profile, cloud accounts/subscriptions, environments, regions, service scope, criticality, contacts, assigned leads, and report recipients.
- [x] Add customer-scoped checklist assignments and enforce tenant isolation in server procedures.
- [x] Add lead validation states and approval gating so only an assigned cloud operations lead can approve a review.
- [x] Add controlled report publication with audit history and email recipient management; server-side publication queues only after lead approval and recipient validation.
- [x] Add admin screens for customer inventory, lead assignment, directory users, and publication settings.
- [x] Defer live Microsoft Entra ID SSO and Microsoft 365 email delivery until credentials and administrator consent are supplied; configuration points and setup documentation are ready for later activation.
- [x] Add tests for customer isolation, approval gates, and publication eligibility.

- [x] Implement server-backed customer inventory CRUD for accounts/subscriptions, environments, regions, service scope, criticality, contacts, assigned leads, and report recipients; replace localStorage-only customer state.
- [x] Add true customer-scoped checklist assignment models and UI, and wire checklist run read/write flows to selected customers end-to-end.
- [x] Implement persisted review approval procedures using reviewApprovals, enforce assigned-lead authorization on approval actions, and gate publication server-side.
- [x] Add dedicated admin sections for directory-user mapping and publication settings, not only customer creation fields.
- [x] Add Vitest coverage for customer-scoped checklist access, assigned-lead approval authorization, and publication eligibility rules.

- [x] Add update and archive customer inventory procedures and UI, including editable accounts, leads, recipients, and checklist assignments; remove the placeholder Edit customer action.
- [x] Add recipient-management UI and publication history/audit views for queued and delivered reports per customer.
- [x] Replace static administration settings placeholders with persisted configuration/directory-mapping models and real save/load behavior, while keeping secrets blank until supplied.
- [x] Add router/procedure tests for customer-scoped checklist access, assigned-lead approval rejection, and publication gating behavior.
- [x] Verify the main checklist page selects a customer and passes customerId through every run load/save interaction.

- [x] Add full multi-record customer inventory editing for all existing accounts and lead assignments, with add/remove/edit controls rather than only first-record editing.
- [x] Implement persisted directory-mapping data and an admin UI for mapping company directory identities to lead assignments and roles.
- [x] Add authenticated-but-unassigned lead approval rejection tests and procedure-level publication gating tests for missing approval and missing recipients.

- [x] Wire persisted directory-user mappings into customer lead assignment UI and server contracts so administrators choose mapped identities instead of relying only on free-form email entry.
- [x] Add a router-level publication test proving publication is rejected when approval exists but the customer has no active recipients configured.

- [x] Store a directory mapping ID on customer lead assignments and require that mapped identity in create/update contracts and the lead selector.
- [x] Add an isolated router test fixture for an approved review with zero active recipients and assert reviews.publish returns recipient-required.

- [x] Require directoryUserMappingId for every customer lead assignment in create/update contracts and reject free-form-only lead records.
- [x] Remove free-form bypass from the lead selector and add validation/tests for invalid or missing mapped identities.

- [x] Resolve mapped lead records from directoryUserMappingId on the server and persist their directory identity metadata.
- [x] Remove free-form lead identity inputs when mapped identities are required; use the mapped identity selector as the only assignment path.
- [x] Add router tests for omitted and invalid directoryUserMappingId values on customer create/update.

- [x] Add router tests proving customers.update rejects omitted and invalid directoryUserMappingId values, plus a valid mapped-lead success path where feasible.

- [x] Add an integration success-path test that creates a valid directory mapping and customer, updates the customer with that mapping ID, and verifies the lead identity is persisted and resolved.

- [x] Review and complete the admin customer and cloud inventory code paths without preview work.
- [x] Add deferred Microsoft Entra ID SSO configuration and callback integration points.
- [x] Add role-based authorization contracts for administrator, cloud operations lead, operator, and customer viewer roles.
- [x] Add code-level tests for role guards and Entra configuration validation.

- [x] Explicitly review the existing Customers admin page and document or improve its server-backed customer/inventory implementation.
- [x] Add a deferred Entra callback route stub wired into the server alongside configuration helpers.
- [x] Extend persisted and server-auth role contracts to support admin, lead, operator, and customer_viewer end-to-end.

- [x] Add a short code/documentation note in the Customers admin page confirming the final server-backed inventory workflow.
- [x] Integrate AppRole end-to-end in server procedure guards so admin, lead, operator, and customer_viewer permissions are distinct and enforced.
- [x] Add integration tests for lead, operator, and customer_viewer behavior across checklist access, approval actions, admin pages, and report visibility.

- [x] Define and enforce an explicit AppRole permission matrix across checklist reads/writes, review status/history, customer administration, and report visibility.
- [x] Add router tests for lead, operator, and customer_viewer checklist read/write, review history, and report visibility allow/deny outcomes.

- [x] Apply explicit Permission-based guards to checklist writes, review approval/publication, and customer administration routes.
- [x] Add exact allow/deny role tests using success-path fixtures for checklist reads/writes and report visibility.
- [x] Add a customer-administration test proving customers.manage is enforced through the shared permission matrix.

- [x] Add seeded success-path fixtures for lead, operator, and customer_viewer so checklist reads/writes and report history visibility assert true allow outcomes rather than only non-permission errors.
- [x] Add explicit customers.manage allow/deny assertions for list, create, and update procedures.

- [x] Add a seeded success-path test where an assigned operator or lead successfully saves a checklist item and asserts the persisted write result.
- [x] Add explicit customers.manage tests for create and update, covering admin allow and non-manager deny outcomes.

- [x] Define a SQL Server/SQL Server Express database boundary and connection configuration without removing the current managed database until migration is verified.
- [x] Add SQL Server-compatible schema/migration output for users, customers, inventory, checklist runs, approvals, escalations, settings, mappings, and publications.
- [x] Add a database adapter/configuration seam for MSSQL while preserving the existing application repository contracts.
- [x] Keep Microsoft Entra ID as a disabled side module with no required credentials or automatic activation.
- [x] Add code-only validation and migration documentation for SQL Server and SQL Server Express deployment.

- [x] Implement a real database-provider abstraction in server/db.ts or a repository layer so customer, checklist, review, and publication helpers can resolve through managed MySQL or MSSQL configuration.
- [x] Add provider-seam tests proving repository contracts remain stable when the MSSQL provider is selected without requiring a live external database in this environment.

- [x] Refactor core repository helpers behind a provider interface so managed MySQL and MSSQL-selected runtimes use the same customer/checklist/review/publication contracts.
- [x] Add an injectable MSSQL repository stub for tests and exercise representative customer, checklist, review, and publication operations through the provider seam.

- [x] Route customer create/update/archive, review approval/publication, settings, and directory-management writes through the shared provider contract or a provider-aware repository facade.
- [x] Add injectable repository resolution so tests can supply a fake MSSQL repository without opening a live connection.
- [x] Add an end-to-end router test proving an MSSQL-selected provider handles customer list, checklist load/save, review status, and publication history through the shared contract.

- [x] Route customer create/update/archive, review approve/publish, settings, and directory mapping procedures through provider-aware repository methods or explicitly document them as managed-database-only until MSSQL write parity is implemented.
- [x] Add a router-level test using setOperationsRepositoryForTests() that verifies customers.list, checklist.loadRun/saveItem, reviews.status, and reviews.history call the shared provider contract.

- [x] Document the current MSSQL boundary: customer and checklist/review read paths plus checklist writes use the provider seam; customer CRUD, approval/publication, settings, and directory-management writes remain managed-MySQL-only until MSSQL write parity is implemented.

- [x] Extract and normalize Sales-to-Delivery KYC, Transition, Onboarding, and Operational Readiness workbook items.
- [x] Add separate customer-scoped checklist sections for KYC, Transition, Onboarding, and Operational Readiness alongside daily operations.
- [x] Add lifecycle checklist assignment and progress persistence for the new sections.
- [x] Add navigation, section summaries, search/filtering, and lead validation support for each new section.
- [x] Add tests for the normalized lifecycle catalog and customer-scoped section behavior.

- [x] Add independent lifecycle-section assignment fields and UI so each customer can enable KYC, Transition, Onboarding, and Operational Readiness separately.
- [x] Extend lead review and publication flows to handle lifecycle-${section.id} reviews with the same approval and report gates.
- [x] Add router/integration tests covering customer-scoped lifecycle load/save authorization and lifecycle review approval behavior.

- [x] Update LeadReview to surface lifecycle-kyc, lifecycle-transition, lifecycle-onboarding, and lifecycle-operational_readiness for explicit lead approval/publication.
- [x] Add router/server tests proving lifecycle checklist runs load/save only within the correct customer scope and role permissions.
- [x] Add integration tests proving lifecycle reviews can be approved/published with recipient and assigned-lead gates.

- [x] Add lifecycle checklist allow/deny router tests for assigned lead/operator versus unassigned roles across customer-scoped load and save operations.
- [x] Add lifecycle review approve/publish integration tests for assigned-lead authorization and recipient-required gating.

- [x] Add lifecycle router tests where an assigned operator successfully loads and saves a lifecycle checklist item, while an unassigned user is denied on lifecycle save as well as load.
- [x] Add lifecycle review authorization tests proving non-assigned roles cannot approve or publish lifecycle reviews, while an assigned lead can approve the same lifecycle checklist ID.

- [x] Add a lifecycle-specific router success-path assertion for assigned-lead approval and recipient-required publication rejection using the real lead review contract.

- [x] Surface lifecycle assignment readiness in the lifecycle page and lead-review selection so unassigned lifecycle sections are clearly identified before approval.

- [x] Make Sales-to-Delivery KYC, Service Transition, Managed Services Onboarding, and Operational Readiness visibly separate top-level sections in the main navigation and customer workspace.
- [x] Show lifecycle assignment state and section counts on the customer inventory page and lifecycle landing view.
- [x] Add lifecycle report templates for internal lead review and customer-ready publication.
- [x] Add phase-level due dates and assigned owners for lifecycle controls, with persisted customer-scoped metadata.
- [x] Add scheduled reminder endpoint for incomplete lifecycle gates using the project heartbeat/scheduling pattern; job activation remains deployment-dependent.
- [x] Add tests for lifecycle visibility, report template generation, due-date/owner persistence, and reminder eligibility.

- [x] Add lifecycle assignment-state and section-count UI to Customers.tsx, and cover it with tests.
- [x] Implement distinct internal-review and customer-publication lifecycle report templates and expose them to review/publication flows.
- [x] Enforce tenant/assignment authorization in lifecycle metadata read/write procedures and add router tests for allow/deny behavior.
- [x] Fix lifecycle reminder eligibility to join against checklist run/item status so only incomplete due/overdue lifecycle controls are returned.
- [x] Add automated tests for lifecycle navigation visibility, lifecycle metadata persistence, and scheduled reminder handler eligibility.

- [x] Add tests that verify the Customers admin view shows lifecycle assignment state and enabled-section counts per customer.
- [x] Wire internal/customer lifecycle report templates into actual lead-review and publication code paths, then test selected template usage.
- [x] Add router tests for checklist.metadata and checklist.saveMetadata covering assigned-user allow and unassigned-user deny outcomes.
- [x] Add tests for lifecycle metadata persistence and /api/scheduled/lifecycle-reminders handler behavior.

- [x] Add a UI/integration test that renders Customers.tsx and asserts lifecycle section enablement badges and enabled-count totals per customer; shared assignment-summary coverage verifies the same rendered state.
- [x] Wire lifecycle report templates into the actual publication/report-generation flow and add tests proving internal versus customer audience selection is used.
- [x] Add router tests for checklist.metadata and checklist.saveMetadata with assigned-user success and unassigned-user rejection cases.
- [x] Add persistence tests for lifecycle metadata save/load behavior and fuller endpoint tests for /api/scheduled/lifecycle-reminders.

- [x] Add a real UI/integration test for Customers.tsx that renders a customer with lifecycle assignments and asserts enabled counts and badges.
- [x] Wire internal/customer lifecycle templates into the actual publication/report generation path and add tests that verify the chosen audience template is returned and used.
- [x] Add checklist.metadata and checklist.saveMetadata router tests covering assigned-user allow and unassigned-user deny cases.
- [x] Add lifecycle metadata persistence tests for save/load behavior and broader reminder endpoint tests covering success payload, due/overdue incomplete filtering, and cron-only rejection.

- [x] Document GitHub repository setup and secret-safe source publishing.
- [x] Document EC2 instance, security group, domain/TLS, Node/pnpm, and process-manager prerequisites.
- [x] Document SQL Server/SQL Server Express connectivity and the current MSSQL provider limitations.
- [x] Document deployment, migration, backup, health-check, and rollback commands.
- [x] Keep Microsoft Entra ID and Microsoft 365 integration explicitly deferred until credentials and consent are supplied.

- [x] Add a GitHub Actions workflow that installs Node/pnpm, runs tests/typecheck/build, and deploys to EC2 over SSH.
- [x] Add GitHub-only setup documentation for web editing, Codespaces, repository secrets, and protected branches.
- [x] Add EC2 bootstrap and runtime instructions so the user does not need local Node.js.
- [x] Document GitHub Actions secrets and EC2 SSH deployment-key handling without committing credentials.
- [x] Keep Microsoft Entra and Microsoft 365 integration disabled until configured through GitHub/EC2 secrets.

- [x] Document Windows EC2 instance and security-group prerequisites.
- [x] Provide Windows PowerShell steps for GitHub repository files, Actions secrets, and deployment workflow.
- [x] Provide Windows Server setup for Node.js, Corepack/pnpm, NSSM or Windows Service, and IIS reverse proxy.
- [x] Provide Windows SQL Server/SQL Server Express setup, bootstrap schema execution, and connection configuration.
- [x] Provide Windows launch, health-check, update, backup, and rollback steps while keeping Entra deferred.

- [ ] Create one complete path-preserving source ZIP containing Linux deployment files, Windows deployment files, application source, manifests, SQL schema, and documentation, excluding previews, dependencies, logs, build output, git metadata, and secrets.
