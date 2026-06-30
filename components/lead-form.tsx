import { SERVICE_OPTIONS } from "@/lib/constants";
import { createLead } from "@/app/dashboard/email/leads/actions";

export function LeadForm() {
  return (
    <form action={createLead} className="panel grid gap-4 p-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-lg font-semibold">Add Lead</h2>
      </div>
      <label>
        <span className="field-label">Business name</span>
        <input name="business_name" className="mt-1 w-full" required />
      </label>
      <label>
        <span className="field-label">Contact name</span>
        <input name="contact_name" className="mt-1 w-full" />
      </label>
      <label>
        <span className="field-label">Email</span>
        <input name="email" type="email" className="mt-1 w-full" required />
      </label>
      <label>
        <span className="field-label">Website</span>
        <input name="website" className="mt-1 w-full" />
      </label>
      <label>
        <span className="field-label">Instagram</span>
        <input name="instagram" className="mt-1 w-full" />
      </label>
      <label>
        <span className="field-label">Industry</span>
        <input name="industry" className="mt-1 w-full" />
      </label>
      <label>
        <span className="field-label">Location</span>
        <input name="location" className="mt-1 w-full" />
      </label>
      <label>
        <span className="field-label">Service to pitch</span>
        <select name="service_to_pitch" className="mt-1 w-full">
          {SERVICE_OPTIONS.map((service) => (
            <option key={service}>{service}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="field-label">Notes</span>
        <textarea name="notes" className="mt-1 min-h-24 w-full" />
      </label>
      <div className="md:col-span-2">
        <button className="btn-primary" type="submit">
          Add lead
        </button>
      </div>
    </form>
  );
}
