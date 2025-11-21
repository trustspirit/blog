import { BlogPost } from './api'

// Calculate reading time based on content length
// Average reading speed: ~200 words per minute
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)
  return Math.max(1, readingTime) // Minimum 1 minute
}

// Dummy blog posts for development testing
export const DUMMY_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Exploring the Wonders of Hiking',
    summary:
      "An iconic landmarks, this post unveils the secrets that make this destination a traveler's paradise.",
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Destination', 'Adventure', 'Hiking'],
    readingTime: 5,
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
  },
  {
    id: '2',
    title: 'Top 10 Street Foods Around the World',
    summary:
      'Discover the most delicious street food from different cultures and countries.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Culinary', 'Food', 'Culture'],
    readingTime: 7,
    createdAt: '2024-01-23T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
  },
  {
    id: '3',
    title: 'Minimalist Travel: Pack Light, Travel Far',
    summary:
      'Learn the art of minimalist packing and discover how less really can be more when traveling.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Lifestyle', 'Tips & Hacks', 'Minimalism'],
    readingTime: 6,
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
  },
  {
    id: '4',
    title: 'Hidden Beaches of Southeast Asia',
    summary:
      'Escape the crowds and find your own private paradise in these lesser-known beach destinations.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Destination', 'Beach', 'Asia'],
    readingTime: 8,
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: '5',
    title: 'Budget Travel Tips for Europe',
    summary:
      'How to explore Europe without breaking the bank - insider tips and money-saving strategies.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Tips & Hacks', 'Budget', 'Europe'],
    readingTime: 10,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '6',
    title: 'Japanese Cuisine: A Complete Guide',
    summary:
      'From sushi to ramen, explore the rich culinary traditions of Japan.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Culinary', 'Japan', 'Food'],
    readingTime: 12,
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
  {
    id: '7',
    title: 'Digital Nomad Life in Bali',
    summary:
      'Living and working remotely from the island paradise of Bali - pros, cons, and practical tips.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Lifestyle', 'Digital Nomad', 'Bali'],
    readingTime: 9,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '8',
    title: 'Best Photography Spots in Iceland',
    summary:
      'Capture stunning landscapes and northern lights in these incredible Icelandic locations.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Destination', 'Photography', 'Iceland'],
    readingTime: 7,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '9',
    title: 'Traditional Markets Worth Visiting',
    summary:
      'Experience authentic local culture at these vibrant traditional markets around the world.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1555217851-6141535bd771?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Culture', 'Shopping', 'Local'],
    readingTime: 6,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '10',
    title: 'Sustainable Travel Practices',
    summary:
      'How to reduce your environmental impact while exploring the world.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Lifestyle', 'Sustainability', 'Eco-Travel'],
    readingTime: 8,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '11',
    title: 'Wine Tasting Tour in Tuscany',
    summary:
      'Sip your way through the rolling hills of Tuscany and discover world-class Italian wines.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Culinary', 'Wine', 'Italy'],
    readingTime: 11,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: '12',
    title: 'Solo Female Travel Safety Tips',
    summary:
      'Essential safety advice and empowering tips for women traveling alone.',
    content: 'Full content here...',
    imageUrl:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop',
    published: true,
    tags: ['Tips & Hacks', 'Solo Travel', 'Safety'],
    readingTime: 5,
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
]

// Function to get dummy posts (simulates API call)
export const getDummyPosts = (limit?: number): Promise<BlogPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = limit ? DUMMY_POSTS.slice(0, limit) : DUMMY_POSTS
      resolve(posts)
    }, 500) // Simulate network delay
  })
}

// Function to search dummy posts
export const searchDummyPosts = (query: string): Promise<BlogPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = DUMMY_POSTS.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase()),
      )
      resolve(results)
    }, 300)
  })
}
