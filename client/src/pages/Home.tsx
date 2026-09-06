import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Cloud,
  ClipboardCheck,
  Clock3,
  FileText,
  Filter,
  LayoutDashboard,
  ListFilter,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import { checklistDefinitions, cadenceOrder, type Cadence } from "@shared/checklistData";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

 type Status = "open" | "done" | "blocked";
 type StatusMap = Record<string, Status>;
 type RemarksMap = Record<string, string>;

const statusMeta: Record<Status, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-slate-100 text-slate-600" },
  done: { label: "Complete", className: "bg-emerald-50 text-emerald-700" },
  blocked: { label: "Blocked", className: "bg-rose-50 text-rose-700" },
};

function loadState<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }).format(new Date());
}

export default function Home() {
  const [, setLocation] = useLocation();
  const assignedCustomersQuery = trpc.checklist.workspaceCustomers.useQuery();
  const assignedCustomers = assignedCustomersQuery.data ?? [];
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [activeCadence, setActiveCadence] = useState<Cadence>("Daily");
  const cadenceLists = useMemo(() => cadenceOrder.map((cadence) => ({ cadence, items: checklistDefinitions.filter((item) => item.cadence === cadence) })), []);
  const cadenceDefinitions = cadenceLists.find((group) => group.cadence === activeCadence)?.items ?? [];
  const [selectedId, setSelectedId] = useState(cadenceDefinitions[0]?.id ?? "daily-operational");
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [remarks, setRemarks] = useState<RemarksMap>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalation, setEscalation] = useState({ owner: "", action: "", priority: "P1/P2", due: "" });
  const [savedToast, setSavedToast] = useState(false);
  const selectedCustomer = assignedCustomers.find((customer) => customer.id === customerId) ?? null;
  const runDate = new Date().toISOString().slice(0, 10);
  const runQuery = trpc.checklist.loadRun.useQuery({ customerId: customerId ?? 0, checklistId: selectedId, runDate }, { enabled: Boolean(customerId && selectedId) });
  const saveItemMutation = trpc.checklist.saveItem.useMutation();

  useEffect(() => { if (customerId === null && assignedCustomers[0]) setCustomerId(assignedCustomers[0].id); }, [assignedCustomers, customerId]);
  useEffect(() => { setStatusMap({}); setRemarks({}); }, [customerId, selectedId]);
  useEffect(() => { if (runQuery.data) { const nextStatuses: StatusMap = {}; const nextRemarks: RemarksMap = {}; runQuery.data.items.forEach((item: { itemId: string; status: "open" | "done" | "blocked"; remarks?: string | null }) => { nextStatuses[item.itemId] = item.status; if (item.remarks) nextRemarks[item.itemId] = item.remarks; }); setStatusMap(nextStatuses); setRemarks(nextRemarks); } }, [runQuery.data]);

  const active = checklistDefinitions.find((definition) => definition.id === selectedId) ?? checklistDefinitions[0];
  const categories = ["all", ...Array.from(new Set(active.items.map((item) => item.category)))];
  const visibleItems = active.items.filter((item) => {
    const matchesQuery = `${item.activity} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (statusMap[item.id] ?? "open") === filter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesQuery && matchesFilter && matchesCategory;
  });
  const completed = active.items.filter((item) => statusMap[item.id] === "done").length;
  const blocked = active.items.filter((item) => statusMap[item.id] === "blocked").length;
  const progress = active.items.length ? Math.round((completed / active.items.length) * 100) : 0;
  const allOpen = checklistDefinitions.flatMap((definition) => definition.items).filter((item) => (statusMap[item.id] ?? "open") === "open").length;

  function chooseCadence(cadence: Cadence) {
    setActiveCadence(cadence);
    const next = checklistDefinitions.find((definition) => definition.cadence === cadence);
    if (next) setSelectedId(next.id);
    setQuery("");
    setFilter("all");
    setCategoryFilter("all");
    setShowMobileNav(false);
  }

  function persistItem(itemId: string, nextStatus: Status, nextRemark?: string | null) {
    if (!customerId) return;
    saveItemMutation.mutate({ customerId, checklistId: selectedId, runDate, itemId, status: nextStatus, remarks: nextRemark ?? remarks[itemId] ?? null });
  }

  function recordSnapshot(nextStatuses: StatusMap) {
    const allItems = checklistDefinitions.flatMap((definition) => definition.items);
    const dailyItems = checklistDefinitions.filter((definition) => definition.cadence === "Daily").flatMap((definition) => definition.items);
    const done = allItems.filter((item) => nextStatuses[item.id] === "done").length;
    const blocked = allItems.filter((item) => nextStatuses[item.id] === "blocked").length;
    const dailyDone = dailyItems.filter((item) => nextStatuses[item.id] === "done").length;
    const snapshot = { date: new Date().toISOString().slice(0, 10), completion: dailyItems.length ? Math.round((dailyDone / dailyItems.length) * 100) : 0, health: allItems.length ? Math.max(0, 100 - Math.round((blocked / allItems.length) * 100)) : 100, open: allItems.length - done - blocked, blocked };
    const history = loadState<Array<typeof snapshot>>(customerId ? `cloud-ops-history-${customerId}` : "cloud-ops-history", []);
    const nextHistory = [...history.filter((entry) => entry.date !== snapshot.date), snapshot].slice(-90);
    window.localStorage.setItem(customerId ? `cloud-ops-history-${customerId}` : "cloud-ops-history", JSON.stringify(nextHistory));
  }

  function updateStatus(itemId: string, status: Status) {
    const next = { ...statusMap, [itemId]: status };
    setStatusMap(next);
    recordSnapshot(next);
    persistItem(itemId, status, remarks[itemId] ?? null);
  }

  function updateRemark(itemId: string, value: string) {
    const next = { ...remarks, [itemId]: value };
    setRemarks(next);
    persistItem(itemId, statusMap[itemId] ?? "open", value);
  }

  function saveRun() {
    if (customerId) active.items.forEach((item) => persistItem(item.id, statusMap[item.id] ?? "open", remarks[item.id] ?? null));
    recordSnapshot(statusMap);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2200);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-[#0d1b2a] px-4 py-5 text-white transition-transform duration-200 lg:translate-x-0 ${showMobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#36c5a0] text-[#0d1b2a]"><Cloud className="h-5 w-5" /></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8ea3b5]">Ops cockpit</p><p className="mt-0.5 text-sm font-semibold tracking-tight">Northstar Cloud</p></div>
        </div>
        <div className="mb-6 px-2"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6e8496]">Workspace</p><div className="relative mt-2"><select value={customerId ?? ""} onChange={(event) => setCustomerId(Number(event.target.value))} className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/[0.06] px-3 pr-8 text-left text-sm text-slate-200 outline-none focus:border-[#36c5a0]" aria-label="Select customer workspace"><option value="">{assignedCustomersQuery.isLoading ? "Loading customers…" : "Select customer"}</option>{assignedCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.code}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></div></div>
        <nav className="space-y-1"><NavItem icon={<LayoutDashboard />} label="Overview" active /><NavItem icon={<ClipboardCheck />} label="Checklists" /><NavItem icon={<BarChart3 />} label="Analytics" onClick={() => setLocation("/analytics")} /><NavItem icon={<ClipboardCheck />} label="Sales-to-Delivery KYC" onClick={() => setLocation("/lifecycle?section=kyc")} /><NavItem icon={<ClipboardCheck />} label="Service Transition" onClick={() => setLocation("/lifecycle?section=transition")} /><NavItem icon={<ClipboardCheck />} label="Managed Services Onboarding" onClick={() => setLocation("/lifecycle?section=onboarding")} /><NavItem icon={<ClipboardCheck />} label="Operational Readiness" onClick={() => setLocation("/lifecycle?section=operational_readiness")} /><NavItem icon={<Building2 />} label="Customers" onClick={() => setLocation("/customers")} /><NavItem icon={<UserCheck />} label="Lead review" onClick={() => setLocation("/lead-review")} /><NavItem icon={<Bell />} label="Escalations" badge="3" /><NavItem icon={<ShieldCheck />} label="Compliance" /><NavItem icon={<FileText />} label="Artifacts" /></nav>
        <div className="mt-8 px-2"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6e8496]">Review cadence</p><div className="space-y-1">{cadenceOrder.slice(0, 5).map((cadence) => <button key={cadence} onClick={() => chooseCadence(cadence)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${activeCadence === cadence ? "bg-[#36c5a0]/15 font-medium text-[#6fe1be]" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"}`}><span>{cadence}</span><span className="text-xs text-slate-500">{checklistDefinitions.filter((definition) => definition.cadence === cadence).length}</span></button>)}</div></div>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.05] p-3"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#6fe1be]" /><p className="text-xs font-medium text-slate-200">Ops pulse</p></div><p className="mt-2 text-xs leading-5 text-slate-400">Keep your daily health pass tight. Escalate early, document once.</p></div>
        <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#d9e4ee] text-xs font-bold text-[#0d1b2a]">AM</div><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">Alex Morgan</p><p className="truncate text-[11px] text-slate-500">Cloud operations</p></div><MoreHorizontal className="ml-auto h-4 w-4 text-slate-500" /></div>
      </aside>

      <main className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/90 bg-[#f6f8fb]/90 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-500 hover:bg-white lg:hidden" onClick={() => setShowMobileNav(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><div className="flex items-center gap-2 text-xs text-slate-500"><span>Operations</span><span className="text-slate-300">/</span><span className="font-medium text-slate-700">Overview</span></div><h1 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#102235]">Daily operations control room</h1></div></div><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 sm:flex"><Clock3 className="h-3.5 w-3.5" /> Last sync 08:42 UTC</div><button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:text-slate-800" aria-label="Notifications"><Bell className="h-4 w-4" /></button></div></header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">
          <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#159b7d]"><span className="h-2 w-2 rounded-full bg-[#36c5a0] shadow-[0_0_0_4px_rgba(54,197,160,0.14)]" /> System posture: nominal</div><h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#102235] md:text-[38px]">Good morning, Alex.<br /><span className="text-slate-400">Let’s keep the estate healthy.</span></h2><p className="mt-3 text-sm text-slate-500">{formatDate()} <span className="mx-2 text-slate-300">•</span> {selectedCustomer?.name ?? "Select a customer"} <span className="mx-2 text-slate-300">•</span> {allOpen} open actions across the workspace</p></div><div className="flex items-center gap-2"><button onClick={saveRun} className="inline-flex items-center gap-2 rounded-lg bg-[#102235] px-4 py-2.5 text-sm font-medium text-white shadow-[0_7px_18px_rgba(16,34,53,0.15)] transition hover:bg-[#18344f] active:scale-[0.98]"><CheckCircle2 className="h-4 w-4 text-[#6fe1be]" /> Save review</button><button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:text-slate-900" aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></button></div></section>

          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Today\'s completion" value={`${progress}%`} note={`${completed} of ${active.items.length} in current review`} icon={<Target />} accent="teal" /><Metric label="Open actions" value={String(allOpen)} note="Across all cadences" icon={<Clock3 />} accent="amber" /><Metric label="Blocked items" value={String(blocked)} note="Needs operator attention" icon={<AlertTriangle />} accent="rose" /><Metric label="Service posture" value="99.98%" note="Availability, last 24 hours" icon={<ShieldCheck />} accent="blue" /></section>

          <section className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_3px_12px_rgba(16,34,53,0.03)] md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-1 overflow-x-auto">{cadenceOrder.map((cadence) => <button key={cadence} onClick={() => chooseCadence(cadence)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium transition ${activeCadence === cadence ? "bg-[#102235] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>{cadence}</button>)}</div><div className="flex flex-wrap items-center gap-2 px-1"><div className="relative flex-1 md:w-48"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search checklist" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-[#36c5a0] focus:bg-white" /></div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 outline-none focus:border-[#36c5a0]" aria-label="Filter by resource area">{categories.map((category) => <option key={category} value={category}>{category === "all" ? "All areas" : category}</option>)}</select><button onClick={() => setFilter(filter === "all" ? "open" : filter === "open" ? "done" : filter === "done" ? "blocked" : "all")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"><ListFilter className="h-3.5 w-3.5" /> {filter === "all" ? "All" : statusMeta[filter].label}</button></div></section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(16,34,53,0.04)]"><div className="border-b border-slate-100 px-5 py-5 md:px-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="mb-2 flex items-center gap-2"><span className="rounded-md bg-[#e8f8f4] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#148b71]">{activeCadence}</span><span className="text-xs text-slate-400">{active.items.length} control points</span></div><h3 className="text-xl font-semibold tracking-[-0.025em] text-[#102235]">{active.name}</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{active.description}</p></div><div className="min-w-[160px] rounded-lg bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-slate-600">Progress</span><span className="font-semibold text-[#159b7d]">{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#36c5a0] transition-all duration-300" style={{ width: `${progress}%` }} /></div></div></div></div><div className="divide-y divide-slate-100">{visibleItems.length === 0 ? <div className="px-6 py-16 text-center"><Filter className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No controls match this view</p><p className="mt-1 text-xs text-slate-400">Try clearing the search or status filter.</p></div> : visibleItems.map((item, index) => <ChecklistRow key={item.id} item={item} index={index} status={statusMap[item.id] ?? "open"} remark={remarks[item.id] ?? ""} onStatusChange={updateStatus} onRemarkChange={updateRemark} />)}</div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 md:px-6"><p className="text-xs text-slate-400">Showing {visibleItems.length} of {active.items.length} control points</p><button className="inline-flex items-center gap-1 text-xs font-semibold text-[#159b7d] hover:text-[#0e765f]">View audit history <ArrowUpRight className="h-3.5 w-3.5" /></button></div></div>

            <aside className="space-y-5"><div className="rounded-xl bg-[#102235] p-5 text-white shadow-[0_8px_24px_rgba(16,34,53,0.14)]"><div className="flex items-start justify-between"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#36c5a0]/15 text-[#6fe1be]"><MessageSquareText className="h-5 w-5" /></div><span className="rounded-full bg-[#36c5a0]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6fe1be]">Operator note</span></div><h4 className="mt-5 text-lg font-semibold tracking-tight">Keep the handoff clean.</h4><p className="mt-2 text-sm leading-6 text-slate-400">Every blocked item should have a clear owner, next action, and expected resolution time.</p><button onClick={() => setShowEscalation(true)} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#6fe1be]">Capture an escalation <ArrowUpRight className="h-3.5 w-3.5" /></button></div><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-[#102235]">Review snapshot</h4><SlidersHorizontal className="h-4 w-4 text-slate-400" /></div><div className="mt-4 space-y-4"><SnapshotRow label="Checks completed" value={`${completed}/${active.items.length}`} progress={progress} color="bg-[#36c5a0]" /><SnapshotRow label="With remarks" value={String(active.items.filter((item) => remarks[item.id]).length)} progress={active.items.length ? Math.round((active.items.filter((item) => remarks[item.id]).length / active.items.length) * 100) : 0} color="bg-[#7c8cf8]" /><SnapshotRow label="Needs attention" value={String(blocked)} progress={active.items.length ? Math.round((blocked / active.items.length) * 100) : 0} color="bg-[#fb7185]" /></div><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-[11px] leading-5 text-slate-400">Checklist states and daily snapshots are saved locally in this workspace for continuity while you work.</p></div></div><div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5"><div className="flex items-center gap-2 text-slate-700"><ShieldCheck className="h-4 w-4 text-[#159b7d]" /><p className="text-sm font-semibold">Evidence readiness</p></div><p className="mt-2 text-xs leading-5 text-slate-500">Compliance, artifacts, and repository controls are available in the sidebar for your next review.</p></div></aside></section>
        </div>
      </main>
      {showEscalation && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#159b7d]">Escalation capture</p><h3 className="mt-2 text-xl font-semibold tracking-tight text-[#102235]">Make the next action clear.</h3></div><button onClick={() => setShowEscalation(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close escalation capture"><X className="h-4 w-4" /></button></div><div className="mt-5 space-y-3"><input value={escalation.owner} onChange={(event) => setEscalation({ ...escalation, owner: event.target.value })} placeholder="Owner or team" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#36c5a0]" /><textarea value={escalation.action} onChange={(event) => setEscalation({ ...escalation, action: event.target.value })} placeholder="Required action and context" rows={3} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#36c5a0]" /><div className="grid grid-cols-2 gap-3"><select value={escalation.priority} onChange={(event) => setEscalation({ ...escalation, priority: event.target.value })} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#36c5a0]"><option>P1/P2</option><option>P3</option><option>Advisory</option></select><input type="datetime-local" value={escalation.due} onChange={(event) => setEscalation({ ...escalation, due: event.target.value })} className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-[#36c5a0]" /></div></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setShowEscalation(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button><button onClick={() => { setShowEscalation(false); setSavedToast(true); window.setTimeout(() => setSavedToast(false), 2200); }} className="rounded-lg bg-[#102235] px-4 py-2 text-sm font-medium text-white">Save escalation</button></div></div></div>}
      {savedToast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#102235] px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 className="h-4 w-4 text-[#6fe1be]" /> Review saved for this workspace</div>}
      {showMobileNav && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setShowMobileNav(false)} aria-label="Close navigation" />}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge, onClick }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string; onClick?: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-white/[0.1] font-medium text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"}`}><span className={active ? "text-[#6fe1be]" : "text-slate-500"}>{icon}</span><span>{label}</span>{badge && <span className="ml-auto rounded-full bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">{badge}</span>}</button>;
}

function Metric({ label, value, note, icon, accent }: { label: string; value: string; note: string; icon: React.ReactNode; accent: "teal" | "amber" | "rose" | "blue" }) {
  const colors = { teal: "bg-[#e8f8f4] text-[#159b7d]", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-500", blue: "bg-indigo-50 text-indigo-500" };
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_3px_12px_rgba(16,34,53,0.03)]"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#102235]">{value}</p></div><div className={`grid h-9 w-9 place-items-center rounded-lg ${colors[accent]}`}>{icon}</div></div><p className="mt-3 text-[11px] text-slate-400">{note}</p></div>;
}

function ChecklistRow({ item, index, status, remark, onStatusChange, onRemarkChange }: { item: { id: string; activity: string; category: string }; index: number; status: Status; remark: string; onStatusChange: (id: string, status: Status) => void; onRemarkChange: (id: string, remark: string) => void }) {
  const [expanded, setExpanded] = useState(Boolean(remark));
  return <div className={`group px-5 py-4 transition hover:bg-slate-50/80 md:px-6 ${status === "blocked" ? "bg-rose-50/25" : ""}`}><div className="flex items-start gap-3"><button onClick={() => onStatusChange(item.id, status === "done" ? "open" : "done")} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${status === "done" ? "border-[#36c5a0] bg-[#36c5a0] text-[#102235]" : status === "blocked" ? "border-rose-300 bg-rose-50 text-rose-500" : "border-slate-300 text-transparent hover:border-[#36c5a0]"}`} aria-label={`Mark ${item.activity} ${status === "done" ? "open" : "complete"}`}>{status === "done" ? <Check className="h-3.5 w-3.5" /> : status === "blocked" ? <AlertTriangle className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}</button><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"><p className={`text-sm font-medium ${status === "done" ? "text-slate-400 line-through" : "text-slate-800"}`}>{item.activity}</p><span className="w-fit rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.category}</span></div><div className="mt-2 flex items-center gap-2"><button onClick={() => onStatusChange(item.id, status === "blocked" ? "open" : "blocked")} className={`text-[11px] font-medium ${statusMeta[status].className} rounded-md px-2 py-1 transition hover:brightness-95`}>{statusMeta[status].label}</button><button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600"><MessageSquareText className="h-3.5 w-3.5" /> {remark ? "Edit remark" : "Add remark"}</button></div>{expanded && <div className="mt-3 flex gap-2"><textarea value={remark} onChange={(event) => onRemarkChange(item.id, event.target.value)} placeholder="Add context, owner, or next action…" rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#36c5a0]" /><button onClick={() => setExpanded(false)} className="self-start rounded-md p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close remark editor"><X className="h-4 w-4" /></button></div>}</div><button className="invisible rounded-md p-1.5 text-slate-300 transition group-hover:visible hover:bg-slate-100 hover:text-slate-500" aria-label="More checklist actions"><MoreHorizontal className="h-4 w-4" /></button></div></div>;
}

function SnapshotRow({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-700">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }} /></div></div>;
}
