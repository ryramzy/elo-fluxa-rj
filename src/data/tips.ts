export interface Tip {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  preview: string;
  fullContent: string;
  readTime: string;
  courseId: string;
}

export const tips: Tip[] = [
  {
    id: 'tip-1',
    title: 'The American "Small Talk" Secret',
    category: 'Business',
    categoryColor: 'blue',
    preview: 'Learn how Americans make conversation without being awkward or too personal.',
    fullContent: 'Americans use "small talk" as a social lubricant. It\'s not about deep connection - it\'s about creating comfort. The formula: weather + recent positive event + open-ended question about plans. Example: "Beautiful weather today! I just finished a great meeting. Any exciting plans for the weekend?" The key is keeping it light and positive. Never discuss politics, religion, or money in small talk. Sports, weather, travel, and food are safe topics. Practice this formula and you\'ll sound like a native American professional.',
    readTime: '3 min',
    courseId: 'business-english'
  },
  {
    id: 'tip-2',
    title: 'NBA Slang That Confuses Everyone',
    category: 'Sports',
    categoryColor: 'orange',
    preview: 'Understand the slang terms that make NBA broadcasts sound like a different language.',
    fullContent: 'When Americans watch NBA games, they use slang that sounds confusing. "He\'s cooking" means a player is playing exceptionally well. "Bucket" means a successful shot. "Drip" refers to stylish clothing or accessories. "Clutch" means performing well under pressure. "Trash talk" is friendly competitive banter between players. Learning these terms will help you understand American sports conversations and participate in them naturally. Next time you watch a game, listen for these phrases and try using them yourself.',
    readTime: '4 min',
    courseId: 'sports-english'
  },
  {
    id: 'tip-3',
    title: 'Hip Hop English: Not Slang, Culture',
    category: 'Culture',
    categoryColor: 'purple',
    preview: 'Why hip hop English is a complete linguistic system, not just "slang".',
    fullContent: 'Hip hop English (AAVE) follows consistent grammatical rules that differ from standard English. The deletion of "is" in sentences like "He working" follows a pattern. The use of "ain\'t" as a negative auxiliary is systematic. This isn\'t "broken English" - it\'s a different English with its own history and rules. When you learn hip hop English, you\'re learning a dialect that has influenced global culture. Respect it as a legitimate form of English, not as "slang" to be used casually.',
    readTime: '5 min',
    courseId: 'hiphop-culture'
  },
  {
    id: 'tip-4',
    title: 'Medical English: The Prescription',
    category: 'Medical',
    categoryColor: 'red',
    preview: 'How to write and understand medical prescriptions in English.',
    fullContent: 'American prescriptions use specific abbreviations: "qd" (quaque die) means once daily, "bid" (bis in die) means twice daily, "tid" (ter in die) means three times daily. "PO" (per os) means by mouth, "PRN" (pro re nata) means as needed. Understanding these abbreviations is crucial for medical professionals working in the US. Also learn the difference between "over-the-counter" (OTC) and "prescription" medications. American patients expect clear explanations of their medications in simple terms.',
    readTime: '4 min',
    courseId: 'medical-english'
  },
  {
    id: 'tip-5',
    title: 'TOEFL Writing: The American Essay Formula',
    category: 'Academic',
    categoryColor: 'green',
    preview: 'The 5-paragraph essay structure that American universities expect.',
    fullContent: 'American academic writing follows a strict formula: introduction with thesis statement, three body paragraphs each with a topic sentence and supporting evidence, and conclusion that restates the thesis. The thesis statement must be the last sentence of your introduction. Each body paragraph should start with a transition word (First, Second, Finally). This structure might feel rigid, but it\'s what American professors expect. Practice this formula and your TOEFL writing score will improve dramatically.',
    readTime: '6 min',
    courseId: 'study-abroad'
  },
  {
    id: 'tip-6',
    title: 'American Police: What "Miranda Rights" Really Mean',
    category: 'Law',
    categoryColor: 'indigo',
    preview: 'Understanding your rights during police encounters in America.',
    fullContent: 'When American police say "You have the right to remain silent," they\'re reading Miranda rights. This means: 1) You don\'t have to answer questions, 2) Anything you say can be used against you, 3) You have the right to a lawyer, 4) If you can\'t afford a lawyer, one will be provided. The key is saying "I\'m going to remain silent" and "I want a lawyer" clearly. These rights protect you from self-incrimination. Unlike Brazil, American police cannot force you to speak without a lawyer present.',
    readTime: '5 min',
    courseId: 'law-enforcement'
  },
  {
    id: 'tip-7',
    title: 'American Business Emails: The Culture',
    category: 'Business',
    categoryColor: 'blue',
    preview: 'Why American business emails are different from Brazilian ones.',
    fullContent: 'American business emails are direct and action-oriented. Start with the main point, not pleasantries. Use bullet points for multiple items. End with a clear call to action. Avoid emotional language or excessive politeness. "Best regards" is safer than "Warmly." Americans value brevity - keep emails under 150 words when possible. Also note that Americans expect responses within 24 hours. No response means "no" in American business culture.',
    readTime: '4 min',
    courseId: 'business-english'
  },
  {
    id: 'tip-8',
    title: 'American Sports Idioms in Business',
    category: 'Business',
    categoryColor: 'blue',
    preview: 'Sports metaphors Americans use in business meetings.',
    fullContent: 'Americans constantly use sports metaphors in business: "Step up to the plate" (take responsibility), "Touch base" (check in), "Home run" (big success), "Drop the ball" (make a mistake), "Team player" (cooperative colleague), "Game plan" (strategy), "Full-court press" (intense effort). Understanding these metaphors is crucial for following American business conversations. They come from baseball, basketball, and football - America\'s most popular sports. Learn these and you\'ll understand 80% of American business idioms.',
    readTime: '4 min',
    courseId: 'business-english'
  }
];
