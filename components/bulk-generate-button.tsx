"use client";

export function BulkGenerateButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Generate review emails for all New leads? This will not send any emails.")) {
          event.preventDefault();
        }
      }}
    >
      <button className="btn-primary" type="submit">
        Generate for All New Leads
      </button>
    </form>
  );
}
