export type Cadence = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual" | "Reference";

export type ChecklistItem = {
  id: string;
  activity: string;
  category: string;
};

export type ChecklistDefinition = {
  id: string;
  name: string;
  cadence: Cadence;
  description: string;
  items: ChecklistItem[];
};

const items = (prefix: string, rows: Array<[string, string]>) =>
  rows.map(([category, activity], index) => ({
    id: `${prefix}-${index + 1}`,
    category,
    activity,
  }));

export const checklistDefinitions: ChecklistDefinition[] = [
  {
    id: "daily-operational",
    name: "Daily Operational Checklist",
    cadence: "Daily",
    description: "The first-line health pass across provider services, resources, incidents, and escalations.",
    items: items("daily-operational", [
      ["Operations", "Review cloud provider service health"],
      ["Compute", "Review compute health"],
      ["Monitoring", "Review critical alarms"],
      ["Storage", "Review storage-capacity alerts"],
      ["Database", "Review database service health where applicable"],
      ["Network", "Review network alarms"],
      ["Backup", "Review failed backups"],
      ["Incidents", "Review P1/P2 incidents"],
      ["Security", "Review critical security alerts where contracted"],
      ["Change", "Review scheduled changes"],
      ["Capacity", "Review resources approaching operational thresholds"],
      ["Escalation", "Record required escalations/actions"],
    ]),
  },
  {
    id: "resource-daily",
    name: "Resource Daily Checklist",
    cadence: "Daily",
    description: "Resource-level checks for compute, storage, network, identity, backup, patching, capacity, and security.",
    items: items("resource-daily", [
      ["Compute", "Instance state reviewed"], ["Compute", "Status-check failures reviewed"], ["Compute", "CPU alerts reviewed"], ["Compute", "Memory alerts reviewed"], ["Compute", "Disk alerts reviewed"], ["Compute", "Critical-service failures reviewed"], ["Compute", "Agent failures reviewed"], ["Compute", "Capacity exceptions escalated"],
      ["Storage", "Critical capacity alerts reviewed"], ["Storage", "Storage service health reviewed"], ["Storage", "File-share failures reviewed"], ["Storage", "Replication failures reviewed"], ["Storage", "Backup failures reviewed"], ["Storage", "Critical performance alerts reviewed"],
      ["Network", "Critical VPN status reviewed"], ["Network", "Dedicated connection status reviewed"], ["Network", "Load-balancer health reviewed"], ["Network", "Critical network alerts reviewed"], ["Network", "DNS incidents reviewed"], ["Network", "Connectivity-related P1/P2 reviewed"],
      ["IAM", "Critical IAM/security alerts reviewed"], ["IAM", "Unexpected root/admin activity reviewed"], ["IAM", "Access-related P1/P2 incidents reviewed"], ["IAM", "Emergency access events reviewed"],
      ["Backup", "Failed backup jobs reviewed"], ["Backup", "Missed backups reviewed"], ["Backup", "Copy-job failures reviewed"], ["Backup", "Critical replication health reviewed"], ["Backup", "RPO risks escalated"],
      ["Patch", "Active emergency patch actions reviewed"], ["Patch", "Critical patch failures reviewed"], ["Patch", "Production servers stuck after reboot reviewed"], ["Patch", "Security escalations requiring patch reviewed"],
      ["Capacity", "Critical capacity alerts reviewed"], ["Capacity", "Resource saturation reviewed"], ["Capacity", "Quota alerts reviewed"], ["Capacity", "Availability incidents reviewed"], ["Capacity", "Degraded redundancy reviewed"],
      ["Security", "Critical security findings reviewed"], ["Security", "Threat alerts reviewed"], ["Security", "Unexpected privileged activity reviewed"],
    ]),
  },
  {
    id: "daily-cloud-health",
    name: "Daily Cloud Health Checklist",
    cadence: "Daily",
    description: "A concise executive health sweep for the customer cloud estate.",
    items: items("daily-cloud-health", [
      ["Cloud Health", "Cloud provider health reviewed"], ["Compute", "Compute health reviewed"], ["Monitoring", "Critical monitoring alerts reviewed"], ["Storage", "Storage capacity risks reviewed"], ["Network", "Network connectivity reviewed"], ["Network", "Load-balancer health reviewed"], ["Backup", "Backup failures reviewed"], ["DR", "DR replication exceptions reviewed"], ["IAM", "IAM/security critical events reviewed"], ["Patch", "Patch/emergency maintenance issues reviewed"], ["Platform", "Container/serverless critical events reviewed"], ["Automation", "Automation failures reviewed"], ["Capacity", "Capacity/quota critical alerts reviewed"], ["FinOps", "Cost anomalies reviewed where applicable"], ["Incidents", "P1/P2 incidents reviewed"], ["Escalation", "Required escalations completed"],
    ]),
  },
  {
    id: "resource-weekly",
    name: "Resource Weekly Checklist",
    cadence: "Weekly",
    description: "Trend and exception review to prevent recurring incidents and technical drift.",
    items: items("resource-weekly", [
      ["Compute", "Repeated alerts reviewed"], ["Compute", "Repeated reboot incidents reviewed"], ["Compute", "Stopped instances reviewed"], ["Compute", "Agent health reviewed"], ["Compute", "Scaling events reviewed"], ["Compute", "Certificate risks reviewed"], ["Compute", "Vendor retirement notices reviewed"],
      ["Storage", "Rapid-growth filesystems reviewed"], ["Storage", "Replication lag reviewed"], ["Storage", "Repeated storage alerts reviewed"], ["Storage", "Unattached volumes reviewed"], ["Storage", "Failed snapshots reviewed"], ["Storage", "File-permission incidents reviewed"],
      ["Network", "Redundant tunnel state reviewed"], ["Network", "Recurring network incidents reviewed"], ["Network", "Routing changes reviewed"], ["Network", "Load-balancer unhealthy trends reviewed"], ["Network", "Public exposure exceptions reviewed"], ["Network", "Network technical risks updated"],
      ["IAM", "New privileged identities reviewed"], ["IAM", "Temporary access approaching expiry reviewed"], ["IAM", "Access-key issues reviewed"], ["IAM", "Repeated access incidents reviewed"], ["IAM", "Unauthorized IAM changes reviewed"],
      ["Backup", "Repeated failures reviewed"], ["Backup", "Protected-resource coverage reviewed"], ["Backup", "Replication lag reviewed"], ["Backup", "Recovery-point age reviewed"], ["Backup", "Outstanding restore issues reviewed"],
      ["Patch", "Failed patch jobs reviewed"], ["Patch", "Pending reboot reviewed"], ["Patch", "Critical missing patches reviewed"], ["Patch", "Patch-tool health reviewed"], ["Patch", "Exceptions approaching expiry reviewed"], ["Patch", "Unsupported OS risks reviewed"],
      ["Capacity", "Repeated saturation reviewed"], ["Capacity", "Fast-growing storage reviewed"], ["Capacity", "Auto Scaling failures reviewed"], ["Capacity", "Load/performance trend reviewed"], ["Capacity", "Quota risks reviewed"], ["Capacity", "SPOF issues reviewed"],
      ["Security", "Recurring critical findings reviewed"], ["Security", "Threat trends reviewed"],
    ]),
  },
  {
    id: "resource-monthly",
    name: "Resource Monthly Checklist",
    cadence: "Monthly",
    description: "Monthly reconciliation, lifecycle, coverage, risk, and continuous-improvement review.",
    items: items("resource-monthly", [
      ["Compute", "Capacity trend reviewed"], ["Compute", "Rightsizing reviewed"], ["Compute", "OS lifecycle reviewed"], ["Compute", "Monitoring coverage validated"], ["Compute", "Backup coverage validated"], ["Compute", "Patch compliance reviewed"], ["Compute", "Orphaned resources reviewed"], ["Compute", "Compute inventory reconciled"], ["Compute", "Technical risks updated"], ["Compute", "CSI opportunities recorded"],
      ["Storage", "Capacity trends reviewed"], ["Storage", "Performance trends reviewed"], ["Storage", "Storage inventory reconciled"], ["Storage", "Orphaned storage reviewed"], ["Storage", "Snapshot retention reviewed"], ["Storage", "Object lifecycle reviewed"], ["Storage", "Backup coverage validated"],
      ["Network", "Network inventory reconciled"], ["Network", "Connectivity capacity reviewed"], ["Network", "VPN/DX/ER/FastConnect availability reviewed"], ["Network", "Network latency trends reviewed"], ["Network", "Public IP inventory reviewed"], ["Network", "Security group exposure reviewed"], ["Network", "Flow-log coverage reviewed"], ["Network", "DNS dependencies reviewed"], ["Network", "DR connectivity reviewed"], ["Network", "CSI opportunities recorded"],
      ["IAM", "Access inventory reconciled"], ["IAM", "Privileged users reviewed"], ["IAM", "MFA coverage reviewed"], ["IAM", "Stale users reviewed"], ["IAM", "Stale access keys reviewed"], ["IAM", "Cross-account roles reviewed"], ["IAM", "Shared accounts reviewed"], ["IAM", "Service-account ownership reviewed"], ["IAM", "IAM risks updated"], ["IAM", "CSI opportunities recorded"],
      ["Backup", "Backup coverage reconciled"], ["Backup", "Backup success calculated"], ["Backup", "Retention reviewed"], ["Backup", "Restore testing status reviewed"], ["Backup", "Cross-region copies reviewed"], ["Backup", "Cross-account protection reviewed"], ["Backup", "Immutable controls reviewed"],
    ]),
  },
  {
    id: "daily-monitoring",
    name: "Daily Monitoring Checklist", cadence: "Daily", description: "Telemetry and alerting controls that keep operational signals trustworthy.",
    items: items("daily-monitoring", [["Monitoring", "Review critical alerts"], ["Monitoring", "Review monitoring platform health"], ["Monitoring", "Review lost telemetry"], ["Monitoring", "Review failed alert integrations"], ["Monitoring", "Review resource saturation alerts"], ["Backup", "Review backup alerts"], ["Cloud Health", "Review cloud provider health"], ["Escalation", "Escalate actionable events"]]),
  },
  {
    id: "weekly-monitoring",
    name: "Weekly Monitoring Checklist", cadence: "Weekly", description: "Alert quality and coverage review for operational signal hygiene.",
    items: items("weekly-monitoring", [["Monitoring", "Review repetitive alerts"], ["Monitoring", "Review false positives"], ["Monitoring", "Review unmonitored resources"], ["Monitoring", "Review monitoring gaps"], ["Monitoring", "Review dashboard quality"], ["Monitoring", "Review new resources"], ["Monitoring", "Review stale alarms"], ["Monitoring", "Review maintenance suppressions"]]),
  },
  {
    id: "monthly-monitoring",
    name: "Monthly Monitoring Checklist", cadence: "Monthly", description: "Monthly monitoring KPI and threshold review.",
    items: items("monthly-monitoring", [["Monitoring", "Calculate coverage"], ["Monitoring", "Review alert volume"], ["Monitoring", "Review actionable alert rate"], ["Monitoring", "Review MTTA"], ["Monitoring", "Review integration success"], ["Monitoring", "Review capacity trends"], ["Monitoring", "Review log retention"], ["Monitoring", "Review critical thresholds"], ["Monitoring", "Update Monitoring Matrix"], ["Monitoring", "Identify CSI opportunities"]]),
  },
  {
    id: "quarterly-dr", name: "Quarterly DR Checklist", cadence: "Quarterly", description: "Resilience readiness, recovery validation, and corrective-action tracking.",
    items: items("quarterly-dr", [["DR", "DR architecture reviewed"], ["DR", "DR inventory validated"], ["DR", "Runbook updated"], ["DR", "Recovery credentials validated"], ["DR", "Network/DNS dependency reviewed"], ["DR", "DR drill scheduled"], ["DR", "RPO/RTO measured"], ["DR", "Customer validation completed"], ["DR", "Lessons learned recorded"], ["DR", "Corrective actions tracked"]]),
  },
  {
    id: "quarterly-capacity", name: "Quarterly Capacity Checklist", cadence: "Quarterly", description: "Forward-looking demand planning and strategic scaling review.",
    items: items("quarterly-capacity", [["Capacity", "6–12 month forecast reviewed"], ["Capacity", "Seasonal demand reviewed"], ["Capacity", "Strategic capacity risks reviewed"], ["Capacity", "Architecture scaling model reviewed"], ["FinOps", "FinOps alignment reviewed"], ["Capacity", "Major capacity projects identified"]]),
  },
  {
    id: "quarterly-finops", name: "Quarterly FinOps Checklist", cadence: "Quarterly", description: "Commitments, workload economics, and savings roadmap review.",
    items: items("quarterly-finops", [["FinOps", "Commitment utilization reviewed"], ["FinOps", "Long-term workload stability reviewed"], ["FinOps", "Strategic optimization reviewed"], ["FinOps", "Architecture cost drivers reviewed"], ["FinOps", "Annualized savings updated"], ["FinOps", "Customer roadmap aligned"]]),
  },
  {
    id: "monthly-governance", name: "Monthly Cloud Ops Governance", cadence: "Monthly", description: "Customer-facing operational governance and reporting cadence.",
    items: items("monthly-governance", [["Governance", "Cloud inventory reconciled"], ["Governance", "Monitoring coverage validated"], ["Compute", "Compute trend reviewed"], ["Storage", "Storage trend reviewed"], ["Network", "Network health reviewed"], ["IAM", "IAM exceptions reviewed"], ["Backup", "Backup/DR reviewed"], ["Patch", "Patch compliance reviewed"], ["Capacity", "Capacity reviewed"], ["Security", "Security posture input reviewed"], ["Platform", "Container/serverless health reviewed"], ["Automation", "Automation reviewed"], ["FinOps", "FinOps opportunities reviewed"], ["Risk", "Technical risks updated"], ["CSI", "CSI recommendations updated"], ["Reporting", "Monthly report issued"]]),
  },
  {
    id: "quarterly-governance", name: "Quarterly Cloud Ops Governance", cadence: "Quarterly", description: "Strategic architecture, resilience, lifecycle, and roadmap governance.",
    items: items("quarterly-governance", [["Architecture", "Architecture health reviewed"], ["Resilience", "Resilience reviewed"], ["Resilience", "SPOFs reviewed"], ["Capacity", "6–12 month capacity forecast reviewed"], ["Lifecycle", "OS/platform lifecycle reviewed"], ["DR", "DR readiness reviewed"], ["Risk", "Technical debt reviewed"], ["Automation", "Automation maturity reviewed"], ["FinOps", "Strategic cost drivers reviewed"], ["Roadmap", "Major improvement roadmap updated"]]),
  },
  {
    id: "annual-operations", name: "Annual Cloud Operations Checklist", cadence: "Annual", description: "Annual certification of documentation, ownership, security, resilience, and capability.",
    items: items("annual-operations", [["Documentation", "Full documentation review"], ["Inventory", "Cloud inventory certification"], ["Governance", "Operational ownership review"], ["Runbooks", "Runbook review"], ["IAM", "Major access review"], ["Backup", "Backup policy review"], ["DR", "DR test completed per scope"], ["Patch", "Patch baseline review"], ["Security", "Cloud security baseline review"], ["Capacity", "Annual capacity forecast"], ["Maturity", "Technical maturity assessment"], ["People", "Training/skill gaps reviewed"]]),
  },
  {
    id: "compliance", name: "Cloud Ops Compliance Checklist", cadence: "Reference", description: "Control baseline for contracted cloud operations scope and evidence readiness.",
    items: items("compliance", [["Scope", "Contracted cloud scope understood"], ["Inventory", "Cloud account/subscription inventory maintained"], ["Inventory", "Managed resource inventory maintained"], ["Governance", "Resource criticality defined"], ["Monitoring", "Monitoring coverage established"], ["ITSM", "Alert-to-ITSM process validated"], ["Compute", "Compute operational controls established"], ["Storage", "Storage controls established"], ["Network", "Cloud network documented"], ["IAM", "IAM/access controls established"], ["Backup", "Backup coverage validated"], ["DR", "Restore process tested where required"], ["DR", "DR responsibilities understood"], ["Patch", "Patch governance established"], ["Capacity", "Capacity trends reviewed"], ["Evidence", "Service availability evidence available"], ["Security", "Cloud security controls monitored"], ["Platform", "Container/serverless workloads governed where applicable"], ["Automation", "Production automation governed"], ["FinOps", "Cost optimization inputs available"], ["Risk", "Technical risk register maintained"], ["Runbooks", "Runbooks available"], ["Documentation", "Documentation current"], ["Vendor", "Vendor escalation process established"], ["Reporting", "Monthly Cloud Operations reporting active"], ["CSI", "CSI mechanism active"]]),
  },
  {
    id: "artifacts", name: "Cloud Ops Artifacts", cadence: "Reference", description: "Artifact register for operational evidence, reporting, and continuous improvement.",
    items: items("artifacts", [["Inventory", "Cloud Account Inventory"], ["Inventory", "Managed Resource Inventory"], ["Governance", "Resource Criticality Matrix"], ["Monitoring", "Monitoring Matrix"], ["Monitoring", "Alert Matrix"], ["Compute", "Compute Inventory"], ["Storage", "Storage Inventory"], ["Network", "Network Inventory"], ["IAM", "IAM/Access Inventory"], ["Backup", "Backup Coverage Matrix"], ["DR", "RPO/RTO Register"], ["Patch", "Patch Matrix"], ["Lifecycle", "OS EOL Register"], ["Capacity", "Capacity Report"], ["Resilience", "SPOF Register"], ["Security", "Security Finding Register"], ["Platform", "Container/Serverless Inventory"], ["Automation", "Automation Inventory"], ["FinOps", "FinOps Opportunity Register"], ["Vendor", "Vendor Support Register"], ["Risk", "Technical Risk Register"], ["Runbooks", "Runbook Register"], ["CSI", "CSI Register"], ["Learning", "Lessons Learned Register"], ["Reporting", "Daily Health Report"], ["Reporting", "Weekly Technical Review"], ["Reporting", "Monthly Cloud Operations Report"], ["Reporting", "Cloud Operations KPI Scorecard"]]),
  },
  {
    id: "repository", name: "Cloud Ops Repository", cadence: "Reference", description: "Suggested repository taxonomy for cloud operations documentation and evidence.",
    items: items("repository", [["Scope", "Contract & Scope"], ["Architecture", "Architecture"], ["Inventory", "Cloud Inventory"], ["Monitoring", "Monitoring"], ["Compute", "Compute"], ["Storage", "Storage"], ["Network", "Network"], ["IAM", "IAM"], ["Backup & DR", "Backup & DR"], ["Patching", "Patching"], ["Capacity", "Capacity & Performance"], ["Security", "Security"], ["Platform", "Containers & Serverless"], ["Automation", "Automation"], ["FinOps", "FinOps"], ["Incidents", "Incidents & Problems"], ["Changes", "Changes"], ["Vendor", "Vendor Cases"], ["Risks", "Risks & CSI"], ["Runbooks", "Runbooks"], ["Evidence", "Reports & Audit Evidence"]]),
  },
];

export const cadenceOrder: Cadence[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Annual", "Reference"];

export const allChecklistItems = checklistDefinitions.flatMap((definition) => definition.items.map((item) => ({ ...item, checklistId: definition.id, checklistName: definition.name, cadence: definition.cadence })));

export function getChecklistDefinition(id: string) {
  return checklistDefinitions.find((definition) => definition.id === id) ?? checklistDefinitions[0];
}
