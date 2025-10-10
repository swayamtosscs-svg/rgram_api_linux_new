import { NextApiRequest, NextApiResponse } from 'next';

// Comprehensive list of religions with descriptions
const RELIGIONS = [
  {
    id: 'hinduism',
    name: 'Hinduism',
    description: 'One of the world\'s oldest religions, originating in the Indian subcontinent',
    categories: ['Bhagavad Gita', 'Puja', 'Festivals', 'Yoga', 'Temples', 'Vedas', 'Upanishads'],
    population: '1.2 billion+',
    regions: ['India', 'Nepal', 'Bangladesh', 'Sri Lanka', 'Mauritius', 'Fiji']
  },
  {
    id: 'islam',
    name: 'Islam',
    description: 'A monotheistic Abrahamic religion based on the teachings of Prophet Muhammad',
    categories: ['Quran', 'Hadith', 'Prayer', 'Charity', 'Ramadan', 'Hajj', 'Salah'],
    population: '1.9 billion+',
    regions: ['Middle East', 'North Africa', 'South Asia', 'Southeast Asia', 'Sub-Saharan Africa']
  },
  {
    id: 'christianity',
    name: 'Christianity',
    description: 'A monotheistic religion based on the life and teachings of Jesus Christ',
    categories: ['Bible', 'Sermons', 'Worship', 'Charity', 'Easter', 'Christmas', 'Baptism'],
    population: '2.4 billion+',
    regions: ['Europe', 'Americas', 'Sub-Saharan Africa', 'Oceania']
  },
  {
    id: 'buddhism',
    name: 'Buddhism',
    description: 'A spiritual tradition focused on personal spiritual development and enlightenment',
    categories: ['Dharma', 'Meditation', 'Monasteries', 'Teachings', 'Nirvana', 'Karma'],
    population: '500 million+',
    regions: ['East Asia', 'Southeast Asia', 'Tibet', 'Sri Lanka']
  },
  {
    id: 'sikhism',
    name: 'Sikhism',
    description: 'A monotheistic religion founded in the Punjab region of South Asia',
    categories: ['Gurbani', 'Seva', 'Gurdwara', 'Kirtan', 'Langar', 'Five Ks'],
    population: '30 million+',
    regions: ['India', 'Pakistan', 'United Kingdom', 'Canada', 'United States']
  },
  {
    id: 'judaism',
    name: 'Judaism',
    description: 'One of the oldest monotheistic religions, the religion of the Jewish people',
    categories: ['Torah', 'Shabbat', 'Synagogue', 'Festivals', 'Kosher', 'Bar Mitzvah'],
    population: '15 million+',
    regions: ['Israel', 'United States', 'Europe', 'Canada']
  },
  {
    id: 'jainism',
    name: 'Jainism',
    description: 'An ancient Indian religion that emphasizes non-violence and spiritual purity',
    categories: ['Ahimsa', 'Non-violence', 'Asceticism', 'Karma', 'Moksha', 'Temples'],
    population: '5 million+',
    regions: ['India', 'United States', 'United Kingdom', 'Canada']
  },
  {
    id: 'zoroastrianism',
    name: 'Zoroastrianism',
    description: 'One of the world\'s oldest monotheistic religions, founded in ancient Persia',
    categories: ['Avesta', 'Fire Temples', 'Good Thoughts', 'Good Words', 'Good Deeds'],
    population: '100,000+',
    regions: ['India', 'Iran', 'United States', 'United Kingdom']
  },
  {
    id: 'bahai',
    name: 'Bahá\'í Faith',
    description: 'A monotheistic religion emphasizing the spiritual unity of all humankind',
    categories: ['Unity', 'Progressive Revelation', 'World Peace', 'Education', 'Equality'],
    population: '8 million+',
    regions: ['Worldwide', 'India', 'Iran', 'United States', 'Africa']
  },
  {
    id: 'shinto',
    name: 'Shinto',
    description: 'The indigenous religion of Japan, focusing on ritual practices and reverence for kami',
    categories: ['Kami', 'Shrines', 'Festivals', 'Purification', 'Nature Worship'],
    population: '100 million+',
    regions: ['Japan', 'United States', 'Brazil']
  },
  {
    id: 'taoism',
    name: 'Taoism',
    description: 'A philosophical and religious tradition emphasizing living in harmony with the Tao',
    categories: ['Tao Te Ching', 'Yin Yang', 'Wu Wei', 'Meditation', 'Qi', 'Feng Shui'],
    population: '20 million+',
    regions: ['China', 'Taiwan', 'Hong Kong', 'Southeast Asia']
  },
  {
    id: 'confucianism',
    name: 'Confucianism',
    description: 'A system of philosophical and ethical teachings founded by Confucius',
    categories: ['Analects', 'Five Classics', 'Filial Piety', 'Education', 'Ritual', 'Virtue'],
    population: '6 million+',
    regions: ['China', 'Korea', 'Japan', 'Vietnam']
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other religious or spiritual beliefs not listed above',
    categories: ['Custom', 'Personal Belief', 'Spiritual', 'Philosophical'],
    population: 'Varies',
    regions: ['Worldwide']
  },
  {
    id: 'none',
    name: 'No Religion / Atheist',
    description: 'No religious affiliation or atheistic beliefs',
    categories: ['Humanism', 'Secularism', 'Philosophy', 'Science'],
    population: '1.2 billion+',
    regions: ['Worldwide']
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { format = 'full', search } = req.query;

    let religions = [...RELIGIONS];

    // Apply search filter if provided
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      religions = religions.filter(religion => 
        religion.name.toLowerCase().includes(searchLower) ||
        religion.description.toLowerCase().includes(searchLower) ||
        religion.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    // Return different formats based on query parameter
    if (format === 'simple') {
      // Simple format for dropdowns/selects
      const simpleReligions = religions.map(religion => ({
        id: religion.id,
        name: religion.name
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Religions retrieved successfully',
        data: {
          religions: simpleReligions,
          total: simpleReligions.length
        }
      });
    } else if (format === 'categories') {
      // Categories format for content organization
      const categoriesFormat = religions.map(religion => ({
        id: religion.id,
        name: religion.name,
        categories: religion.categories
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Religions with categories retrieved successfully',
        data: {
          religions: categoriesFormat,
          total: categoriesFormat.length
        }
      });
    } else {
      // Full format (default)
      return res.status(200).json({
        success: true,
        message: 'Religions retrieved successfully',
        data: {
          religions,
          total: religions.length
        }
      });
    }

  } catch (error: any) {
    console.error('Religions API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
