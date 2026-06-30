import { Upload } from "lucide-react";
import { uploadLeadsCsv } from "@/app/dashboard/email/leads/actions";

export function CsvUpload() {
  return (
    <form action={uploadLeadsCsv} className="panel p-5">
      <h2 className="text-lg font-semibold">Upload CSV</h2>
      <p className="mt-1 text-sm text-muted">Headers: business_name, contact_name, email, website, instagram, industry, location, service_to_pitch, notes.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input name="file" type="file" accept=".csv,text/csv" className="w-full" required />
        <button className="btn-secondary shrink-0" type="submit">
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>
    </form>
  );
}
