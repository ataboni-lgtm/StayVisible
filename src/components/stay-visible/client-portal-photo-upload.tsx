'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { secondaryButtonClass } from './ui';

export function ClientPortalPhotoUpload({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  async function upload() {
    if (!files?.length) {
      toast.error('Choose at least one photo');
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.set('opportunityId', opportunityId);
    Array.from(files).forEach((file) => body.append('photos', file));

    try {
      const response = await fetch('/api/client-portal/photos', { method: 'POST', body });
      if (!response.ok) throw new Error();
      toast.success('Photos uploaded');
      setFiles(null);
      router.refresh();
    } catch {
      toast.error('Could not upload photos');
    } finally {
      setUploading(false);
    }
  }

  return <div className="flex flex-col gap-2 @md/page:flex-row @md/page:items-center @md/page:justify-end">
    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
      <input type="file" multiple accept="image/*" className="sr-only" onChange={(event) => setFiles(event.target.files)} />
      {files?.length ? `${files.length} selected` : 'Choose photos'}
    </label>
    <button type="button" onClick={upload} disabled={uploading || !files?.length} className={`${secondaryButtonClass} h-10 px-3 text-xs`}>
      {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
      {uploading ? 'Uploading...' : 'Upload'}
    </button>
  </div>;
}
