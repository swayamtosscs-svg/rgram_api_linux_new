import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { unlink } from 'fs/promises';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const cronKey = process.env.CRON_SECRET;
    if (cronKey) {
      const provided = req.headers.get('x-cron-key');
      if (!provided || provided !== cronKey) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
    }

    await dbConnect();

    const now = new Date();
    const expiredStories = await (Story as any).find({ expiresAt: { $lte: now } }).lean();

    // Helper to map public URL to absolute path under public/
    const toAbs = (url: string | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;
      if (!url.startsWith('/assets/')) return null;
      const relative = url.replace(/^[\\\/]+/, '');
      return join(process.cwd(), 'public', relative);
    };

    // Delete files
    for (const s of expiredStories) {
      try {
        const m = toAbs(s.media);
        if (m) await unlink(m).catch(() => {});
        const su = s.song?.url as string | undefined;
        const sp = toAbs(su);
        if (sp) await unlink(sp).catch(() => {});
      } catch {}
    }

    // Remove from DB
    const ids = expiredStories.map((s: any) => s._id);
    if (ids.length > 0) {
      await (Story as any).deleteMany({ _id: { $in: ids } });
    }

    return NextResponse.json({ success: true, message: 'Expired stories cleaned', data: { removed: ids.length } });
  } catch (error: any) {
    console.error('Cleanup stories error:', error);
    return NextResponse.json({ success: false, message: 'Failed to cleanup stories', error: error.message }, { status: 500 });
  }
}


