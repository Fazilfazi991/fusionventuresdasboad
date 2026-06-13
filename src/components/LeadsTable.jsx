import { CalendarDays, ChevronsUpDown } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge.jsx';
import { LeadRowActions } from './LeadRowActions.jsx';
import { WorkStatusBadge } from './WorkStatusBadge.jsx';

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

function HeaderCell({ children, align = 'left' }) {
  return (
    <th className={`border-b border-r border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-950 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <span className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {children}
        <ChevronsUpDown className="h-3 w-3 text-zinc-400" />
      </span>
    </th>
  );
}

export function LeadsTable({ leads, totals, onEdit }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] border-collapse text-sm">
          <thead>
            <tr>
              <HeaderCell>Client</HeaderCell>
              <HeaderCell>Service</HeaderCell>
              <HeaderCell align="right">Estimated (AED)</HeaderCell>
              <HeaderCell align="right">Received (AED)</HeaderCell>
              <HeaderCell align="right">Balance (AED)</HeaderCell>
              <HeaderCell>Lead Status</HeaderCell>
              <HeaderCell>Work Status</HeaderCell>
              <HeaderCell>Lead By</HeaderCell>
              <HeaderCell>Next Action</HeaderCell>
              <HeaderCell>Follow-up Date</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const balance = lead.estimated - lead.received;
              return (
                <tr key={`${lead.client}-${lead.followUpDate}`} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50">
                  <td className="border-r border-zinc-100 px-4 py-3 font-semibold text-zinc-950">{lead.client}</td>
                  <td className="border-r border-zinc-100 px-4 py-3 text-zinc-700">{lead.service}</td>
                  <td className="border-r border-zinc-100 px-4 py-3 text-right tabular-nums text-zinc-950">{formatNumber(lead.estimated)}</td>
                  <td className="border-r border-zinc-100 px-4 py-3 text-right tabular-nums text-zinc-950">{formatNumber(lead.received)}</td>
                  <td className="border-r border-zinc-100 px-4 py-3 text-right tabular-nums text-zinc-950">{formatNumber(balance)}</td>
                  <td className="border-r border-zinc-100 px-4 py-3">
                    <button type="button" onClick={() => onEdit(lead)}>
                      <LeadStatusBadge value={lead.leadStatus} />
                    </button>
                  </td>
                  <td className="border-r border-zinc-100 px-4 py-3">
                    <button type="button" onClick={() => onEdit(lead)}>
                      <WorkStatusBadge value={lead.workStatus} />
                    </button>
                  </td>
                  <td className="border-r border-zinc-100 px-4 py-3 font-medium text-zinc-700">{lead.leadBy}</td>
                  <td className="border-r border-zinc-100 px-4 py-3 text-zinc-700">{lead.nextAction}</td>
                  <td className="border-r border-zinc-100 px-4 py-3 text-zinc-700">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      {lead.followUpDate}
                      <CalendarDays className="h-4 w-4 text-zinc-400" />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <LeadRowActions onEdit={() => onEdit(lead)} />
                  </td>
                </tr>
              );
            })}
            <tr className="bg-zinc-50 font-semibold text-zinc-950">
              <td className="border-r border-zinc-100 px-4 py-4">Total</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-zinc-500">-</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-right tabular-nums">{formatNumber(totals.estimated)}</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-right tabular-nums">{formatNumber(totals.received)}</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-right tabular-nums">{formatNumber(totals.balance)}</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-center text-zinc-500">-</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-center text-zinc-500">-</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-center text-zinc-500">-</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-center text-zinc-500">-</td>
              <td className="border-r border-zinc-100 px-4 py-4 text-center text-zinc-500">-</td>
              <td className="px-4 py-4 text-center text-zinc-500">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
