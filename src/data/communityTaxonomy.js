export const COMMUNITY_TOPICS = [
  { name: 'Sports & Fitness', circleCategory: 'Sports & fitness', detail: 'Training, teams, and staying active', keywords: ['football', 'basketball', 'running', 'gym', 'yoga'] },
  { name: 'Movies & TV', circleCategory: 'Film & television', detail: 'Films, series, reviews, and watchlists', keywords: ['cinema', 'television', 'film', 'shows'] },
  { name: 'Music', circleCategory: 'Music', detail: 'Listening, performing, producing, and live shows', keywords: ['singing', 'instruments', 'concerts', 'production'] },
  { name: 'Books & Reading', circleCategory: 'Books & writing', detail: 'Fiction, nonfiction, book clubs, and ideas', keywords: ['literature', 'novels', 'philosophy'] },
  { name: 'Art & Illustration', circleCategory: 'Arts & culture', detail: 'Drawing, painting, crafts, and visual art', keywords: ['creative', 'design', 'painting', 'drawing'] },
  { name: 'Photography', circleCategory: 'Arts & culture', detail: 'Photo walks, portraits, editing, and stories', keywords: ['camera', 'visual storytelling', 'editing'] },
  { name: 'Food & Cooking', circleCategory: 'Food & cooking', detail: 'Recipes, baking, restaurants, and food culture', keywords: ['baking', 'hospitality', 'nutrition'] },
  { name: 'Travel & Outdoors', circleCategory: 'Travel & outdoors', detail: 'Trips, hiking, nature, and local adventures', keywords: ['travel', 'hiking', 'camping', 'nature'] },
  { name: 'Gaming', circleCategory: 'Gaming', detail: 'Games, esports, tabletop, and game nights', keywords: ['video games', 'board games', 'esports'] },
  { name: 'Health & Wellbeing', circleCategory: 'Health & wellbeing', detail: 'Healthy habits, mindfulness, and support', keywords: ['wellness', 'mental health', 'mindfulness'] },
  { name: 'Fashion & Style', circleCategory: 'Fashion & beauty', detail: 'Personal style, fashion, beauty, and making', keywords: ['clothing', 'sewing', 'beauty'] },
  { name: 'Writing', circleCategory: 'Books & writing', detail: 'Stories, poetry, journalism, and publishing', keywords: ['creative writing', 'copywriting', 'journalism'] },
  { name: 'Dance & Performance', circleCategory: 'Arts & culture', detail: 'Dance, theatre, comedy, and the stage', keywords: ['acting', 'theatre', 'performance'] },
  { name: 'Languages & Culture', circleCategory: 'Languages & culture', detail: 'Language exchange, traditions, and culture', keywords: ['translation', 'language learning', 'history'] },
  { name: 'Pets & Animals', circleCategory: 'Pets & animals', detail: 'Pet care, wildlife, and animal lovers', keywords: ['dogs', 'cats', 'wildlife'] },
  { name: 'Parenting & Family', circleCategory: 'Family & parenting', detail: 'Family life, support, and shared experiences', keywords: ['parents', 'children', 'caregiving'] },
  { name: 'Home & Gardening', circleCategory: 'Home & gardening', detail: 'Gardening, interiors, DIY, and practical projects', keywords: ['plants', 'home improvement', 'crafts'] },
  { name: 'Volunteering', circleCategory: 'Social impact', detail: 'Causes, mutual aid, and community action', keywords: ['social impact', 'nonprofit', 'community'] },
  { name: 'Local Community', circleCategory: 'Local communities', detail: 'Neighbourhood news, meetups, and local life', keywords: ['local events', 'city', 'neighbourhood'] },
  { name: 'Education & Learning', circleCategory: 'Education', detail: 'Study groups, teaching, and lifelong learning', keywords: ['students', 'tutoring', 'mentoring'] },
  { name: 'Careers & Business', circleCategory: 'Career', detail: 'Careers, entrepreneurship, and professional growth', keywords: ['jobs', 'startups', 'finance', 'marketing'] },
  { name: 'Science & Nature', circleCategory: 'Science & nature', detail: 'Discovery, research, space, and the natural world', keywords: ['biology', 'physics', 'astronomy'] },
  { name: 'Environment', circleCategory: 'Environment & sustainability', detail: 'Climate, sustainability, and greener living', keywords: ['recycling', 'conservation', 'climate'] },
  { name: 'Technology', circleCategory: 'Technology', detail: 'Digital tools, devices, coding, and new ideas', keywords: ['programming', 'software', 'hardware', 'ai'] },
  { name: 'Personal Finance', circleCategory: 'Personal finance', detail: 'Budgeting, saving, investing, and money habits', keywords: ['finance', 'budgeting', 'investing'] },
]

export function normalizePreference(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ')
}

export function getPreferenceScore(values, preferences) {
  const searchable = values.map(normalizePreference).filter(Boolean)
  return preferences.reduce((score, preference) => {
    const normalizedPreference = normalizePreference(preference)
    if (!normalizedPreference) return score
    return score + (searchable.some((value) => value.includes(normalizedPreference) || normalizedPreference.includes(value)) ? 1 : 0)
  }, 0)
}
