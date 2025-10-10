import { NextApiRequest, NextApiResponse } from 'next';

const CATEGORIES: Record<string, string[]> = {
  islam: ['Quran', 'Hadith', 'Prayer', 'Charity', 'Ramadan', 'Hajj'],
  christianity: ['Bible', 'Sermons', 'Worship', 'Charity', 'Easter', 'Christmas'],
  hinduism: ['Bhagavad Gita', 'Puja', 'Festivals', 'Yoga', 'Temples'],
  buddhism: ['Dharma', 'Meditation', 'Monasteries', 'Teachings'],
  sikhism: ['Gurbani', 'Seva', 'Gurdwara', 'Kirtan'],
  judaism: ['Torah', 'Shabbat', 'Synagogue', 'Festivals']
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const religion = (req.query.religion as string)?.toLowerCase();
  const categories = religion && CATEGORIES[religion] ? CATEGORIES[religion] : Array.from(new Set(Object.values(CATEGORIES).flat()));
  res.json({ success: true, message: 'Categories retrieved', data: { categories } });
}
