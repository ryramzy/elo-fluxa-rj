export interface LessonMetadata {
  id: string;
  title: string;
  lessonIndex: number;
  xpReward: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  descriptionPt?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Specialty';
  tag: string;
  emoji: string;
  imageUrl: string;
  totalLessons: number;
  lessons: LessonMetadata[];
  // Legacy fields for backward compatibility
  audience?: string;
  accentColor?: string;
  totalXpReward?: number;
  aboutText?: string;
  whoThisIsFor?: string;
  whatYouWillLearn?: string[];
}

export const courses: Course[] = [
  // --- BEGINNER ---
  {
    id: 'basic-english-daily-life',
    title: 'Basic English for Daily Life',
    description: 'Survive and communicate in basic real-world English situations.',
    descriptionPt: 'Sobreviva e comunique-se em situações básicas do mundo real em inglês.',
    level: 'Beginner',
    tag: 'Essentials',
    emoji: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'be-dl-01', title: 'Greetings & introductions', lessonIndex: 0, xpReward: 20 },
      { id: 'be-dl-02', title: 'Numbers, time & dates', lessonIndex: 1, xpReward: 20 },
      { id: 'be-dl-03', title: 'Shopping & prices', lessonIndex: 2, xpReward: 20 },
      { id: 'be-dl-04', title: 'Asking for directions', lessonIndex: 3, xpReward: 20 },
      { id: 'be-dl-05', title: 'Daily routines & habits', lessonIndex: 4, xpReward: 25 },
    ]
  },
  {
    id: 'beginner-english-topics',
    title: 'Beginner English Topics & Conversation',
    description: 'Hold a simple, friendly conversation in English with confidence.',
    descriptionPt: 'Mantenha uma conversa simples e amigável em inglês com confiança.',
    level: 'Beginner',
    tag: 'Conversation',
    emoji: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'be-tc-01', title: 'Talking about yourself', lessonIndex: 0, xpReward: 20 },
      { id: 'be-tc-02', title: 'Your family & home', lessonIndex: 1, xpReward: 20 },
      { id: 'be-tc-03', title: 'Food & restaurants', lessonIndex: 2, xpReward: 20 },
      { id: 'be-tc-04', title: 'Weather & seasons', lessonIndex: 3, xpReward: 20 },
      { id: 'be-tc-05', title: 'Weekend plans', lessonIndex: 4, xpReward: 25 },
    ]
  },

  // --- INTERMEDIATE ---
  {
    id: 'intermediate-english-topics',
    title: 'Intermediate English Conversation Topics',
    description: 'Express complex thoughts, tell stories, and discuss ideas with confidence.',
    descriptionPt: 'Expresse pensamentos complexos, conte histórias e discuta ideias com confiança.',
    level: 'Intermediate',
    tag: 'Conversation',
    emoji: '🗣️',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
    totalLessons: 6,
    lessons: [
      { id: 'int-tc-01', title: 'Opinions & agreeing/disagreeing', lessonIndex: 0, xpReward: 30 },
      { id: 'int-tc-02', title: 'Storytelling & past experiences', lessonIndex: 1, xpReward: 30 },
      { id: 'int-tc-03', title: 'Plans, predictions & future', lessonIndex: 2, xpReward: 30 },
      { id: 'int-tc-04', title: 'Problems & solutions', lessonIndex: 3, xpReward: 30 },
      { id: 'int-tc-05', title: 'Culture shock & travel stories', lessonIndex: 4, xpReward: 30 },
      { id: 'int-tc-06', title: 'News & current events', lessonIndex: 5, xpReward: 35 },
    ]
  },
  {
    id: 'english-grammar-beginner',
    title: 'Beginner Grammar',
    description: 'Master the fundamental building blocks of English grammar.',
    descriptionPt: 'Domine os blocos de construção fundamentais da gramática inglesa.',
    level: 'Intermediate', // Grouping under the Grammar track flow, though targeting beginners
    tag: 'Grammar',
    emoji: '🧱',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'gr-beg-01', title: 'Present simple & routines', lessonIndex: 0, xpReward: 25 },
      { id: 'gr-beg-02', title: 'The verb To Be', lessonIndex: 1, xpReward: 25 },
      { id: 'gr-beg-03', title: 'Articles (A, An, The)', lessonIndex: 2, xpReward: 25 },
      { id: 'gr-beg-04', title: 'Basic nouns & plurals', lessonIndex: 3, xpReward: 25 },
      { id: 'gr-beg-05', title: 'Pronouns & possessives', lessonIndex: 4, xpReward: 30 },
    ]
  },
  {
    id: 'english-grammar-high-beginner',
    title: 'High Beginner Grammar',
    description: 'Expand your sentence structure to talk about the past and describe the world.',
    descriptionPt: 'Expanda sua estrutura de frases para falar sobre o passado e descrever o mundo.',
    level: 'Intermediate',
    tag: 'Grammar',
    emoji: '📝',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'gr-hbeg-01', title: 'Past simple & regular verbs', lessonIndex: 0, xpReward: 30 },
      { id: 'gr-hbeg-02', title: 'Past simple & irregular verbs', lessonIndex: 1, xpReward: 30 },
      { id: 'gr-hbeg-03', title: 'There is vs There are', lessonIndex: 2, xpReward: 30 },
      { id: 'gr-hbeg-04', title: 'Prepositions of time & place', lessonIndex: 3, xpReward: 30 },
      { id: 'gr-hbeg-05', title: 'Adjectives & comparatives', lessonIndex: 4, xpReward: 35 },
    ]
  },
  {
    id: 'english-grammar-intermediate',
    title: 'Intermediate Grammar',
    description: 'Unlock nuanced expression with perfect tenses and conditionals.',
    descriptionPt: 'Desbloqueie expressões sutis com tempos perfeitos e condicionais.',
    level: 'Intermediate',
    tag: 'Grammar',
    emoji: '🏗️',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'gr-int-01', title: 'Present perfect (Experience)', lessonIndex: 0, xpReward: 35 },
      { id: 'gr-int-02', title: 'Present perfect (Recent past)', lessonIndex: 1, xpReward: 35 },
      { id: 'gr-int-03', title: 'Modal verbs of obligation & advice', lessonIndex: 2, xpReward: 35 },
      { id: 'gr-int-04', title: 'Zero & First Conditionals', lessonIndex: 3, xpReward: 35 },
      { id: 'gr-int-05', title: 'Relative clauses (who, which, that)', lessonIndex: 4, xpReward: 40 },
    ]
  },
  {
    id: 'english-grammar-advanced',
    title: 'Advanced Grammar',
    description: 'Speak and write with academic and professional precision.',
    descriptionPt: 'Fale e escreva com precisão acadêmica e profissional.',
    level: 'Intermediate',
    tag: 'Grammar',
    emoji: '🏛️',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'gr-adv-01', title: 'The Passive Voice', lessonIndex: 0, xpReward: 40 },
      { id: 'gr-adv-02', title: 'Reported Speech', lessonIndex: 1, xpReward: 40 },
      { id: 'gr-adv-03', title: 'Second & Third Conditionals', lessonIndex: 2, xpReward: 40 },
      { id: 'gr-adv-04', title: 'Inversion & Emphasis', lessonIndex: 3, xpReward: 40 },
      { id: 'gr-adv-05', title: 'Discourse markers & linking words', lessonIndex: 4, xpReward: 45 },
    ]
  },

  // --- ADVANCED ---
  {
    id: 'advanced-english-topics',
    title: 'Advanced English Conversation Topics',
    description: 'Communicate with native-level fluency, subtlety, and cultural intelligence.',
    descriptionPt: 'Comunique-se com fluência de nível nativo, sutileza e inteligência cultural.',
    level: 'Advanced',
    tag: 'Conversation',
    emoji: '🍷',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    totalLessons: 6,
    lessons: [
      { id: 'adv-tc-01', title: 'Debate & persuasion', lessonIndex: 0, xpReward: 40 },
      { id: 'adv-tc-02', title: 'Humor, irony & sarcasm', lessonIndex: 1, xpReward: 40 },
      { id: 'adv-tc-03', title: 'Nuanced emotions & empathy', lessonIndex: 2, xpReward: 40 },
      { id: 'adv-tc-04', title: 'Ethics & philosophy', lessonIndex: 3, xpReward: 40 },
      { id: 'adv-tc-05', title: 'Identity, culture & belonging', lessonIndex: 4, xpReward: 40 },
      { id: 'adv-tc-06', title: 'Navigating ambiguity & vagueness', lessonIndex: 5, xpReward: 50 },
    ]
  },
  {
    id: 'advanced-business-english',
    title: 'Advanced Business English Communication',
    description: 'Operate confidently at the executive level in English-speaking professional environments.',
    descriptionPt: 'Opere com confiança no nível executivo em ambientes profissionais de língua inglesa.',
    level: 'Advanced',
    tag: 'Business',
    emoji: '🏢',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
    totalLessons: 8,
    lessons: [
      { id: 'adv-biz-01', title: 'Executive presence & commanding a room', lessonIndex: 0, xpReward: 45 },
      { id: 'adv-biz-02', title: 'High-stakes negotiation language', lessonIndex: 1, xpReward: 45 },
      { id: 'adv-biz-03', title: 'Presentations & pitching', lessonIndex: 2, xpReward: 45 },
      { id: 'adv-biz-04', title: 'Cross-cultural business communication', lessonIndex: 3, xpReward: 45 },
      { id: 'adv-biz-05', title: 'Written business English', lessonIndex: 4, xpReward: 45 },
      { id: 'adv-biz-06', title: 'Managing up, down & sideways', lessonIndex: 5, xpReward: 45 },
      { id: 'adv-biz-07', title: 'Crisis communication & damage control', lessonIndex: 6, xpReward: 45 },
      { id: 'adv-biz-08', title: 'Networking & relationship-building', lessonIndex: 7, xpReward: 60 },
    ]
  },
  {
    id: 'business-english',
    title: 'Business English',
    description: 'Navigate meetings, emails, and professional interactions seamlessly.',
    descriptionPt: 'Navegue em reuniões, e-mails e interações profissionais de forma natural.',
    level: 'Advanced',
    tag: 'Business',
    emoji: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    totalLessons: 6,
    lessons: [
      { id: 'biz-01', title: 'Professional introductions & networking', lessonIndex: 0, xpReward: 35 },
      { id: 'biz-02', title: 'Meetings (agenda, minutes, participation)', lessonIndex: 1, xpReward: 35 },
      { id: 'biz-03', title: 'Business correspondence', lessonIndex: 2, xpReward: 35 },
      { id: 'biz-04', title: 'Phone & video call etiquette', lessonIndex: 3, xpReward: 35 },
      { id: 'biz-05', title: 'Interviews & job applications', lessonIndex: 4, xpReward: 35 },
      { id: 'biz-06', title: 'Business idioms & collocations', lessonIndex: 5, xpReward: 45 },
    ]
  },
  {
    id: 'business-innovation',
    title: 'Business Innovation',
    description: 'Speak the language of startups, disruption, and product thinking.',
    descriptionPt: 'Fale a língua das startups, inovação e pensamento de produto.',
    level: 'Advanced',
    tag: 'Startup',
    emoji: '🚀',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'biz-inn-01', title: 'Startup & venture vocabulary', lessonIndex: 0, xpReward: 40 },
      { id: 'biz-inn-02', title: 'Pitching ideas & getting buy-in', lessonIndex: 1, xpReward: 40 },
      { id: 'biz-inn-03', title: 'Design thinking language', lessonIndex: 2, xpReward: 40 },
      { id: 'biz-inn-04', title: 'Agile & lean methodology jargon', lessonIndex: 3, xpReward: 40 },
      { id: 'biz-inn-05', title: 'Innovation culture & disruption', lessonIndex: 4, xpReward: 50 },
    ]
  },
  {
    id: 'business-marketing',
    title: 'Business Marketing',
    description: 'Master the vocabulary of digital marketing, branding, and persuasion.',
    descriptionPt: 'Domine o vocabulário de marketing digital, branding e persuasão.',
    level: 'Advanced',
    tag: 'Marketing',
    emoji: '📈',
    imageUrl: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'biz-mkt-01', title: 'Brand voice & copywriting', lessonIndex: 0, xpReward: 40 },
      { id: 'biz-mkt-02', title: 'Digital marketing vocabulary', lessonIndex: 1, xpReward: 40 },
      { id: 'biz-mkt-03', title: 'Data & analytics language', lessonIndex: 2, xpReward: 40 },
      { id: 'biz-mkt-04', title: 'Campaign briefs & creative reviews', lessonIndex: 3, xpReward: 40 },
      { id: 'biz-mkt-05', title: 'Consumer psychology & persuasion', lessonIndex: 4, xpReward: 50 },
    ]
  },
  {
    id: 'business-strategy',
    title: 'Business Strategy',
    description: 'Framework-driven communication for management and consulting.',
    descriptionPt: 'Comunicação baseada em frameworks para gestão e consultoria.',
    level: 'Advanced',
    tag: 'Management',
    emoji: '♟️',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'biz-str-01', title: 'Strategic frameworks vocabulary', lessonIndex: 0, xpReward: 45 },
      { id: 'biz-str-02', title: 'Stakeholder communication', lessonIndex: 1, xpReward: 45 },
      { id: 'biz-str-03', title: 'M&A and market entry language', lessonIndex: 2, xpReward: 45 },
      { id: 'biz-str-04', title: 'Competitive analysis discourse', lessonIndex: 3, xpReward: 45 },
      { id: 'biz-str-05', title: 'Long-term vision & mission', lessonIndex: 4, xpReward: 55 },
    ]
  },

  // --- SPECIALTY ---
  {
    id: 'electrical-engineering-english',
    title: 'Electrical Engineering English',
    description: 'Technical English for circuits, safety, and engineering documentation.',
    descriptionPt: 'Inglês técnico para circuitos, segurança e documentação de engenharia.',
    level: 'Specialty',
    tag: 'Engineering',
    emoji: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1620283085068-5aab24e2f48c?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'ee-01', title: 'Circuits & components vocabulary', lessonIndex: 0, xpReward: 40 },
      { id: 'ee-02', title: 'Schematics & technical drawings', lessonIndex: 1, xpReward: 40 },
      { id: 'ee-03', title: 'Safety procedures & documentation', lessonIndex: 2, xpReward: 40 },
      { id: 'ee-04', title: 'Lab & testing language', lessonIndex: 3, xpReward: 40 },
      { id: 'ee-05', title: 'Technical presentations & reports', lessonIndex: 4, xpReward: 50 },
    ]
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development Culture',
    description: 'English fluency for remote dev teams, PRs, and Slack etiquette.',
    descriptionPt: 'Fluência em inglês para equipes de desenvolvimento remotas, PRs e Slack.',
    level: 'Specialty',
    tag: 'Tech',
    emoji: '💻',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'fs-01', title: 'Tech team communication culture', lessonIndex: 0, xpReward: 40 },
      { id: 'fs-02', title: 'PR reviews & issue writing', lessonIndex: 1, xpReward: 40 },
      { id: 'fs-03', title: 'Slack/Discord professional etiquette', lessonIndex: 2, xpReward: 40 },
      { id: 'fs-04', title: 'Reading & writing technical docs', lessonIndex: 3, xpReward: 40 },
      { id: 'fs-05', title: 'Interviewing at English tech companies', lessonIndex: 4, xpReward: 50 },
    ]
  },
  {
    id: 'software-engineering-2026',
    title: 'Software Engineering English (2026)',
    description: 'Navigate AI-assisted development, system design, and tech leadership.',
    descriptionPt: 'Navegue pelo desenvolvimento com IA, system design e liderança técnica.',
    level: 'Specialty',
    tag: 'Tech',
    emoji: '🤖',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    totalLessons: 6,
    lessons: [
      { id: 'swe-01', title: 'AI-assisted development vocabulary', lessonIndex: 0, xpReward: 45 },
      { id: 'swe-02', title: 'React Native & cross-platform language', lessonIndex: 1, xpReward: 45 },
      { id: 'swe-03', title: 'System design discussion language', lessonIndex: 2, xpReward: 45 },
      { id: 'swe-04', title: 'DevOps & CI/CD communication', lessonIndex: 3, xpReward: 45 },
      { id: 'swe-05', title: 'Open source contribution English', lessonIndex: 4, xpReward: 45 },
      { id: 'swe-06', title: 'Tech leadership communication', lessonIndex: 5, xpReward: 60 },
    ]
  },
  {
    id: 'cars-automotive-ev',
    title: 'Cars & Automotive EV English',
    description: 'Vocabulary for car enthusiasts, mechanics, and the EV transition.',
    descriptionPt: 'Vocabulário para entusiastas de carros, mecânicos e a transição EV.',
    level: 'Specialty',
    tag: 'Automotive',
    emoji: '🏎️',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'car-01', title: 'EV vocabulary & how they work', lessonIndex: 0, xpReward: 35 },
      { id: 'car-02', title: 'Hybrid systems & the EV transition', lessonIndex: 1, xpReward: 35 },
      { id: 'car-03', title: 'Modern car tech: ADAS & OTA updates', lessonIndex: 2, xpReward: 35 },
      { id: 'car-04', title: 'Road vocabulary & driving jargon', lessonIndex: 3, xpReward: 35 },
      { id: 'car-05', title: 'Mechanics & workshop English', lessonIndex: 4, xpReward: 45 },
    ]
  },
  {
    id: 'english-for-traveling',
    title: 'English for Traveling',
    description: 'Practical English to navigate airports, hotels, and emergencies abroad.',
    descriptionPt: 'Inglês prático para navegar em aeroportos, hotéis e emergências no exterior.',
    level: 'Specialty',
    tag: 'Travel',
    emoji: '✈️',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    totalLessons: 5,
    lessons: [
      { id: 'trv-01', title: 'Airports & check-in', lessonIndex: 0, xpReward: 30 },
      { id: 'trv-02', title: 'Hotels & accommodation', lessonIndex: 1, xpReward: 30 },
      { id: 'trv-03', title: 'Ordering food & handling complaints', lessonIndex: 2, xpReward: 30 },
      { id: 'trv-04', title: 'Emergencies & asking for help', lessonIndex: 3, xpReward: 30 },
      { id: 'trv-05', title: 'Cultural etiquette & social cues', lessonIndex: 4, xpReward: 40 },
    ]
  },
  {
    id: 'usa-car-culture',
    title: 'American Car Culture & History',
    description: 'Explore the rich history of muscle cars, hot rods, legendary road trips, and cultural lowriders in the USA.',
    descriptionPt: 'Explore a rica história dos muscle cars, hot rods, viagens lendárias e lowriders culturais nos EUA.',
    level: 'Specialty',
    tag: 'Culture',
    emoji: '🇺🇸',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'usc-01', title: 'The Rise of Muscle Cars', lessonIndex: 0, xpReward: 40 },
      { id: 'usc-02', title: 'Hot Rods & Custom Car Styles', lessonIndex: 1, xpReward: 40 },
      { id: 'usc-03', title: 'Route 66 & Classic Road Trips', lessonIndex: 2, xpReward: 40 },
      { id: 'usc-04', title: 'Lowriders & Cultural Expression', lessonIndex: 3, xpReward: 50 },
    ]
  },
  {
    id: 'medical-english',
    title: 'Medical English & Healthcare',
    description: 'Master specialized vocabulary for clinical settings, NICU/PICU care, nursing, and hospital management.',
    descriptionPt: 'Domine o vocabulário especializado para ambientes clínicos, cuidados de UTIP/UTIN, enfermagem e gestão hospitalar.',
    level: 'Specialty',
    tag: 'Healthcare',
    emoji: '🩺',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'med-01', title: 'Medical Abbreviations & Terminology', lessonIndex: 0, xpReward: 40 },
      { id: 'med-02', title: 'PICU & NICU Critical Care', lessonIndex: 1, xpReward: 40 },
      { id: 'med-03', title: 'Clinical Nursing Practice', lessonIndex: 2, xpReward: 40 },
      { id: 'med-04', title: 'Hospital Administration & Management', lessonIndex: 3, xpReward: 50 },
    ]
  },
  {
    id: 'law-enforcement',
    title: 'Legal English & Courtroom Culture',
    description: 'Master communication for litigation, jury trials, courtroom hearings, and police encounter rights.',
    descriptionPt: 'Domine a comunicação para litígios, julgamentos por júri, audiências judiciais e direitos em encontros policiais.',
    level: 'Specialty',
    tag: 'Legal',
    emoji: '⚖️',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'law-01', title: 'Miranda Rights & Police Encounters', lessonIndex: 0, xpReward: 40 },
      { id: 'law-02', title: 'Civil Litigation & Case Prep', lessonIndex: 1, xpReward: 40 },
      { id: 'law-03', title: 'The US Jury Trial System', lessonIndex: 2, xpReward: 40 },
      { id: 'law-04', title: 'Courtroom Hearings & Advocacy', lessonIndex: 3, xpReward: 50 },
    ]
  },
  {
    id: 'describe-it',
    title: 'Describe It! English Imagery & Adjectives',
    description: 'Master the art of describing objects, places, people, and feelings with vivid vocabulary.',
    descriptionPt: 'Domine a arte de descrever objetos, lugares, pessoas e sentimentos com um vocabulário vívido.',
    level: 'Intermediate',
    tag: 'Conversation',
    emoji: '🎨',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'desc-01', title: 'Describing Places & Atmosphere', lessonIndex: 0, xpReward: 30 },
      { id: 'desc-02', title: 'Describing People & Personalities', lessonIndex: 1, xpReward: 30 },
      { id: 'desc-03', title: 'Describing Food, Tastes & Textures', lessonIndex: 2, xpReward: 30 },
      { id: 'desc-04', title: 'Describing Emotions & Abstract Feelings', lessonIndex: 3, xpReward: 40 },
    ]
  },
  {
    id: 'friendship-social',
    title: 'Friendship & Social Connections',
    description: 'Navigate informal gatherings, make new friends, and share stories about relationships.',
    descriptionPt: 'Navegue por encontros informais, faça novos amigos e compartilhe histórias sobre relacionamentos.',
    level: 'Intermediate',
    tag: 'Conversation',
    emoji: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'frnd-01', title: 'Making Small Talk & Breaking the Ice', lessonIndex: 0, xpReward: 30 },
      { id: 'frnd-02', title: 'Hosting Friends & Dinner Etiquette', lessonIndex: 1, xpReward: 30 },
      { id: 'frnd-03', title: 'Deep Conversations & Sharing Personal Stories', lessonIndex: 2, xpReward: 30 },
      { id: 'frnd-04', title: 'Handling Conflicts & Giving Advice to Friends', lessonIndex: 3, xpReward: 40 },
    ]
  },
  {
    id: 'getting-outside',
    title: 'Getting Outside: Outdoor Activities & Nature',
    description: 'Vocabulary for hiking, camping, beach days, and discussing environmental topics.',
    descriptionPt: 'Vocabulário para caminhadas, acampamentos, dias de praia e discussões sobre temas ambientais.',
    level: 'Intermediate',
    tag: 'Conversation',
    emoji: '⛺',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'out-01', title: 'Hiking, Camping & Wilderness Safety', lessonIndex: 0, xpReward: 30 },
      { id: 'out-02', title: 'Beach Days, Surfing & Coastal English', lessonIndex: 1, xpReward: 30 },
      { id: 'out-03', title: 'Explaining Nature, Weather & Seasons', lessonIndex: 2, xpReward: 30 },
      { id: 'out-04', title: 'Discussing the Environment & Sustainability', lessonIndex: 3, xpReward: 40 },
    ]
  },
  {
    id: 'idioms-mastery',
    title: 'Idioms Mastery: Weather, Sports & Everyday Life',
    description: 'Speak like a native using idiomatic expressions from sports, weather, and daily routines.',
    descriptionPt: 'Fale como um nativo usando expressões idiomáticas de esportes, clima e rotinas diárias.',
    level: 'Intermediate',
    tag: 'Conversation',
    emoji: '🗣️',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    totalLessons: 3,
    lessons: [
      { id: 'idm-01', title: 'Weather Idioms', lessonIndex: 0, xpReward: 30 },
      { id: 'idm-02', title: 'Sports Idioms', lessonIndex: 1, xpReward: 30 },
      { id: 'idm-03', title: 'Everyday Idioms', lessonIndex: 2, xpReward: 40 },
    ]
  },
  {
    id: 'movies-tv-culture',
    title: 'Movies & Television: From Netflix to Amazon Prime',
    description: 'Discuss your favorite series, analyze plots, debate character tropes, and talk about pop culture.',
    descriptionPt: 'Discuta suas séries favoritas, analise enredos, debata clichês de personagens e fale sobre cultura pop.',
    level: 'Advanced',
    tag: 'Culture',
    emoji: '🍿',
    imageUrl: 'https://images.unsplash.com/photo-1524749292158-7540c2494485?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'mov-01', title: 'Streaming Culture & Binge-Watching', lessonIndex: 0, xpReward: 40 },
      { id: 'mov-02', title: 'Movie Genres, Plots & Story Tropes', lessonIndex: 1, xpReward: 40 },
      { id: 'mov-03', title: 'Writing Reviews & Critical Vocabulary', lessonIndex: 2, xpReward: 40 },
      { id: 'mov-04', title: 'The Business of Hollywood & Streaming Wars', lessonIndex: 3, xpReward: 50 },
    ]
  },
  {
    id: 'music-lyrics-culture',
    title: 'Music & Song Lyrics: Rhyme and Rhythm',
    description: 'Understand idioms in song lyrics, discuss musical genres, and explore the history of American music.',
    descriptionPt: 'Entenda expressões idiomáticas em letras de música, discuta gêneros musicais e explore a história da música americana.',
    level: 'Advanced',
    tag: 'Culture',
    emoji: '🎵',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    totalLessons: 4,
    lessons: [
      { id: 'mus-01', title: 'Talking Genres, Tempos & Musical Taste', lessonIndex: 0, xpReward: 40 },
      { id: 'mus-02', title: 'Analyzing Idioms in Song Lyrics', lessonIndex: 1, xpReward: 40 },
      { id: 'mus-03', title: 'Concerts, Festivals & Live Events', lessonIndex: 2, xpReward: 40 },
      { id: 'mus-04', title: 'Music Production, Streaming & Global Influence', lessonIndex: 3, xpReward: 50 },
    ]
  }
];
