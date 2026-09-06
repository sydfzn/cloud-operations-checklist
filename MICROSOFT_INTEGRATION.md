# Microsoft Integration Setup

The portal is prepared for a multi-customer operating model with Microsoft Entra ID staff sign-in and Microsoft 365 mailbox delivery. The current build intentionally leaves tenant and application credentials blank, as requested.

## Entra ID sign-in

Register a web application in the company Microsoft Entra tenant. Configure the portal callback URL for the deployed application, restrict sign-in to the company tenant, and provide the tenant ID, client ID, and client secret through the project’s secure secret settings. The application should expose the user identity and directory email so customer leads can be assigned to company accounts.

## Microsoft 365 report delivery

Use a shared or service mailbox approved by company policy. Grant the application the minimum Microsoft Graph permission required to send mail from that mailbox, obtain administrator consent, and provide the sender mailbox plus Graph application credentials through secure secret settings. Customer recipient addresses remain customer-scoped and are managed from the customer inventory.

## Governance workflow

An administrator creates a customer, registers its cloud accounts or subscriptions, records environments, regions, services, and criticality, assigns one primary lead and optional backups, and configures customer recipients. A lead reviews the cadence-specific checklist, records validation notes, and explicitly approves the run. Only an approved run may be published or sent to customer recipients. Every approval and publication should remain auditable.

## Configuration still required

The following values are intentionally not configured in this checkpoint: `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `M365_SENDER_EMAIL`, `M365_GRAPH_CLIENT_ID`, and `M365_GRAPH_CLIENT_SECRET`.
