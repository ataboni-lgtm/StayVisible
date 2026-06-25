import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { db } from '@/lib/db/db';
import { photos, postOpportunities } from '@/lib/stay-visible/schema';
import { readStore } from '@/lib/stay-visible/local-store';

export const POST = routeHandler(async (request: NextRequest) => {
  const cookieStore = await cookies();
  const clientId = cookieStore.get('stayvisible-client-id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Client login required.' }, { status: 401 });

  const form = await request.formData();
  const opportunityId = String(form.get('opportunityId') ?? '');
  const files = form.getAll('photos').filter((item): item is File => item instanceof File && item.size > 0);
  if (!opportunityId || !files.length) return NextResponse.json({ error: 'Choose an event and at least one photo.' }, { status: 400 });

  const data = await readStore();
  const opportunity = data.postOpportunities.find((item) => item.id === opportunityId && item.clientId === clientId);
  if (!opportunity) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  const uploadDir = path.join(process.cwd(), 'data', 'uploads', opportunityId);
  await mkdir(uploadDir, { recursive: true });

  const saved = [];
  for (const [index, file] of files.entries()) {
    const safeName = sanitizeFileName(file.name);
    const filename = `${Date.now()}-${index}-${safeName}`;
    const storagePath = path.join(uploadDir, filename);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(storagePath, bytes);
    const [row] = await db.insert(photos).values({
      clientId,
      postOpportunityId: opportunityId,
      storagePath,
      altText: file.name,
      context: `Uploaded by client for ${opportunity.topic}`,
      sortOrder: index,
    }).returning();
    saved.push(row);
  }

  const photoSummary = `Client uploaded ${saved.length} photo${saved.length === 1 ? '' : 's'}: ${files.map((file) => file.name).join(', ')}`;
  const nextPhotoContext = [opportunity.photoContext, photoSummary].filter(Boolean).join('\n');
  await db.update(postOpportunities).set({ photoContext: nextPhotoContext, updatedAt: new Date() }).where(eq(postOpportunities.id, opportunityId));

  return NextResponse.json({ uploaded: saved.length, photoContext: nextPhotoContext });
});

function sanitizeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 120) || 'photo';
}
