export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'conversation';
  description: string;
  xpReward: number;
  free: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  totalXpReward: number;
  color: string;
  accentColor: string;
  emoji: string;
  tag: string;
  audience: string;
  aboutText: string;
  whoThisIsFor: string;
  whatYouWillLearn: string[];
  imageUrl: string;
}

export const courses: Course[] = [
  {
    id: 'business-english',
    title: 'Business English — Entrevistas e Confiança',
    description: 'Comunicação profissional, entrevistas de emprego e confiança no ambiente corporativo.',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
    lessons: [
      {
        id: 'lesson-1',
        title: 'First impressions: how Americans greet in professional settings',
        duration: '8 min',
        type: 'reading',
        description: 'Learn the art of professional greetings and making strong first impressions in American business culture.',
        xpReward: 15,
        free: true
      },
      {
        id: 'lesson-2',
        title: 'The elevator pitch: sell yourself in 60 seconds',
        duration: '12 min',
        type: 'video',
        description: 'Craft and deliver compelling elevator pitches that capture attention and open doors.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-3',
        title: 'Interview vocabulary: 50 phrases that get you hired',
        duration: '15 min',
        type: 'reading',
        description: 'Essential phrases and vocabulary that impress interviewers and showcase your professionalism.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-4',
        title: 'Salary negotiation in English: scripts that work',
        duration: '20 min',
        type: 'conversation',
        description: 'Practice salary negotiation conversations with proven scripts and confidence-building techniques.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-5',
        title: 'Email etiquette: tone, structure, and sign-offs',
        duration: '10 min',
        type: 'reading',
        description: 'Master professional email communication with proper tone, formatting, and cultural nuances.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-6',
        title: 'Conference calls and Zoom meetings: phrases and flow',
        duration: '14 min',
        type: 'video',
        description: 'Navigate virtual meetings confidently with key phrases and meeting management skills.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-7',
        title: 'Giving presentations: opening, body, closing',
        duration: '18 min',
        type: 'conversation',
        description: 'Structure and deliver impactful presentations that engage and persuade American audiences.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-8',
        title: 'Small talk mastery: weather, sports, weekend plans',
        duration: '8 min',
        type: 'reading',
        description: 'Build rapport through authentic small talk that feels natural to native speakers.',
        xpReward: 15,
        free: false
      },
      {
        id: 'lesson-9',
        title: 'Handling difficult questions in interviews',
        duration: '12 min',
        type: 'quiz',
        description: 'Practice responding to challenging interview questions with confidence and clarity.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-10',
        title: 'Writing a LinkedIn profile that gets noticed',
        duration: '15 min',
        type: 'reading',
        description: 'Optimize your LinkedIn profile for American recruiters and professional networking.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-11',
        title: 'Networking events: how to work a room in English',
        duration: '20 min',
        type: 'conversation',
        description: 'Master the art of networking events from introductions to meaningful connections.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-12',
        title: 'Final assessment: mock interview with Matt',
        duration: '30 min',
        type: 'conversation',
        description: 'Complete mock interview with personalized feedback and improvement strategies.',
        xpReward: 40,
        free: false
      }
    ],
    totalXpReward: 300,
    color: '#e6f1fb',
    accentColor: '#185fa5',
    emoji: '💼',
    tag: 'Pro',
    audience: 'Profissionais',
    aboutText: 'Master the language of American business with practical skills for interviews, meetings, and professional networking. This course focuses on real-world scenarios you\'ll encounter in corporate environments.',
    whoThisIsFor: 'Professionals seeking to work in American companies, advance their careers, or improve their business English confidence.',
    whatYouWillLearn: [
      'Craft compelling elevator pitches and professional introductions',
      'Navigate interviews and salary negotiations with confidence',
      'Master email etiquette and virtual meeting communication',
      'Build professional relationships through effective networking',
      'Deliver impactful presentations and handle difficult questions'
    ]
  },
  {
    id: 'sports-english',
    title: 'Sports English — Basquete e Futebol Americano',
    description: 'Gírias, regras, cultura e conversação do mundo dos esportes americanos.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Basketball basics: the court, positions, and rules',
        duration: '10 min',
        type: 'reading',
        description: 'Learn fundamental basketball terminology and understand the layout of the court.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-2',
        title: 'NFL fundamentals: downs, yards, and touchdowns explained',
        duration: '14 min',
        type: 'video',
        description: 'Master American football basics including scoring, positions, and game flow.',
        xpReward: 25,
        free: true
      },
      {
        id: 'lesson-3',
        title: 'Trash talk and compliments: the language of the court',
        duration: '8 min',
        type: 'reading',
        description: 'Understand sports trash talk culture and appropriate ways to engage in competitive banter.',
        xpReward: 15,
        free: false
      },
      {
        id: 'lesson-4',
        title: 'March Madness: college basketball culture',
        duration: '12 min',
        type: 'video',
        description: 'Explore the excitement and cultural significance of NCAA March Madness tournament.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-5',
        title: 'The Super Bowl: more than a game',
        duration: '15 min',
        type: 'reading',
        description: 'Discover why the Super Bowl is America\'s biggest cultural event beyond just football.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-6',
        title: 'Sports commentary: how announcers speak',
        duration: '10 min',
        type: 'video',
        description: 'Learn the language and style of professional sports commentators.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-7',
        title: 'Fantasy sports: vocabulary for the obsessed',
        duration: '12 min',
        type: 'reading',
        description: 'Master fantasy football and basketball terminology to join conversations with fans.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-8',
        title: 'Sports interviews: how athletes speak to media',
        duration: '18 min',
        type: 'conversation',
        description: 'Practice the language patterns and clichés used in post-game sports interviews.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-9',
        title: 'Betting, stats, and analytics language',
        duration: '10 min',
        type: 'reading',
        description: 'Understand sports betting terminology and advanced analytics discussions.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-10',
        title: 'Final challenge: commentate a play-by-play',
        duration: '25 min',
        type: 'conversation',
        description: 'Test your skills by commentating a real sports play with Matt\'s guidance.',
        xpReward: 35,
        free: false
      }
    ],
    totalXpReward: 280,
    color: '#faeeda',
    accentColor: '#ba7517',
    emoji: '🏀',
    tag: 'Hot',
    audience: 'Fãs de esportes',
    aboutText: 'Immerse yourself in American sports culture while learning the language of basketball and football. Perfect for fans who want to understand games, commentary, and fan conversations.',
    whoThisIsFor: 'Sports enthusiasts who want to understand American games, follow commentary, and discuss sports like a native fan.',
    whatYouWillLearn: [
      'Understand basketball and football rules and terminology',
      'Follow sports commentary and analysis like a native speaker',
      'Participate in sports conversations and fantasy leagues',
      'Appreciate the cultural significance of major sporting events',
      'Commentate games and discuss plays with confidence'
    ]
  },
  {
    id: 'hiphop-culture',
    title: 'Hip Hop — Cultura e Inglês Americano',
    description: 'Do Bronx ao Brasil — a linguagem, história e cultura do hip hop americano.',
    imageUrl: 'https://images.unsplash.com/photos/man-wearing-a-large-mushroom-hat-rapping-into-microphone-2B-km350_24?w=600&q=80',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Origins: the Bronx, the block party, and the birth of hip hop',
        duration: '12 min',
        type: 'reading',
        description: 'Explore the historical roots of hip hop in 1970s Bronx and its cultural significance.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-2',
        title: 'The four elements: rap, DJing, breakdancing, graffiti',
        duration: '15 min',
        type: 'video',
        description: 'Discover the four foundational elements that define hip hop culture worldwide.',
        xpReward: 25,
        free: true
      },
      {
        id: 'lesson-3',
        title: 'AAVE: African American Vernacular English explained respectfully',
        duration: '18 min',
        type: 'reading',
        description: 'Learn about AAVE as a legitimate dialect with its own grammar and cultural context.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-4',
        title: 'Rap lyrics decoded: slang, metaphors, and wordplay',
        duration: '14 min',
        type: 'reading',
        description: 'Analyze rap lyrics to understand complex wordplay, metaphors, and cultural references.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-5',
        title: 'Regional dialects: NY vs LA vs Atlanta vs Houston',
        duration: '16 min',
        type: 'video',
        description: 'Compare different regional hip hop styles and dialects across America.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-6',
        title: 'Hip hop and social justice: the language of protest',
        duration: '12 min',
        type: 'reading',
        description: 'Understand how hip hop has been a voice for social change and political expression.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-7',
        title: 'Beatmaking vocabulary: bars, hooks, bridges, and drops',
        duration: '10 min',
        type: 'reading',
        description: 'Learn the terminology of music production and beatmaking in hip hop.',
        xpReward: 15,
        free: false
      },
      {
        id: 'lesson-8',
        title: 'Final project: write and present your own 8 bars',
        duration: '30 min',
        type: 'conversation',
        description: 'Create and perform your own 8-bar rap with Matt\'s feedback and guidance.',
        xpReward: 40,
        free: false
      }
    ],
    totalXpReward: 200,
    color: '#eeedfe',
    accentColor: '#534ab7',
    emoji: '🎤',
    tag: 'New',
    audience: 'Amantes de cultura',
    aboutText: 'Dive deep into hip hop culture and its influence on American English. From the Bronx block parties to global dominance, understand the language that shaped modern American speech.',
    whoThisIsFor: 'Culture enthusiasts, music lovers, and anyone interested in understanding the cultural roots of modern American slang.',
    whatYouWillLearn: [
      'Understand hip hop\'s historical and cultural significance',
      'Decode rap lyrics and appreciate wordplay techniques',
      'Recognize regional dialects and styles across America',
      'Appreciate hip hop as a vehicle for social commentary',
      'Create your own rhymes and understand beatmaking terminology'
    ]
  },
  {
    id: 'medical-english',
    title: 'Medical English for Professionals',
    description: 'Vocabulário clínico e comunicação profissional para médicos e enfermeiros.',
    imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Hospital vocabulary: departments, roles, and equipment',
        duration: '10 min',
        type: 'reading',
        description: 'Master essential hospital terminology including departments, job titles, and medical equipment.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-2',
        title: 'Patient intake: how to ask questions in English',
        duration: '15 min',
        type: 'conversation',
        description: 'Practice patient intake interviews with proper medical questioning techniques.',
        xpReward: 25,
        free: true
      },
      {
        id: 'lesson-3',
        title: 'Describing symptoms: precision language for diagnosis',
        duration: '12 min',
        type: 'reading',
        description: 'Learn precise vocabulary for describing symptoms and medical conditions.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-4',
        title: 'Medication instructions: dosage, frequency, side effects',
        duration: '10 min',
        type: 'reading',
        description: 'Master clear communication about medications, dosages, and potential side effects.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-5',
        title: 'Emergency room communication: urgent language',
        duration: '14 min',
        type: 'video',
        description: 'Learn critical communication skills for high-pressure emergency situations.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-6',
        title: 'Surgical team communication: sterile field vocabulary',
        duration: '8 min',
        type: 'reading',
        description: 'Understand operating room terminology and sterile field communication protocols.',
        xpReward: 15,
        free: false
      },
      {
        id: 'lesson-7',
        title: 'Medical records and documentation in English',
        duration: '15 min',
        type: 'reading',
        description: 'Learn proper medical documentation and record-keeping terminology.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-8',
        title: 'Breaking bad news: compassionate language frameworks',
        duration: '20 min',
        type: 'conversation',
        description: 'Practice delivering difficult medical news with empathy and clarity.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-9',
        title: 'Telemedicine: conducting remote consultations',
        duration: '12 min',
        type: 'video',
        description: 'Adapt medical communication for virtual consultations and telemedicine platforms.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-10',
        title: 'Interdisciplinary meetings: presenting cases',
        duration: '18 min',
        type: 'conversation',
        description: 'Practice presenting medical cases to interdisciplinary teams effectively.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-11',
        title: 'Patient rights and informed consent language',
        duration: '10 min',
        type: 'reading',
        description: 'Understand legal terminology around patient rights and informed consent.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-12',
        title: 'Medical ethics vocabulary',
        duration: '12 min',
        type: 'reading',
        description: 'Master terminology for discussing medical ethics and professional conduct.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-13',
        title: 'US vs Brazilian medical culture: key differences',
        duration: '15 min',
        type: 'reading',
        description: 'Navigate cultural differences between American and Brazilian medical systems.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-14',
        title: 'Final assessment: full patient consultation simulation',
        duration: '35 min',
        type: 'conversation',
        description: 'Complete comprehensive patient consultation with realistic scenarios.',
        xpReward: 40,
        free: false
      }
    ],
    totalXpReward: 350,
    color: '#e1f5ee',
    accentColor: '#1d9e75',
    emoji: '🩺',
    tag: 'Pro',
    audience: 'Profissionais de saúde',
    aboutText: 'Comprehensive medical English training covering clinical vocabulary, patient communication, and professional healthcare terminology. Designed for medical professionals working in or with American healthcare systems.',
    whoThisIsFor: 'Doctors, nurses, and healthcare professionals who need to communicate effectively in English medical environments.',
    whatYouWillLearn: [
      'Master clinical vocabulary and medical terminology',
      'Conduct patient interviews and medical histories confidently',
      'Communicate effectively in emergency and surgical settings',
      'Navigate medical ethics and patient rights discussions',
      'Adapt to American medical culture and documentation standards'
    ]
  },
  {
    id: 'study-abroad',
    title: 'Study Abroad & Exam Prep',
    description: 'TOEFL, IELTS e inglês acadêmico para quem vai estudar fora do Brasil.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    lessons: [
      {
        id: 'lesson-1',
        title: 'TOEFL vs IELTS: which exam is right for you',
        duration: '10 min',
        type: 'reading',
        description: 'Compare TOEFL and IELTS exams to choose the best test for your academic goals.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-2',
        title: 'Academic writing: essays, thesis statements, citations',
        duration: '15 min',
        type: 'reading',
        description: 'Master American academic writing standards including essays and proper citation.',
        xpReward: 25,
        free: true
      },
      {
        id: 'lesson-3',
        title: 'University vocabulary: lectures, seminars, office hours',
        duration: '12 min',
        type: 'reading',
        description: 'Learn essential terminology for navigating American university life.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-4',
        title: 'Reading comprehension strategies for timed exams',
        duration: '20 min',
        type: 'quiz',
        description: 'Practice effective reading strategies for standardized test success.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-5',
        title: 'Listening skills: accents, speed, and note-taking',
        duration: '15 min',
        type: 'video',
        description: 'Develop listening comprehension for various American accents and speaking speeds.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-6',
        title: 'Speaking section mastery: TOEFL independent task',
        duration: '20 min',
        type: 'conversation',
        description: 'Practice TOEFL speaking tasks with timing and scoring strategies.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-7',
        title: 'Writing section: integrated task strategies',
        duration: '14 min',
        type: 'reading',
        description: 'Master integrated writing tasks combining reading and listening comprehension.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-8',
        title: 'Dorm life and campus culture in America',
        duration: '12 min',
        type: 'video',
        description: 'Understand American campus culture, dorm life, and student social dynamics.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-9',
        title: 'Making friends abroad: social English for students',
        duration: '18 min',
        type: 'conversation',
        description: 'Practice social situations and friendship-building in academic settings.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-10',
        title: 'Financial aid and scholarship applications in English',
        duration: '10 min',
        type: 'reading',
        description: 'Navigate American financial aid and scholarship application processes.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-11',
        title: 'Final mock exam: full TOEFL simulation',
        duration: '45 min',
        type: 'quiz',
        description: 'Complete full TOEFL simulation with realistic timing and difficulty.',
        xpReward: 40,
        free: false
      }
    ],
    totalXpReward: 280,
    color: '#fbeaf0',
    accentColor: '#d4537e',
    emoji: '🎓',
    tag: 'New',
    audience: 'Estudantes',
    aboutText: 'Comprehensive preparation for studying abroad with focus on TOEFL/IELTS exams and real-world academic English. Master the language skills needed for success in American universities.',
    whoThisIsFor: 'Students planning to study in the United States or needing to pass English proficiency exams for academic purposes.',
    whatYouWillLearn: [
      'Choose and prepare for the right English proficiency exam',
      'Master academic writing and citation standards',
      'Develop listening comprehension for various American accents',
      'Practice speaking tasks with proper timing and strategies',
      'Navigate American campus culture and social situations'
    ]
  },
  {
    id: 'law-enforcement',
    title: 'Law Enforcement Culture & English',
    description: 'Vocabulário, cultura e comunicação do sistema policial americano.',
    imageUrl: 'https://images.unsplash.com/photos/police-dog-9k-unit-tactical-gear-cop-car-background-Udu9NgiNFk8?w=600&q=80',
    lessons: [
      {
        id: 'lesson-1',
        title: 'American police structure: federal, state, local',
        duration: '10 min',
        type: 'reading',
        description: 'Understand the complex hierarchy and structure of American law enforcement agencies.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-2',
        title: 'Miranda rights and legal vocabulary',
        duration: '12 min',
        type: 'reading',
        description: 'Master Miranda rights and essential legal terminology for police work.',
        xpReward: 20,
        free: true
      },
      {
        id: 'lesson-3',
        title: 'Police radio communication and 10-codes',
        duration: '14 min',
        type: 'video',
        description: 'Learn police radio protocols, 10-codes, and communication procedures.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-4',
        title: 'Use of force continuum: language and policy',
        duration: '12 min',
        type: 'reading',
        description: 'Understand use of force terminology and policy language in American policing.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-5',
        title: 'Court system vocabulary: from arrest to verdict',
        duration: '15 min',
        type: 'reading',
        description: 'Navigate the American court system with proper legal terminology.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-6',
        title: 'Detective work: investigation and interrogation language',
        duration: '16 min',
        type: 'video',
        description: 'Master investigation techniques and interrogation communication strategies.',
        xpReward: 25,
        free: false
      },
      {
        id: 'lesson-7',
        title: 'Community policing: building trust through language',
        duration: '18 min',
        type: 'conversation',
        description: 'Practice community policing communication and relationship-building skills.',
        xpReward: 30,
        free: false
      },
      {
        id: 'lesson-8',
        title: 'FBI and federal agencies: culture and communication',
        duration: '10 min',
        type: 'reading',
        description: 'Understand federal law enforcement culture and communication protocols.',
        xpReward: 20,
        free: false
      },
      {
        id: 'lesson-9',
        title: 'Final scenario: handle a real situation in English',
        duration: '30 min',
        type: 'conversation',
        description: 'Complete realistic police scenario with comprehensive English communication.',
        xpReward: 35,
        free: false
      }
    ],
    totalXpReward: 220,
    color: '#f1efe8',
    accentColor: '#888780',
    emoji: '🚔',
    tag: 'New',
    audience: 'Segurança pública',
    aboutText: 'Specialized English training for law enforcement professionals covering American police culture, legal terminology, and communication protocols essential for effective policing.',
    whoThisIsFor: 'Police officers, federal agents, and law enforcement professionals working with American systems or international cooperation.',
    whatYouWillLearn: [
      'Master American law enforcement structure and terminology',
      'Communicate effectively using police radio protocols and 10-codes',
      'Navigate legal procedures and court system vocabulary',
      'Build community relationships through effective communication',
      'Handle real policing scenarios with confidence in English'
    ]
  }
];
