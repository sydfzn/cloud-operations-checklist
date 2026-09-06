import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ClipboardCheck, Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import { lifecycleChecklistSections, type LifecycleSectionId } from "@shared/lifecycleData";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

 type Status = "open" | "done" | "blocked";
 type StatusMap = Record<string, Status>;
 type RemarksMap = Record<string, string>;
 type Metadata = { dueDate?: string | null; ownerMappingId?: number | null; ownerName?: string | null; ownerEmail?: string | null };
 type MetadataMap = Record<string, Metadata>;

const statusLabel: Record<Status, string> = { open: "Open", done: "Complete", blocked: "Blocked" };

export default function Lifecycle() {
  const [location, navigate] = useLocation();
  const customersQuery = trpc.checklist.workspaceCustomers.useQuery();
  const customers = customersQuery.data ?? [];
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<LifecycleSectionId>("kyc");
  const [query, setQuery] = useState("");
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [remarks, setRemarks] = useState<RemarksMap>({});
  const section = lifecycleChecklistSections.find((item) => item.id === sectionId) ?? lifecycleChecklistSections[0];
  const selectedCustomer = customers.find((customer: { id: number }) => customer.id === customerId);
  const sectionEnabled = Boolean(selectedCustomer?.assignments?.some((assignment: { checklistId: string }) => assignment.checklistId === `lifecycle-${section.id}`));
  const enabledSectionIds = new Set((selectedCustomer?.assignments ?? []).map((assignment: { checklistId: string }) => assignment.checklistId));
  const runDate = new Date().toISOString().slice(0, 10);
  const runQuery = trpc.checklist.loadRun.useQuery({ customerId: customerId ?? 0, checklistId: `lifecycle-${section.id}`, runDate }, { enabled: Boolean(customerId) });
  const saveItem = trpc.checklist.saveItem.useMutation();
  const metadataQuery = trpc.checklist.metadata.useQuery({ customerId: customerId ?? 0, checklistId: `lifecycle-${section.id}` }, { enabled: Boolean(customerId && sectionEnabled) });
  const saveMetadata = trpc.checklist.saveMetadata.useMutation({ onSuccess: () => metadataQuery.refetch() });
  const [metadata, setMetadata] = useState<MetadataMap>({});

  useEffect(() => { if (customerId === null && customers[0]) setCustomerId(customers[0].id); }, [customers, customerId]);
  useEffect(() => { const requested = new URLSearchParams(location.split("?")[1] ?? "").get("section") as LifecycleSectionId | null; if (requested && lifecycleChecklistSections.some((item) => item.id === requested)) setSectionId(requested); }, [location]);
  useEffect(() => {
    const nextMetadata: MetadataMap = {};
    (metadataQuery.data ?? []).forEach((entry: { itemId: string; dueDate?: string | null; ownerMappingId?: number | null; ownerName?: string | null; ownerEmail?: string | null }) => { nextMetadata[entry.itemId] = { dueDate: entry.dueDate, ownerMappingId: entry.ownerMappingId, ownerName: entry.ownerName, ownerEmail: entry.ownerEmail }; });
    setMetadata(nextMetadata);
  }, [metadataQuery.data, section.id]);
  useEffect(() => {
    const nextStatus: StatusMap = {};
    const nextRemarks: RemarksMap = {};
    (runQuery.data?.items ?? []).forEach((item: { itemId: string; status: Status; remarks?: string | null }) => {
      nextStatus[item.itemId] = item.status;
      if (item.remarks) nextRemarks[item.itemId] = item.remarks;
    });
    setStatusMap(nextStatus);
    setRemarks(nextRemarks);
  }, [runQuery.data, sectionId, customerId]);

  const visibleItems = useMemo(() => sectionEnabled ? section.items.filter((item) => `${item.category} ${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())) : [], [section.items, query, sectionEnabled]);
  const completed = section.items.filter((item) => statusMap[item.id] === "done").length;
  const blocked = section.items.filter((item) => statusMap[item.id] === "blocked").length;
  const completion = section.items.length ? Math.round((completed / section.items.length) * 100) : 0;

  const updateItem = (itemId: string, nextStatus: Status) => {
    setStatusMap((current) => ({ ...current, [itemId]: nextStatus }));
    if (!customerId) return;
    saveItem.mutate({ customerId, checklistId: `lifecycle-${section.id}`, runDate, itemId, status: nextStatus, remarks: remarks[itemId] ?? null });
  };

  const saveMetadataEntry = (itemId: string, next: Metadata) => {
    const nextMetadata = { ...metadata, [itemId]: next };
    setMetadata(nextMetadata);
    if (!customerId) return;
    saveMetadata.mutate({ customerId, checklistId: `lifecycle-${section.id}`, entries: Object.entries(nextMetadata).map(([entryId, entry]) => ({ itemId: entryId, dueDate: entry.dueDate || null, ownerMappingId: entry.ownerMappingId ?? null, ownerName: entry.ownerName || null, ownerEmail: entry.ownerEmail || null })) });
  };

  const saveRemark = (itemId: string, value: string) => {
    setRemarks((current) => ({ ...current, [itemId]: value }));
    if (!customerId) return;
    saveItem.mutate({ customerId, checklistId: `lifecycle-${section.id}`, runDate, itemId, status: statusMap[itemId] ?? "open", remarks: value || null });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1220px] space-y-7 px-5 py-8 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <button onClick={() => navigate("/")} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Back to operations</button>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Customer lifecycle workspace</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Service onboarding & readiness</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Run each customer through KYC, transition, onboarding, and operational-readiness gates before steady-state operations begin.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected customer</p><select value={customerId ?? ""} onChange={(event) => setCustomerId(Number(event.target.value))} className="mt-1 max-w-[210px] bg-transparent text-sm font-semibold text-slate-900 outline-none"><option value="">Select customer</option>{customers.map((customer: { id: number; name: string }) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {lifecycleChecklistSections.map((item) => {
            const count = item.items.filter((entry) => statusMap[entry.id] === "done").length;
            const enabled = enabledSectionIds.has(`lifecycle-${item.id}`);
            return <button key={item.id} disabled={!enabled} onClick={() => setSectionId(item.id)} className={`rounded-2xl border p-4 text-left transition ${section.id === item.id ? "border-emerald-300 bg-emerald-50 shadow-sm" : enabled ? "border-slate-200 bg-white hover:border-emerald-200" : "border-slate-200 bg-slate-50 opacity-60"}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-900">{item.label}</span><span className={`text-xs font-bold ${enabled ? "text-emerald-700" : "text-slate-400"}`}>{enabled ? `${count}/${item.items.length}` : "Not assigned"}</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p></button>;
          })}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">{section.label}</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">{completed} of {section.items.length} complete</h2><p className="mt-1 text-sm text-slate-500">{blocked} blocked · {completion}% completion · lead validation uses the same customer boundary.</p></div>
          <div className="w-full max-w-xs"><div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>Progress</span><span>{completion}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} /></div></div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h3 className="font-semibold text-slate-950">{section.items.length} control points</h3><p className="mt-1 text-sm text-slate-500">Source: {section.source}</p></div><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search controls" className="w-44 bg-transparent outline-none" /></label></div>
          {!customerId ? <div className="p-8 text-sm text-slate-500">Select a customer workspace to begin.</div> : !sectionEnabled ? <div className="p-8 text-sm text-slate-500">This lifecycle section is not assigned to the selected customer. Enable it from Customer inventory before starting the review.</div> : runQuery.isLoading ? <div className="flex items-center gap-2 p-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading customer progress…</div> : <div className="divide-y divide-slate-100">{visibleItems.map((item) => { const status = statusMap[item.id] ?? "open"; return <div key={item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_180px]"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Phase {item.phase}</span><span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.category}</span>{item.owner && <span className="text-xs text-slate-400">Owner: {item.owner}</span>}</div><h4 className="mt-2 font-semibold text-slate-900">{item.title}</h4>{item.description && <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>}<input value={remarks[item.id] ?? ""} onChange={(event) => setRemarks((current) => ({ ...current, [item.id]: event.target.value }))} onBlur={(event) => saveRemark(item.id, event.target.value)} placeholder="Add evidence or remark" className="mt-3 w-full border-b border-slate-200 bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500" /><div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Due date<input type="date" value={metadata[item.id]?.dueDate ?? ""} onChange={(event) => saveMetadataEntry(item.id, { ...metadata[item.id], dueDate: event.target.value || null })} className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500" /></label><label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Owner<select value={metadata[item.id]?.ownerMappingId ?? ""} onChange={(event) => { const mappingId = Number(event.target.value); const owner = selectedCustomer?.leads?.find((lead: { directoryUserMappingId?: number | null }) => lead.directoryUserMappingId === mappingId); saveMetadataEntry(item.id, { ...metadata[item.id], ownerMappingId: mappingId || null, ownerName: owner?.displayName ?? null, ownerEmail: owner?.directoryEmail ?? null }); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"><option value="">Unassigned</option>{(selectedCustomer?.leads ?? []).map((lead: { directoryUserMappingId?: number | null; displayName?: string | null; directoryEmail?: string | null }) => <option key={lead.directoryUserMappingId ?? lead.directoryEmail} value={lead.directoryUserMappingId ?? ""}>{lead.displayName ?? lead.directoryEmail}</option>)}</select></label></div></div><div className="flex items-center gap-2 lg:justify-end"><select value={status} onChange={(event) => updateItem(item.id, event.target.value as Status)} className={`rounded-xl border px-3 py-2 text-sm font-semibold outline-none ${status === "done" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "blocked" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{(Object.keys(statusLabel) as Status[]).map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select>{status === "done" && <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-4 w-4" /></span>}</div></div>; })}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
