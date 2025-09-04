import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Redirect to the existing following endpoint
  const { userId, page, limit } = req.query;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }
  
  // Build the redirect URL
  const redirectUrl = `/api/following/${userId}?${new URLSearchParams({
    ...(page && { page: page as string }),
    ...(limit && { limit: limit as string })
  }).toString()}`;
  
  // Redirect to the existing endpoint
  res.redirect(302, redirectUrl);
}
