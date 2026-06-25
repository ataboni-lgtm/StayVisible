import { ClientForm } from '@/components/stay-visible/client-form';
import { PageHeader } from '@/components/stay-visible/ui';
export default function NewClientPage() { return <div className="@container/page mx-auto max-w-4xl"><PageHeader eyebrow="Clients" title="Add a new client" description="Start with the essentials. You’ll shape their LinkedIn voice next." /><ClientForm /></div>; }
