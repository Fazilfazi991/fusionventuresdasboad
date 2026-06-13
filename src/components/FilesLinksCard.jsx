import { ExternalLink } from 'lucide-react';

export function FilesLinksCard({ files }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
        <a
          key={file}
          href="#"
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          {file}
          <ExternalLink className="h-4 w-4 text-zinc-400" />
        </a>
      ))}
    </div>
  );
}
