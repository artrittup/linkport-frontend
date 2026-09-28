const skillGroups = [
  {
    category: 'Programming Languages',
    skills: [
      'Assembly', 'Bash', 'C', 'C#', 'C++', 'Clojure', 'Dart', 'Elixir', 'Go',
      'Groovy', 'Haskell', 'Java', 'JavaScript', 'Kotlin', 'Lua', 'MATLAB',
      'Objective-C', 'Perl', 'PHP', 'PowerShell', 'Python', 'R', 'Ruby', 'Rust',
      'Scala', 'Solidity', 'SQL', 'Swift', 'TypeScript', 'Visual Basic',
    ],
  },
  {
    category: 'Frontend & Mobile',
    skills: [
      'Angular', 'Astro', 'Bootstrap', 'CSS', 'Electron', 'Flutter', 'HTML',
      'Ionic', 'Material UI', 'Next.js', 'Nuxt.js', 'React', 'React Native',
      'Redux', 'Sass', 'shadcn/ui', 'Svelte', 'SvelteKit', 'Tailwind CSS',
      'Vue.js', 'Webpack', 'Vite', 'Zustand', 'Android Development',
      'iOS Development', 'Responsive Design', 'Web Components',
    ],
  },
  {
    category: 'Backend & APIs',
    skills: [
      'API Design', 'ASP.NET Core', 'Django', 'Eloquent ORM', 'Express.js',
      'FastAPI', 'Flask', 'Gin', 'GraphQL', 'Laravel', 'Microservices',
      'NestJS', 'Node.js', 'REST APIs', 'Ruby on Rails', 'Spring Boot',
      'Symfony', 'WebSockets', 'WordPress',
    ],
  },
  {
    category: 'Databases',
    skills: [
      'Database Design', 'Data Modeling', 'Elasticsearch', 'Firebase',
      'MariaDB', 'Microsoft SQL Server', 'MongoDB', 'MySQL', 'Oracle Database',
      'PostgreSQL', 'Prisma', 'Redis', 'SQLite', 'Supabase',
    ],
  },
  {
    category: 'Cloud & DevOps',
    skills: [
      'Ansible', 'Apache', 'AWS', 'CI/CD', 'Cloudflare', 'DevOps', 'Docker',
      'Git', 'GitHub', 'GitHub Actions', 'GitLab', 'Google Cloud', 'Jenkins',
      'Kubernetes', 'Linux', 'Microsoft Azure', 'Netlify', 'Nginx', 'Terraform',
      'Vercel',
    ],
  },
  {
    category: 'Game Development & 3D',
    skills: [
      'Unity', 'Unreal Engine', 'Godot', 'Game Development', 'Game Design',
      'Blender', '3D Modeling', 'Animation', 'AR Development', 'VR Development',
      'OpenGL', 'DirectX', 'Shader Programming',
    ],
  },
  {
    category: 'Testing & Code Quality',
    skills: [
      'Clean Code', 'Code Review', 'Cypress', 'Debugging', 'Design Patterns',
      'Integration Testing', 'Jest', 'Pest', 'PHPUnit', 'Playwright', 'Postman',
      'Selenium', 'Test Automation', 'Unit Testing', 'Vitest',
    ],
  },
  {
    category: 'AI & Data',
    skills: [
      'Artificial Intelligence', 'Data Analysis', 'Data Engineering',
      'Data Science', 'Deep Learning', 'Machine Learning', 'NumPy', 'OpenAI API',
      'Pandas', 'Power BI', 'PyTorch', 'TensorFlow',
    ],
  },
  {
    category: 'Security',
    skills: [
      'Cybersecurity', 'Ethical Hacking', 'JWT', 'Laravel Sanctum', 'OAuth',
      'Penetration Testing', 'Web Security',
    ],
  },
  {
    category: 'Tools & Design',
    skills: [
      'Accessibility', 'Adobe Illustrator', 'Adobe Photoshop', 'Figma',
      'IntelliJ IDEA', 'Jira', 'Notion', 'UI Design', 'UX Design',
      'Visual Studio', 'Visual Studio Code', 'WebStorm',
    ],
  },
  {
    category: 'Professional Skills',
    skills: [
      'Agile', 'Communication', 'Leadership', 'Problem Solving',
      'Product Management', 'Project Management', 'Scrum', 'Teamwork',
      'Technical Writing', 'Time Management',
    ],
  },
  {
    category: 'Arts & Creative',
    skills: [
      'Acting', 'Ceramics', 'Crafting', 'Creative Direction', 'Creative Writing',
      'Drawing', 'Fashion Design', 'Film Production', 'Illustration',
      'Interior Design', 'Painting', 'Photography', 'Sewing', 'Theatre',
      'Videography',
    ],
  },
  {
    category: 'Music & Performance',
    skills: [
      'Audio Engineering', 'Dance', 'DJing', 'Drums', 'Guitar', 'Music Production',
      'Piano', 'Public Speaking', 'Singing', 'Songwriting', 'Stage Performance',
    ],
  },
  {
    category: 'Sports & Fitness',
    skills: [
      'Basketball', 'Coaching', 'Cycling', 'Football', 'Hiking', 'Martial Arts',
      'Nutrition', 'Personal Training', 'Running', 'Strength Training', 'Swimming',
      'Tennis', 'Volleyball', 'Yoga',
    ],
  },
  {
    category: 'Media & Communication',
    skills: [
      'Broadcasting', 'Content Creation', 'Copywriting', 'Editing', 'Journalism',
      'Podcasting', 'Public Relations', 'Social Media', 'Storytelling',
      'Video Editing',
    ],
  },
  {
    category: 'Business & Entrepreneurship',
    skills: [
      'Accounting', 'Business Development', 'Customer Service', 'Entrepreneurship',
      'Event Planning', 'Finance', 'Fundraising', 'Human Resources', 'Marketing',
      'Negotiation', 'Operations', 'Sales',
    ],
  },
  {
    category: 'Education & Languages',
    skills: [
      'Curriculum Design', 'Language Teaching', 'Mentoring', 'Research',
      'Teaching', 'Translation', 'Tutoring', 'Workshop Facilitation',
    ],
  },
  {
    category: 'Health, Care & Wellbeing',
    skills: [
      'Caregiving', 'Community Health', 'First Aid', 'Mental Health Advocacy',
      'Mindfulness', 'Peer Support', 'Wellness Coaching',
    ],
  },
  {
    category: 'Food & Hospitality',
    skills: [
      'Baking', 'Barista Skills', 'Catering', 'Cooking', 'Event Hospitality',
      'Food Styling', 'Hospitality Management',
    ],
  },
  {
    category: 'Trades & Practical Skills',
    skills: [
      'Auto Repair', 'Carpentry', 'Electrical Work', 'Gardening', 'Home Repair',
      'Plumbing', 'Tailoring', 'Woodworking',
    ],
  },
  {
    category: 'Community & Everyday Life',
    skills: [
      'Community Organizing', 'Environmental Conservation', 'Financial Literacy',
      'Parenting Support', 'Pet Care', 'Sustainability', 'Travel Planning',
      'Volunteering', 'Youth Work',
    ],
  },
]

export default skillGroups
