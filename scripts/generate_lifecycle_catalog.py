from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path('/home/ubuntu/cloud-operations-checklist')
INPUTS = [
    Path('/home/ubuntu/upload/AMSITManagedServices-KYCChecklist.normalized.json'),
    Path('/home/ubuntu/upload/AMSITManagedServices-TransitionChecklist.normalized.json'),
    Path('/home/ubuntu/upload/AMSITManagedServices-OnboardingChecklist.normalized.json'),
    Path('/home/ubuntu/upload/AMSITManagedServices-OperationalChecklist.normalized.json'),
]
SECTION_META = {
    'KYC': ('Sales to Delivery KYC', 'Pre-delivery customer due diligence and commercial-to-technical handoff.'),
    'TRANSITION': ('Service Transition', 'Controlled transfer of knowledge, ownership, access, and operational responsibility.'),
    'ONBOARDING': ('Managed Services Onboarding', 'Customer discovery, access, tooling, documentation, and service activation.'),
    'OPERATIONAL_READINESS': ('Operational Readiness', 'Go-live readiness checks for support, monitoring, security, continuity, and governance.'),
}

def clean(value):
    return str(value).strip() if value is not None else ''

def section_key(filename):
    if 'KYC' in filename: return 'KYC'
    if 'Transition' in filename: return 'TRANSITION'
    if 'Onboarding' in filename: return 'ONBOARDING'
    return 'OPERATIONAL_READINESS'

def is_header(record):
    values = {clean(value).lower() for value in record.values() if clean(value)}
    return {'s. no', 'phase', 'activity'}.issubset(values) or {'category', 'assessment item'}.issubset(values)

def numeric_value(record):
    for value in record.values():
        if re.fullmatch(r'\d+(?:\.\d+)?', clean(value)):
            return clean(value)
    return ''

def build_item(section, index, record, previous_phase):
    values = [clean(value) for value in record.values()]
    if section == 'KYC':
        category = clean(record.get('Category')) or 'Assessment'
        title = clean(record.get('Assessment Item'))
        description = clean(record.get('Description'))
        owner = ''
    else:
        category = clean(record.get('column_2')) or previous_phase or 'Readiness'
        title = clean(record.get('column_3'))
        description = clean(record.get('column_4'))
        owner = clean(record.get('column_5'))
    if not title:
        candidates = [value for value in values if value and not value.isdigit() and value not in {category, description, owner}]
        title = candidates[0] if candidates else f'Control point {index}'
    if title.lower() in {'s. no', 'phase', 'activity', 'description', 'owner', 'status', 'remarks'}:
        return None
    phase = numeric_value(record) or previous_phase or '1'
    return {
        'id': f'{section.lower()}-{index:03d}',
        'category': category,
        'phase': phase,
        'title': title,
        'description': description,
        'owner': owner,
    }

sections = []
for source in INPUTS:
    payload = json.loads(source.read_text(encoding='utf-8'))
    section = section_key(source.name)
    previous_phase = ''
    items = []
    for raw in payload['records']:
        if is_header(raw):
            continue
        explicit_phase = numeric_value(raw)
        if explicit_phase:
            previous_phase = explicit_phase
        item = build_item(section, len(items) + 1, raw, previous_phase)
        if item:
            items.append(item)
    label, description = SECTION_META[section]
    sections.append({'id': section.lower(), 'label': label, 'description': description, 'source': source.name, 'items': items})

lines = [
    'export type LifecycleSectionId = "kyc" | "transition" | "onboarding" | "operational_readiness";',
    '',
    'export interface LifecycleChecklistItem {',
    '  id: string;',
    '  category: string;',
    '  phase: string;',
    '  title: string;',
    '  description: string;',
    '  owner: string;',
    '}',
    '',
    'export interface LifecycleChecklistSection {',
    '  id: LifecycleSectionId;',
    '  label: string;',
    '  description: string;',
    '  source: string;',
    '  items: LifecycleChecklistItem[];',
    '}',
    '',
    f'export const lifecycleChecklistSections: LifecycleChecklistSection[] = {json.dumps(sections, indent=2, ensure_ascii=False)};',
    '',
    'export const lifecycleChecklistById = Object.fromEntries(lifecycleChecklistSections.map((section) => [section.id, section]));',
]
(ROOT / 'shared/lifecycleData.ts').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(json.dumps({'sections': [{'id': section['id'], 'label': section['label'], 'source': section['source'], 'items': len(section['items'])} for section in sections], 'total_items': sum(len(section['items']) for section in sections)}, indent=2))
