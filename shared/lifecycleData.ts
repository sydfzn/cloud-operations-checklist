export type LifecycleSectionId = "kyc" | "transition" | "onboarding" | "operational_readiness";

export interface LifecycleChecklistItem {
  id: string;
  category: string;
  phase: string;
  title: string;
  description: string;
  owner: string;
}

export interface LifecycleChecklistSection {
  id: LifecycleSectionId;
  label: string;
  description: string;
  source: string;
  items: LifecycleChecklistItem[];
}

export const lifecycleChecklistSections: LifecycleChecklistSection[] = [
  {
    "id": "kyc",
    "label": "Sales to Delivery KYC",
    "description": "Pre-delivery customer due diligence and commercial-to-technical handoff.",
    "source": "AMSITManagedServices-KYCChecklist.normalized.json",
    "items": [
      {
        "id": "kyc-001",
        "category": "Customer Information",
        "phase": "1",
        "title": "Business Name & Primary Contacts",
        "description": "Capture customer legal entity, business owner, IT contacts, and emergency contacts.",
        "owner": ""
      },
      {
        "id": "kyc-002",
        "category": "Business Criticality",
        "phase": "2",
        "title": "Business Operations",
        "description": "Understand whether the customer requires 24x7, 16x5, or business-hours support and identify critical business periods.",
        "owner": ""
      },
      {
        "id": "kyc-003",
        "category": "Existing Contract",
        "phase": "3",
        "title": "Existing Support Agreement",
        "description": "Verify if the customer already has AMC, Managed Services, Professional Services, or another support contract with any department in the organization.",
        "owner": ""
      },
      {
        "id": "kyc-004",
        "category": "Current Support Model",
        "phase": "4",
        "title": "Existing IT Operations",
        "description": "Identify whether the environment is managed internally, by another MSP, or jointly managed.",
        "owner": ""
      },
      {
        "id": "kyc-005",
        "category": "Infrastructure Scope",
        "phase": "5",
        "title": "Technology Platforms",
        "description": "Identify AWS, Azure, OCI, GCP, VMware, Hyper-V, physical servers, networking, storage, databases, and applications within scope.",
        "owner": ""
      },
      {
        "id": "kyc-006",
        "category": "Infrastructure Size",
        "phase": "6",
        "title": "Asset Inventory",
        "description": "Collect the number of servers, databases, storage volumes, firewalls, switches, routers, applications, and users.",
        "owner": ""
      },
      {
        "id": "kyc-007",
        "category": "Business Critical Applications",
        "phase": "7",
        "title": "Application Prioritization",
        "description": "Identify Tier-1, Tier-2, and Tier-3 applications and understand business dependencies.",
        "owner": ""
      },
      {
        "id": "kyc-008",
        "category": "Support Window",
        "phase": "8",
        "title": "Service Hours",
        "description": "Confirm the required service coverage such as 24x7, 16x5, 8x5, or custom schedules.",
        "owner": ""
      },
      {
        "id": "kyc-009",
        "category": "Compliance Requirements",
        "phase": "9",
        "title": "Regulatory Standards",
        "description": "Identify applicable compliance requirements such as ISO 27001, PCI DSS, GDPR, HIPAA, CBB, or internal policies.",
        "owner": ""
      },
      {
        "id": "kyc-010",
        "category": "Security Assessment",
        "phase": "10",
        "title": "Security Controls",
        "description": "Review IAM, MFA, VPN, firewall policies, privileged access management, endpoint security, and security monitoring.",
        "owner": ""
      },
      {
        "id": "kyc-011",
        "category": "Monitoring Tools",
        "phase": "11",
        "title": "Current Monitoring Platform",
        "description": "Identify existing monitoring tools such as CloudWatch, Zabbix, SolarWinds, PRTG, Datadog, or New Relic.",
        "owner": ""
      },
      {
        "id": "kyc-012",
        "category": "Backup Strategy",
        "phase": "12",
        "title": "Backup Solution",
        "description": "Review backup tools, backup schedules, retention policies, recovery objectives, and restore procedures.",
        "owner": ""
      },
      {
        "id": "kyc-013",
        "category": "Disaster Recovery",
        "phase": "13",
        "title": "DR Readiness",
        "description": "Understand DR architecture, replication methods, failover procedures, and recovery testing frequency.",
        "owner": ""
      },
      {
        "id": "kyc-014",
        "category": "Documentation Availability",
        "phase": "14",
        "title": "Technical Documentation",
        "description": "Verify availability of architecture diagrams, SOPs, runbooks, network diagrams, and asset inventory.",
        "owner": ""
      },
      {
        "id": "kyc-015",
        "category": "Licensing",
        "phase": "15",
        "title": "Software Licenses",
        "description": "Review operating system, database, virtualization, monitoring, backup, and security licensing.",
        "owner": ""
      },
      {
        "id": "kyc-016",
        "category": "Access Requirements",
        "phase": "16",
        "title": "Administrative Access",
        "description": "Identify VPN, Bastion, IAM roles, privileged accounts, MFA, and access approval processes required during transition.",
        "owner": ""
      },
      {
        "id": "kyc-017",
        "category": "Third-Party Vendors",
        "phase": "17",
        "title": "OEM Support",
        "description": "Document external vendors responsible for networking, applications, databases, ISPs, and hardware maintenance.",
        "owner": ""
      },
      {
        "id": "kyc-018",
        "category": "Escalation Matrix",
        "phase": "18",
        "title": "Business Escalation Contacts",
        "description": "Collect technical, management, executive, and emergency escalation contacts.",
        "owner": ""
      },
      {
        "id": "kyc-019",
        "category": "SLA Requirements",
        "phase": "19",
        "title": "Expected Service Levels",
        "description": "Understand expected response, resolution, uptime, reporting, and availability commitments.",
        "owner": ""
      },
      {
        "id": "kyc-020",
        "category": "Reporting Requirements",
        "phase": "20",
        "title": "Operational Reporting",
        "description": "Determine required daily, weekly, monthly, and executive reports.",
        "owner": ""
      },
      {
        "id": "kyc-021",
        "category": "Change Management",
        "phase": "21",
        "title": "Change Approval Process",
        "description": "Understand customer CAB process, maintenance windows, emergency change approvals, and blackout periods.",
        "owner": ""
      },
      {
        "id": "kyc-022",
        "category": "Risk Assessment",
        "phase": "22",
        "title": "Known Technical Risks",
        "description": "Identify unsupported systems, end-of-life software, security gaps, capacity concerns, and operational risks.",
        "owner": ""
      },
      {
        "id": "kyc-023",
        "category": "Transition Timeline",
        "phase": "23",
        "title": "Implementation Schedule",
        "description": "Define expected transition start date, milestones, Go-Live date, and Hypercare duration.",
        "owner": ""
      },
      {
        "id": "kyc-024",
        "category": "Commercial Validation",
        "phase": "24",
        "title": "Scope Verification",
        "description": "Confirm in-scope services, exclusions, assumptions, dependencies, and pricing alignment.",
        "owner": ""
      },
      {
        "id": "kyc-025",
        "category": "Proposal Review",
        "phase": "25",
        "title": "Internal Managed Service Review",
        "description": "Ensure the Managed Service team reviews and approves the proposal before it is presented to the customer.",
        "owner": ""
      }
    ]
  },
  {
    "id": "transition",
    "label": "Service Transition",
    "description": "Controlled transfer of knowledge, ownership, access, and operational responsibility.",
    "source": "AMSITManagedServices-TransitionChecklist.normalized.json",
    "items": [
      {
        "id": "transition-001",
        "category": "Initiation",
        "phase": "1",
        "title": "Contract Review",
        "description": "Review signed MSA, SOW, SLA, scope, assumptions, exclusions, and commercial commitments.",
        "owner": "Account Manager"
      },
      {
        "id": "transition-002",
        "category": "1",
        "phase": "1",
        "title": "Transition Kickoff Meeting",
        "description": "Conduct formal project kickoff with customer stakeholders and define responsibilities.",
        "owner": "Project Manager"
      },
      {
        "id": "transition-003",
        "category": "1",
        "phase": "1",
        "title": "Assign Transition Manager",
        "description": "Nominate the individual responsible for end-to-end transition activities.",
        "owner": "MS Team"
      },
      {
        "id": "transition-004",
        "category": "1",
        "phase": "1",
        "title": "Assign Service Delivery Manager",
        "description": "Assign long-term operational owner responsible after Go-Live.",
        "owner": "MS Team"
      },
      {
        "id": "transition-005",
        "category": "1",
        "phase": "1",
        "title": "Project Plan",
        "description": "Develop transition schedule, milestones, risks, and dependencies.",
        "owner": "Project Manager"
      },
      {
        "id": "transition-006",
        "category": "Knowledge Transfer",
        "phase": "2",
        "title": "Infrastructure KT",
        "description": "Conduct knowledge transfer sessions covering infrastructure architecture.",
        "owner": "Customer"
      },
      {
        "id": "transition-007",
        "category": "2",
        "phase": "2",
        "title": "Application KT",
        "description": "Review application architecture, dependencies, and operational procedures.",
        "owner": "Application Team"
      },
      {
        "id": "transition-008",
        "category": "2",
        "phase": "2",
        "title": "Network KT",
        "description": "Review network topology, routing, firewalls, VPNs, and connectivity.",
        "owner": "Network Team"
      },
      {
        "id": "transition-009",
        "category": "2",
        "phase": "2",
        "title": "Security KT",
        "description": "Review IAM, security controls, policies, monitoring, and compliance.",
        "owner": "Security Team"
      },
      {
        "id": "transition-010",
        "category": "2",
        "phase": "2",
        "title": "Database KT",
        "description": "Understand database architecture, maintenance, backups, and monitoring.",
        "owner": "DBA"
      },
      {
        "id": "transition-011",
        "category": "2",
        "phase": "2",
        "title": "Backup KT",
        "description": "Review backup schedules, restore procedures, and retention policies.",
        "owner": "Backup Team"
      },
      {
        "id": "transition-012",
        "category": "2",
        "phase": "2",
        "title": "DR KT",
        "description": "Review disaster recovery architecture, testing history, and failover procedures.",
        "owner": "Customer"
      },
      {
        "id": "transition-013",
        "category": "2",
        "phase": "2",
        "title": "Known Issues Review",
        "description": "Document recurring incidents, workarounds, and technical debt.",
        "owner": "Customer"
      },
      {
        "id": "transition-014",
        "category": "2",
        "phase": "2",
        "title": "Open Incident Review",
        "description": "Review unresolved incidents, problems, and pending change requests.",
        "owner": "Customer"
      },
      {
        "id": "transition-015",
        "category": "Access Management",
        "phase": "3",
        "title": "VPN Access",
        "description": "Provision secure connectivity for support engineers.",
        "owner": "Customer"
      },
      {
        "id": "transition-016",
        "category": "3",
        "phase": "3",
        "title": "IAM Accounts",
        "description": "Create required privileged and read-only accounts.",
        "owner": "Customer"
      },
      {
        "id": "transition-017",
        "category": "3",
        "phase": "3",
        "title": "MFA Configuration",
        "description": "Enable MFA for all privileged accounts.",
        "owner": "Customer"
      },
      {
        "id": "transition-018",
        "category": "3",
        "phase": "3",
        "title": "Firewall Rules",
        "description": "Allow required management connectivity.",
        "owner": "Customer"
      },
      {
        "id": "transition-019",
        "category": "3",
        "phase": "3",
        "title": "Monitoring Access",
        "description": "Provide monitoring platform access for operations team.",
        "owner": "Customer"
      },
      {
        "id": "transition-020",
        "category": "3",
        "phase": "3",
        "title": "Backup Console Access",
        "description": "Provide backup administration access.",
        "owner": "Customer"
      },
      {
        "id": "transition-021",
        "category": "3",
        "phase": "3",
        "title": "ITSM Access",
        "description": "Provide access to ServiceNow, Jira, Dynamics 365, or ticketing systems.",
        "owner": "Customer"
      },
      {
        "id": "transition-022",
        "category": "3",
        "phase": "3",
        "title": "Documentation Repository",
        "description": "Provide access to document repositories and knowledge base.",
        "owner": "Customer"
      },
      {
        "id": "transition-023",
        "category": "Monitoring Setup",
        "phase": "4",
        "title": "Monitoring Configuration",
        "description": "Deploy monitoring agents and configure health monitoring.",
        "owner": "MS Team"
      },
      {
        "id": "transition-024",
        "category": "4",
        "phase": "4",
        "title": "Alert Configuration",
        "description": "Configure threshold-based alerting and notifications.",
        "owner": "MS Team"
      },
      {
        "id": "transition-025",
        "category": "4",
        "phase": "4",
        "title": "Dashboard Development",
        "description": "Build operational dashboards for infrastructure and applications.",
        "owner": "MS Team"
      },
      {
        "id": "transition-026",
        "category": "4",
        "phase": "4",
        "title": "Notification Channels",
        "description": "Configure email, Teams, SMS, and escalation notifications.",
        "owner": "MS Team"
      },
      {
        "id": "transition-027",
        "category": "4",
        "phase": "4",
        "title": "Ticket Automation",
        "description": "Integrate alerts with ITSM for automatic incident creation.",
        "owner": "MS Team"
      },
      {
        "id": "transition-028",
        "category": "Operational Readiness",
        "phase": "5",
        "title": "Runbook Review",
        "description": "Validate all operational runbooks and SOPs.",
        "owner": "MS Team"
      },
      {
        "id": "transition-029",
        "category": "5",
        "phase": "5",
        "title": "CMDB Population",
        "description": "Populate CMDB with all managed assets and relationships.",
        "owner": "MS Team"
      },
      {
        "id": "transition-030",
        "category": "5",
        "phase": "5",
        "title": "Asset Validation",
        "description": "Verify all assets included within support scope.",
        "owner": "MS Team"
      },
      {
        "id": "transition-031",
        "category": "5",
        "phase": "5",
        "title": "Escalation Matrix",
        "description": "Finalize operational escalation process.",
        "owner": "MS Team"
      },
      {
        "id": "transition-032",
        "category": "5",
        "phase": "5",
        "title": "RACI Approval",
        "description": "Approve responsibilities between customer and provider.",
        "owner": "Customer"
      },
      {
        "id": "transition-033",
        "category": "Validation",
        "phase": "6",
        "title": "Infrastructure Health Check",
        "description": "Validate infrastructure health before Go-Live.",
        "owner": "MS Team"
      },
      {
        "id": "transition-034",
        "category": "6",
        "phase": "6",
        "title": "Backup Test",
        "description": "Perform successful backup and restoration validation.",
        "owner": "MS Team"
      },
      {
        "id": "transition-035",
        "category": "6",
        "phase": "6",
        "title": "DR Validation",
        "description": "Verify DR replication and failover readiness.",
        "owner": "MS Team"
      },
      {
        "id": "transition-036",
        "category": "6",
        "phase": "6",
        "title": "Monitoring Validation",
        "description": "Confirm alerts are generated and received correctly.",
        "owner": "MS Team"
      },
      {
        "id": "transition-037",
        "category": "6",
        "phase": "6",
        "title": "Incident Process Test",
        "description": "Validate incident lifecycle from alert to closure.",
        "owner": "MS Team"
      },
      {
        "id": "transition-038",
        "category": "6",
        "phase": "6",
        "title": "Reporting Validation",
        "description": "Verify SLA and operational reports.",
        "owner": "MS Team"
      },
      {
        "id": "transition-039",
        "category": "Go-Live",
        "phase": "7",
        "title": "Go-Live Approval",
        "description": "Receive formal customer approval to begin Managed Services.",
        "owner": "Customer"
      },
      {
        "id": "transition-040",
        "category": "7",
        "phase": "7",
        "title": "Hypercare",
        "description": "Provide enhanced operational support during stabilization period.",
        "owner": "MS Team"
      },
      {
        "id": "transition-041",
        "category": "7",
        "phase": "7",
        "title": "Transition Sign-Off",
        "description": "Obtain customer sign-off confirming successful transition.",
        "owner": "Customer"
      },
      {
        "id": "transition-042",
        "category": "7",
        "phase": "7",
        "title": "BAU Handover",
        "description": "Transfer ownership to steady-state Managed Services operations.",
        "owner": "Service Delivery Manager"
      }
    ]
  },
  {
    "id": "onboarding",
    "label": "Managed Services Onboarding",
    "description": "Customer discovery, access, tooling, documentation, and service activation.",
    "source": "AMSITManagedServices-OnboardingChecklist.normalized.json",
    "items": [
      {
        "id": "onboarding-001",
        "category": "Main Items",
        "phase": "1",
        "title": "Descriptions",
        "description": "Status",
        "owner": "Remarks"
      },
      {
        "id": "onboarding-002",
        "category": "Pre-Onboarding Preparation",
        "phase": "1",
        "title": "Contract Signed – Ensure the Master Service Agreement (MSA) and Statement of Work (SOW) are signed.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-003",
        "category": "1",
        "phase": "1",
        "title": "Initial Payment Received – Confirm receipt of onboarding/setup fees.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-004",
        "category": "1",
        "phase": "1",
        "title": "Service Scope Validation – Confirm in-scope users, devices, applications, locations, and support boundaries.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-005",
        "category": "1",
        "phase": "1",
        "title": "Service Tier Classification – Confirm the client's subscribed managed services package and associated deliverables. Categorize under one of the following service tiers: Platinum, Gold, or Silver.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-006",
        "category": "1",
        "phase": "1",
        "title": "Platinum Tier Validation – Includes 24x7 monitoring, incident response, patch management, backup monitoring, security management, strategic advisory, and priority escalation.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-007",
        "category": "1",
        "phase": "1",
        "title": "Gold Tier Validation – Includes business-hours support, proactive monitoring, patch management, backup monitoring, and standard escalation.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-008",
        "category": "1",
        "phase": "1",
        "title": "Silver Tier Validation – Includes essential monitoring, reactive support, scheduled maintenance, and best-effort response.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-009",
        "category": "1",
        "phase": "1",
        "title": "SLA Review and Acceptance – Review service-specific SLAs, response times, escalation procedures, and support commitments based on the selected tier.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-010",
        "category": "1",
        "phase": "1",
        "title": "Client Information Collected – Gather key stakeholder contacts, emergency contacts, business hours, and locations.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-011",
        "category": "1",
        "phase": "1",
        "title": "Escalation Matrix – Document client and provider escalation contacts.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-012",
        "category": "1",
        "phase": "1",
        "title": "Access to Current IT Documentation – Obtain network diagrams, passwords, software licenses, architecture diagrams, and existing operational documents.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-013",
        "category": "Discovery Phase & Questionnaires",
        "phase": "2",
        "title": "Infrastructure Assessment – Inventory servers, workstations, cloud resources, storage, and network devices. Verify OS versions, firmware, and patch levels.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-014",
        "category": "2",
        "phase": "2",
        "title": "Software Audit – List all critical applications, licenses, versions, and third-party vendor agreements.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-015",
        "category": "2",
        "phase": "2",
        "title": "Network Review – Map network topology, firewall rules, VPNs, routing, DNS, and Wi-Fi configurations.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-016",
        "category": "2",
        "phase": "2",
        "title": "Security Assessment – Review antivirus, EDR, firewalls, MFA, encryption, and existing security controls.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-017",
        "category": "2",
        "phase": "2",
        "title": "Vulnerability Assessment – Perform baseline vulnerability scanning across the environment.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-018",
        "category": "2",
        "phase": "2",
        "title": "Compliance Review – Validate regulatory requirements such as GDPR, HIPAA, PCI-DSS, ISO 27001, or industry-specific standards.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-019",
        "category": "2",
        "phase": "2",
        "title": "AWS SaaS License Validation – Review AWS Marketplace subscriptions, SaaS entitlements, BYOL licenses, and vendor agreements.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-020",
        "category": "2",
        "phase": "2",
        "title": "Disaster Recovery License Readiness – Confirm SaaS products and third-party tools support DR activation and failover in the secondary AWS region.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-021",
        "category": "2",
        "phase": "2",
        "title": "Secondary Region Entitlement Validation – Verify license portability, activation rights, and regional usage restrictions.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-022",
        "category": "2",
        "phase": "2",
        "title": "Vendor Support Confirmation – Obtain confirmation from vendors for cross-region DR support and licensing compliance.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-023",
        "category": "2",
        "phase": "2",
        "title": "Questionnaire Review – Validate completed questionnaires and discovery findings with stakeholders.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-024",
        "category": "Credential and Access Management",
        "phase": "3",
        "title": "Credential Consolidation – Collect all administrative credentials, break-glass accounts, temporary credentials, and partner access accounts.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-025",
        "category": "3",
        "phase": "3",
        "title": "Admin Access Setup – Establish secure privileged access to all systems, cloud platforms, and management consoles.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-026",
        "category": "3",
        "phase": "3",
        "title": "IAM Review – Review IAM users, roles, policies, federated access, and resource permissions.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-027",
        "category": "3",
        "phase": "3",
        "title": "MFA Enforcement – Enable MFA for all privileged, administrative, and remote access accounts.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-028",
        "category": "3",
        "phase": "3",
        "title": "Privileged Access Review – Remove unnecessary privileges and validate least-privilege access controls.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-029",
        "category": "3",
        "phase": "3",
        "title": "Password Policy Implementation – Enforce password complexity, rotation, and secure credential storage standards.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-030",
        "category": "Documentation Setup",
        "phase": "4",
        "title": "Client-Specific IT Documentation – Create a centralized and secure documentation repository.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-031",
        "category": "4",
        "phase": "4",
        "title": "Standard Operating Procedures (SOPs) – Document routine operational, maintenance, and troubleshooting procedures.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-032",
        "category": "4",
        "phase": "4",
        "title": "Asset Tracking – Create and maintain a comprehensive asset inventory database.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-033",
        "category": "4",
        "phase": "4",
        "title": "Known Issues Register – Record technical debt, open issues, risks, and mitigation plans.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-034",
        "category": "System Standardization",
        "phase": "5",
        "title": "Deploy Monitoring Tools – Install and configure RMM, observability, and infrastructure monitoring tools.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-035",
        "category": "5",
        "phase": "5",
        "title": "Alert Threshold Configuration – Configure CPU, memory, disk, network, application, and service alert thresholds.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-036",
        "category": "5",
        "phase": "5",
        "title": "Performance Baseline – Capture baseline system and application performance metrics.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-037",
        "category": "5",
        "phase": "5",
        "title": "Monitoring Validation – Test alert generation, escalation workflows, and automated ticket creation.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-038",
        "category": "5",
        "phase": "5",
        "title": "Patch Management Setup – Configure automated patching schedules and maintenance windows.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-039",
        "category": "5",
        "phase": "5",
        "title": "Antivirus and Endpoint Security – Deploy and standardize endpoint security, EDR, and malware protection.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-040",
        "category": "Backup and Disaster Recovery",
        "phase": "6",
        "title": "Backup Assessment – Review existing backup architecture, policies, retention, and recovery objectives.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-041",
        "category": "6",
        "phase": "6",
        "title": "Backup Solution Deployment – Implement local, off-site, cloud, and cross-region backup solutions.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-042",
        "category": "6",
        "phase": "6",
        "title": "Cross-Region Backup Validation – Verify replication of snapshots, recovery points, and backups to the designated DR AWS region.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-043",
        "category": "6",
        "phase": "6",
        "title": "Cross-Region Restore Testing – Validate restoration from the secondary AWS region.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-044",
        "category": "6",
        "phase": "6",
        "title": "Backup Restore Testing – Perform periodic sample restores and document recovery results.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-045",
        "category": "6",
        "phase": "6",
        "title": "RPO/RTO Validation – Confirm agreed Recovery Point and Recovery Time Objectives.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-046",
        "category": "6",
        "phase": "6",
        "title": "Disaster Recovery Plan – Document DR architecture, failover procedures, communication plans, and runbooks.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-047",
        "category": "6",
        "phase": "6",
        "title": "DR Simulation Exercise – Conduct controlled failover and failback testing.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-048",
        "category": "6",
        "phase": "6",
        "title": "Backup Reporting Setup – Configure automated backup, replication, and DR compliance reporting.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-049",
        "category": "Service Desk and Operational Readiness",
        "phase": "7",
        "title": "Ticketing Portal Configuration – Configure the client within the service management platform.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-050",
        "category": "7",
        "phase": "7",
        "title": "User Access Provisioning – Grant portal access to authorized client personnel.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-051",
        "category": "7",
        "phase": "7",
        "title": "Authorized Contacts List – Define approved requestors, approvers, and escalation contacts.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-052",
        "category": "7",
        "phase": "7",
        "title": "Support Activation – Validate monitoring, alert routing, ticketing, and escalation workflows.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-053",
        "category": "Communication and Training",
        "phase": "8",
        "title": "Introduce Support Process – Share ticketing procedures, support channels, escalation paths, and SLAs.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-054",
        "category": "8",
        "phase": "8",
        "title": "Employee Training – Conduct end-user support orientation and security awareness training.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-055",
        "category": "8",
        "phase": "8",
        "title": "Client IT Handbook – Deliver support guides, policies, escalation contacts, and operational procedures.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-056",
        "category": "Handover and Validation",
        "phase": "9",
        "title": "Existing Provider Transition – Coordinate handover from incumbent MSP, cloud provider, or internal IT team.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-057",
        "category": "9",
        "phase": "9",
        "title": "Client Sign-Off – Obtain formal acceptance of onboarding completion.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-058",
        "category": "9",
        "phase": "9",
        "title": "Handover Complete Documentation – Deliver finalized documentation, runbooks, and operational artifacts.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-059",
        "category": "9",
        "phase": "9",
        "title": "Final Review – Evaluate onboarding success and identify process improvements.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-060",
        "category": "Post-Onboarding Follow-Up",
        "phase": "10",
        "title": "Hypercare Support – Provide enhanced support during the first 2–4 weeks after go-live.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-061",
        "category": "10",
        "phase": "10",
        "title": "30-Day Review – Conduct a post-onboarding service review and address any outstanding issues.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-062",
        "category": "10",
        "phase": "10",
        "title": "Ongoing Communication Plan – Establish regular service reviews, governance meetings, and reporting cadence.",
        "description": "",
        "owner": ""
      },
      {
        "id": "onboarding-063",
        "category": "10",
        "phase": "10",
        "title": "Continuous Improvement Plan – Identify optimization opportunities and strategic roadmap initiatives.",
        "description": "",
        "owner": ""
      }
    ]
  },
  {
    "id": "operational_readiness",
    "label": "Operational Readiness",
    "description": "Go-live readiness checks for support, monitoring, security, continuity, and governance.",
    "source": "AMSITManagedServices-OperationalChecklist.normalized.json",
    "items": [
      {
        "id": "operational_readiness-001",
        "category": "Category",
        "phase": "1",
        "title": "Item",
        "description": "Description",
        "owner": "Status"
      },
      {
        "id": "operational_readiness-002",
        "category": "People",
        "phase": "1",
        "title": "L1 Team Assigned",
        "description": "Assign first-line support engineers responsible for monitoring and ticket handling.",
        "owner": ""
      },
      {
        "id": "operational_readiness-003",
        "category": "1",
        "phase": "1",
        "title": "L2 Team Assigned",
        "description": "Assign technical specialists for incident resolution and troubleshooting.",
        "owner": ""
      },
      {
        "id": "operational_readiness-004",
        "category": "1",
        "phase": "1",
        "title": "L3 Escalation Assigned",
        "description": "Identify architects, OEM vendors, and escalation contacts for complex issues.",
        "owner": ""
      },
      {
        "id": "operational_readiness-005",
        "category": "1",
        "phase": "1",
        "title": "On-Call Roster",
        "description": "Publish on-call schedule for after-hours support.",
        "owner": ""
      },
      {
        "id": "operational_readiness-006",
        "category": "Process",
        "phase": "2",
        "title": "Incident Management",
        "description": "Verify incident lifecycle, prioritization, escalation, and SLA compliance.",
        "owner": ""
      },
      {
        "id": "operational_readiness-007",
        "category": "2",
        "phase": "2",
        "title": "Change Management",
        "description": "Confirm change approval workflow and maintenance windows.",
        "owner": ""
      },
      {
        "id": "operational_readiness-008",
        "category": "2",
        "phase": "2",
        "title": "Problem Management",
        "description": "Establish root cause analysis and problem management process.",
        "owner": ""
      },
      {
        "id": "operational_readiness-009",
        "category": "2",
        "phase": "2",
        "title": "Service Request Process",
        "description": "Define service request catalog and approval workflow.",
        "owner": ""
      },
      {
        "id": "operational_readiness-010",
        "category": "2",
        "phase": "2",
        "title": "Major Incident Process",
        "description": "Validate major incident communication and bridge procedures.",
        "owner": ""
      },
      {
        "id": "operational_readiness-011",
        "category": "Technology",
        "phase": "3",
        "title": "Monitoring Operational",
        "description": "Verify monitoring coverage across all managed assets.",
        "owner": ""
      },
      {
        "id": "operational_readiness-012",
        "category": "3",
        "phase": "3",
        "title": "Backup Successful",
        "description": "Confirm backup jobs are completing successfully.",
        "owner": ""
      },
      {
        "id": "operational_readiness-013",
        "category": "3",
        "phase": "3",
        "title": "Dashboard Ready",
        "description": "Operational dashboards available for engineers and customers.",
        "owner": ""
      },
      {
        "id": "operational_readiness-014",
        "category": "3",
        "phase": "3",
        "title": "Patch Management",
        "description": "Validate patch schedules and compliance reporting.",
        "owner": ""
      },
      {
        "id": "operational_readiness-015",
        "category": "3",
        "phase": "3",
        "title": "Automation",
        "description": "Verify automation jobs, scripts, and integrations.",
        "owner": ""
      },
      {
        "id": "operational_readiness-016",
        "category": "Documentation",
        "phase": "4",
        "title": "Architecture Diagram",
        "description": "Latest architecture documentation approved and stored.",
        "owner": ""
      },
      {
        "id": "operational_readiness-017",
        "category": "4",
        "phase": "4",
        "title": "Runbooks",
        "description": "Operational procedures documented and validated.",
        "owner": ""
      },
      {
        "id": "operational_readiness-018",
        "category": "4",
        "phase": "4",
        "title": "Standard Operating Procedures",
        "description": "SOPs available for recurring operational tasks.",
        "owner": ""
      },
      {
        "id": "operational_readiness-019",
        "category": "4",
        "phase": "4",
        "title": "Asset Inventory",
        "description": "Complete inventory verified against CMDB.",
        "owner": ""
      },
      {
        "id": "operational_readiness-020",
        "category": "4",
        "phase": "4",
        "title": "Network Diagram",
        "description": "Updated network topology available.",
        "owner": ""
      },
      {
        "id": "operational_readiness-021",
        "category": "4",
        "phase": "4",
        "title": "Application Dependency Map",
        "description": "Dependencies documented to support impact analysis.",
        "owner": ""
      },
      {
        "id": "operational_readiness-022",
        "category": "Customer Readiness",
        "phase": "5",
        "title": "Escalation Matrix",
        "description": "Customer-approved escalation contacts and communication flow.",
        "owner": ""
      },
      {
        "id": "operational_readiness-023",
        "category": "5",
        "phase": "5",
        "title": "Communication Plan",
        "description": "Notification procedures for incidents, maintenance, and outages.",
        "owner": ""
      },
      {
        "id": "operational_readiness-024",
        "category": "5",
        "phase": "5",
        "title": "SLA Acceptance",
        "description": "Customer confirms SLA understanding and acceptance.",
        "owner": ""
      },
      {
        "id": "operational_readiness-025",
        "category": "5",
        "phase": "5",
        "title": "Reporting Calendar",
        "description": "Monthly reports and service review schedule agreed.",
        "owner": ""
      },
      {
        "id": "operational_readiness-026",
        "category": "5",
        "phase": "5",
        "title": "CAB Schedule",
        "description": "Change Advisory Board meetings planned.",
        "owner": ""
      },
      {
        "id": "operational_readiness-027",
        "category": "Governance",
        "phase": "6",
        "title": "Weekly Operations Review",
        "description": "Schedule recurring operational review meetings.",
        "owner": ""
      },
      {
        "id": "operational_readiness-028",
        "category": "6",
        "phase": "6",
        "title": "Monthly Service Review (MSR)",
        "description": "Review SLA performance, incidents, changes, and service improvements.",
        "owner": ""
      },
      {
        "id": "operational_readiness-029",
        "category": "6",
        "phase": "6",
        "title": "Quarterly Business Review (QBR)",
        "description": "Review service performance, risks, optimization opportunities, and strategic roadmap.",
        "owner": ""
      }
    ]
  }
];

export const lifecycleChecklistById = Object.fromEntries(lifecycleChecklistSections.map((section) => [section.id, section]));
