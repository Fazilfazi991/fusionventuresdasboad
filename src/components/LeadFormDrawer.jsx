import { X } from 'lucide-react';

const leadStatusOptions = ['New Lead', 'Follow-up', 'Meeting', 'Proposal Shared', 'Converted', 'In Progress', 'Lost'];
const workStatusOptions = ['Not Started', 'Discussion', 'Need Editor', 'Proposal Sent', 'Development', 'Work Started', 'Pending', 'Completed'];
const leadByOptions = ['Ayisha', 'Fazil', 'Thameem'];

const emptyLead = {
  client: '',
  service: '',
  contactPerson: '',
  phone: '',
  email: '',
  source: '',
  estimated: '',
  received: '',
  leadStatus: 'New Lead',
  workStatus: 'Not Started',
  leadBy: 'Ayisha',
  followUpDate: '',
  nextAction: '',
  notes: '',
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function inputClass() {
  return 'h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500';
}

export function LeadFormDrawer({ mode, lead, onClose, onSave }) {
  if (!mode) return null;

  const form = lead || emptyLead;
  const estimated = Number(form.estimated) || 0;
  const received = Number(form.received) || 0;
  const balance = estimated - received;

  const updateField = (key, value) => {
    onSave({ ...form, [key]: value }, false);
  };

  const submit = (event) => {
    event.preventDefault();
    const required = ['client', 'service', 'estimated', 'leadBy', 'leadStatus', 'workStatus'];
    const missing = required.some((key) => !String(form[key] ?? '').trim());
    if (missing) return;
    onSave(
      {
        ...form,
        estimated,
        received,
        balance,
      },
      true,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" aria-label="Close lead form" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <form onSubmit={submit} className="flex min-h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">{mode === 'add' ? 'Add Lead' : 'Edit Lead'}</h2>
              <p className="mt-1 text-sm text-zinc-500">Update CRM details, payment status and next action.</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-7 px-4 py-5 sm:px-6 sm:py-6">
            <section>
              <h3 className="text-sm font-semibold text-zinc-950">Basic Info</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Client Name">
                  <input className={inputClass()} value={form.client} onChange={(event) => updateField('client', event.target.value)} required />
                </Field>
                <Field label="Service">
                  <input className={inputClass()} value={form.service} onChange={(event) => updateField('service', event.target.value)} required />
                </Field>
                <Field label="Contact Person">
                  <input className={inputClass()} value={form.contactPerson || ''} onChange={(event) => updateField('contactPerson', event.target.value)} />
                </Field>
                <Field label="Phone">
                  <input className={inputClass()} value={form.phone || ''} onChange={(event) => updateField('phone', event.target.value)} />
                </Field>
                <Field label="Email">
                  <input className={inputClass()} value={form.email || ''} onChange={(event) => updateField('email', event.target.value)} />
                </Field>
                <Field label="Source">
                  <input className={inputClass()} value={form.source || ''} onChange={(event) => updateField('source', event.target.value)} />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-950">Payment Details</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Estimated Amount">
                  <input type="number" className={inputClass()} value={form.estimated} onChange={(event) => updateField('estimated', event.target.value)} required />
                </Field>
                <Field label="Received Amount">
                  <input type="number" className={inputClass()} value={form.received} onChange={(event) => updateField('received', event.target.value)} />
                </Field>
                <Field label="Balance Amount">
                  <input className={`${inputClass()} bg-zinc-50`} value={balance} readOnly />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-950">Lead Tracking</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Lead Status">
                  <select className={inputClass()} value={form.leadStatus} onChange={(event) => updateField('leadStatus', event.target.value)} required>
                    {leadStatusOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Work Status">
                  <select className={inputClass()} value={form.workStatus} onChange={(event) => updateField('workStatus', event.target.value)} required>
                    {workStatusOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Lead By">
                  <select className={inputClass()} value={form.leadBy} onChange={(event) => updateField('leadBy', event.target.value)} required>
                    {leadByOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Follow-up Date">
                  <input className={inputClass()} value={form.followUpDate} onChange={(event) => updateField('followUpDate', event.target.value)} placeholder="20 May 2025" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Next Action">
                    <input className={inputClass()} value={form.nextAction} onChange={(event) => updateField('nextAction', event.target.value)} />
                  </Field>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-950">Notes</h3>
              <textarea
                className="mt-4 min-h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                value={form.notes || ''}
                onChange={(event) => updateField('notes', event.target.value)}
              />
            </section>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 px-4 py-4 sm:flex sm:justify-end sm:px-6 sm:py-5">
            <button type="button" onClick={onClose} className="h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit" className="h-11 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800">
              {mode === 'add' ? 'Save Lead' : 'Save Changes'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
