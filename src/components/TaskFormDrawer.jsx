import { X } from 'lucide-react';

const ventures = ['Dearelle', 'Plumlet', 'Website Builder', 'Web Development', 'Ed Tech Platform'];
const categories = [
  'Development',
  'Testing',
  'Marketing Setup',
  'Payment Testing',
  'Account Testing',
  'Marketplace Testing',
  'Lead Follow-up',
  'Planning',
  'Research',
  'Content',
];
const statuses = ['To Do', 'In Progress', 'Testing', 'Blocked', 'Completed'];
const priorities = ['High', 'Medium', 'Low'];

const emptyTask = {
  title: '',
  venture: 'Dearelle',
  category: 'Development',
  status: 'To Do',
  priority: 'Medium',
  dueDate: '',
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

const fieldClass =
  'h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500';

export function TaskFormDrawer({ mode, task, onClose, onSave }) {
  if (!mode) return null;

  const form = task || emptyTask;

  const updateField = (key, value) => {
    onSave({ ...form, [key]: value }, false);
  };

  const submit = (event) => {
    event.preventDefault();
    const required = ['title', 'venture', 'status', 'priority'];
    if (required.some((key) => !String(form[key] ?? '').trim())) return;

    const now = new Date().toISOString();
    onSave(
      {
        ...form,
        id: form.id || `task-${Date.now()}`,
        createdAt: form.createdAt || now,
        updatedAt: now,
        completedAt: form.status === 'Completed' ? form.completedAt || now : undefined,
      },
      true,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" aria-label="Close task form" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl">
        <form onSubmit={submit} className="flex min-h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">{mode === 'add' ? 'Add Task' : 'Edit Task'}</h2>
              <p className="mt-1 text-sm text-zinc-500">Tasks here are assigned to you.</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-5 px-4 py-5 sm:px-6">
            <Field label="Task Title">
              <input className={fieldClass} value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
            </Field>

            <Field label="Venture">
              <select className={fieldClass} value={form.venture} onChange={(event) => updateField('venture', event.target.value)} required>
                {ventures.map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>

            <Field label="Category">
              <select className={fieldClass} value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                {categories.map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select className={fieldClass} value={form.status} onChange={(event) => updateField('status', event.target.value)} required>
                  {statuses.map((option) => <option key={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select className={fieldClass} value={form.priority} onChange={(event) => updateField('priority', event.target.value)} required>
                  {priorities.map((option) => <option key={option}>{option}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Due Date">
              <input className={fieldClass} value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} placeholder="May 28" />
            </Field>

            <Field label="Notes">
              <textarea
                className="min-h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                value={form.notes || ''}
                onChange={(event) => updateField('notes', event.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 px-4 py-4 sm:flex sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} className="h-11 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit" className="h-11 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800">
              {mode === 'add' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
