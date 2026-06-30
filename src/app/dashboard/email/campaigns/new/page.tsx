import { SERVICE_OPTIONS } from "@/lib/constants";
import { getSettings } from "@/lib/db";
import { createCampaign } from "@/app/dashboard/email/campaigns/actions";

export default async function NewCampaignPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Campaign</h1>
        <p className="text-sm text-muted">Campaigns control generation, scheduling, daily limits, and follow-up timing.</p>
      </div>
      <form action={createCampaign} className="panel grid gap-4 p-5 md:grid-cols-2">
        <label>
          <span className="field-label">Campaign name</span>
          <input name="name" className="mt-1 w-full" required placeholder="Canada website redesign outreach" />
        </label>
        <label>
          <span className="field-label">Service to pitch</span>
          <select name="service_to_pitch" className="mt-1 w-full" required>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Target industry</span>
          <input name="target_industry" className="mt-1 w-full" placeholder="Travel agencies" />
        </label>
        <label>
          <span className="field-label">Status</span>
          <select name="status" className="mt-1 w-full" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="field-label">Description</span>
          <textarea name="description" className="mt-1 min-h-24 w-full" />
        </label>
        <label>
          <span className="field-label">Daily send limit</span>
          <input name="daily_send_limit" type="number" min="1" defaultValue={settings?.daily_send_limit || 25} className="mt-1 w-full" />
        </label>
        <label>
          <span className="field-label">Send weekends</span>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <input name="send_weekends" type="checkbox" defaultChecked={settings?.send_weekends || false} />
            Allow weekend sending
          </div>
        </label>
        <label>
          <span className="field-label">Working hours start</span>
          <input name="working_hours_start" type="time" defaultValue={settings?.default_working_hours_start || "09:00"} className="mt-1 w-full" />
        </label>
        <label>
          <span className="field-label">Working hours end</span>
          <input name="working_hours_end" type="time" defaultValue={settings?.default_working_hours_end || "17:00"} className="mt-1 w-full" />
        </label>
        <label>
          <span className="field-label">Follow-up 1 delay</span>
          <input name="followup1_delay_days" type="number" min="1" defaultValue={settings?.followup1_delay_days || 3} className="mt-1 w-full" />
        </label>
        <label>
          <span className="field-label">Follow-up 2 delay</span>
          <input name="followup2_delay_days" type="number" min="1" defaultValue={settings?.followup2_delay_days || 7} className="mt-1 w-full" />
        </label>
        <label>
          <span className="field-label">Follow-up 3 delay</span>
          <input name="followup3_delay_days" type="number" min="1" defaultValue={settings?.followup3_delay_days || 12} className="mt-1 w-full" />
        </label>
        <div className="md:col-span-2">
          <button className="btn-primary" type="submit">Create campaign</button>
        </div>
      </form>
    </div>
  );
}
