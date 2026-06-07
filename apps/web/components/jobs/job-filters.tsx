'use client';

import type { Filters } from './job-board';

const DEPARTMENTS = ['Engineering', 'Product', 'Data', 'AI/ML', 'Infrastructure', 'Design'];

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
};

export function JobFilters({ filters, onChange, onClear }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Filters</p>
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Work Mode */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Work Mode</label>
          <select
            value={filters.workMode}
            onChange={(e) => onChange({ ...filters, workMode: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          >
            <option value="">Any</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</label>
          <select
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          >
            <option value="">Any</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Experience min */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Experience (yrs)</label>
          <input
            type="number"
            min={0}
            max={20}
            value={filters.experienceMin}
            onChange={(e) => onChange({ ...filters, experienceMin: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          />
        </div>

        {/* Experience max */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Experience (yrs)</label>
          <input
            type="number"
            min={0}
            max={20}
            value={filters.experienceMax}
            onChange={(e) => onChange({ ...filters, experienceMax: e.target.value })}
            placeholder="10"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>
    </div>
  );
}
