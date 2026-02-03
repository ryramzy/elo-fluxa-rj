/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Product, Testimonial, JournalArticle } from './types';

export const STUDENT_COUNT = 54;
export const WHATSAPP_NUMBER = "5522992322566";
export const WHATSAPP_MESSAGE = "Olá Matthew! Vi seu site e gostaria de saber mais sobre as aulas de inglês.";
export const BRAND_NAME = "Elo Matt!";

export const MATTHEW_BIO = {
  intro: {
    title: "Welcome! It’s great to meet you 😊",
    text: "Whether your goal is fluent conversation, sharper grammar, or speaking confidently about technology, work, and ideas, I’m here to help. My lessons are practical, engaging, and tailored to real life—so you leave each session feeling more confident and clearer in how you express yourself. Let’s make learning effective, relevant, and enjoyable 🚀"
  },
  aboutMe: {
    title: "About Me",
    text: "🌍 Curious mind. Global perspective. I’ve traveled to 13 countries, lived in three, and explored diverse regions of the U.S. Along the way, I’ve developed a deep appreciation for culture, communication, and how ideas move across borders. Professionally and personally, I’m passionate about: Technology & innovation (Generative AI, AI agents, cloud architecture, AWS, S3) Education & communication Philosophy (Stoicism, ethics, critical thinking, systems thinking) Public policy, globalization, and society. I enjoy helping students talk comfortably about modern topics—from AI and tech careers to philosophy, culture, and everyday life—while also improving pronunciation, clarity, and confidence. Outside the classroom, I stay active 💪 (gym, hiking, beach days 🏖️) and believe learning should feel dynamic and human, not rigid or robotic."
  },
  languages: [
    { name: "English", level: "Native (USA Accent)", icon: "🇺🇸" },
    { name: "Portuguese", level: "Fluent", icon: "🇧🇷" },
    { name: "Spanish", level: "Basic", icon: "🇪🇸" }
  ],
  interests: [
    "Food", "Movies", "Music", "Science", "Travel", "History", "Technology", "Philosophy", 
    "Health and Wellness", "Art", "Fitness & discipline (boxing and martial arts)", 
    "Relationships and communication", "Ancient and alternative history", "Space", 
    "Speculative ideas", "Stoic philosophy"
  ],
  specialties: [
    { name: "Business", icon: "💼" },
    { name: "Finance", icon: "💰" },
    { name: "Technology", icon: "💻" }
  ],
  teachingStyle: "In class, I focus on guided learning, practical language foundations, and light dictation to help you understand how English works in real contexts. Our sessions are mostly conversation-based, with flexibility to focus on specific areas you want to improve.",
  levels: ["Beginner", "Intermediate", "Upper Intermediate", "Advanced"],
  skills: ["Grammar", "Conversation Practice", "English for Business", "Reading", "Accent Reduction", "Vocabulary", "Test Preparation (IELTS)"],
  industries: ["Business", "Finance", "Technology", "Public Services", "Engineering", "Education", "Entertainment", "Government", "Sustainability", "Law & Compliance"],
  education: [
    {
      degree: "Google Cloud Architect Certification",
      school: "Google Cloud",
      focus: "Entrepreneurship • Technology • Internet. Training in cloud architecture, infrastructure design, scalability, security, and modern technologies."
    },
    {
      degree: "Graduate Studies in Economics",
      school: "University of Sydney",
      focus: "Finance and Banking. Advanced coursework in economic theory, development, and global markets."
    },
    {
      degree: "Bachelor of Arts (BA)",
      school: "Law • Government • Research",
      focus: "Focused on governance, public policy, international relations, and critical analysis."
    }
  ],
  experience: [
    {
      role: "Sustainability Planner",
      company: "ECO Action (Atlanta, GA)",
      desc: "Bringing engineering expertise to drive environmental initiatives. Analyzing, designing, and implementing sustainable solutions."
    },
    {
      role: "Software Programmer",
      company: "Freelance/Tech",
      desc: "Versatile programmer with experience in front-end, back-end development, and DevOps. Crafting innovative digital solutions."
    },
    {
      role: "Research Associate",
      company: "Government / Law",
      desc: "Using case law and studies to improve government policy regarding the Americans With Disabilities Act."
    },
    {
      role: "Financial Manager",
      company: "Entrepreneurship",
      desc: "Management of Stock, Forex, and Crypto (BTC & Ethereum) portfolios."
    },
    {
      role: "Digital Content Creator",
      company: "Journalism",
      desc: "Published several articles while living in Australia from a student's perspective."
    }
  ]
};

export const PRODUCTS: Product[] = [
  {
    id: 'c1',
    name: 'Business English (Rio Tech / Oil & Gas)',
    tagline: 'Professional mastery for Rio industries.',
    description: 'Especializado para os setores de Petróleo & Gás, Tecnologia e Finanças do Rio de Janeiro.',
    longDescription: 'Para executivos e profissionais que precisam de fluência imediata no ambiente corporativo carioca. Foco em terminologia técnica de Oil & Gas, arquitetura de nuvem e negociações internacionais de alto nível.',
    price: 180,
    category: 'Professional', 
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000',
    features: ['Oil & Gas / Tech Terminology', 'Simulações de Negociação', 'LinkedIn & Email Review']
  },
  {
    id: 'c2',
    name: 'US Visa & Global Interview Prep',
    tagline: 'Native confidence for high-stakes meetings.',
    description: 'Prepare-se para entrevistas de visto americano e processos seletivos em empresas globais.',
    longDescription: 'Matthew utiliza técnicas de coaching para destravar sua fala. Especialmente desenhado para quem vai enfrentar entrevistas consulares (Visto EUA) ou recrutamento internacional no Vale do Silício.',
    price: 150,
    category: 'Coaching',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000',
    features: ['US Visa Interview Simulations', 'Accent Reduction', 'Public Speaking Tech']
  },
  {
    id: 'c3',
    name: 'Carioca Survival English',
    tagline: 'Connect with the world from Rio.',
    description: 'O inglês essencial para o dia a dia do Rio: recepção de turistas e eventos culturais.',
    longDescription: 'Ideal para quem trabalha no setor de hospitalidade, eventos e turismo no Rio. Aprenda a lidar com clientes internacionais de forma natural e sem medo.',
    price: 120,
    category: 'Essential',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000',
    features: ['Hospitality Vocabulary', 'Real Rio Scenarios', 'Fast-Track Grammar']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ricardo M.',
    location: 'Rio de Janeiro (Oil & Gas Executive)',
    locationCode: 'BR',
    date: 'Fev 2025',
    content: 'The specific technical vocabulary for the energy sector was a game changer for my meetings with Houston.',
    translation: 'O vocabulário técnico específico para o setor de energia foi um divisor de águas para as minhas reuniões com Houston.',
    isFeatured: true,
    portugueseSpeaker: true,
    language: 'en'
  },
  {
    id: 't2',
    name: 'Juliana S.',
    location: 'Rio de Janeiro (Tech Lead)',
    locationCode: 'BR',
    date: 'Jan 2025',
    content: 'Preparei minha entrevista para o visto com o Matthew e passei de primeira. Ele entende as pegadinhas que nós brasileiros caímos.',
    translation: 'I prepared my visa interview with Matthew and passed first time. He understands the traps we Brazilians fall into.',
    isFeatured: true,
    portugueseSpeaker: true,
    language: 'pt'
  },
  {
    id: 't3',
    name: 'Marcos V.',
    location: 'São Paulo',
    locationCode: 'BR',
    date: 'Jan 2025',
    content: 'A experiência de ter um professor que entende de tecnologia facilitou muito. Não precisei explicar o que é AWS ou S3, ele já sabia.',
    isFeatured: false,
    portugueseSpeaker: true,
    language: 'pt'
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 1,
    title: 'Mastering Business English in Rio',
    date: 'Mar 10, 2025',
    excerpt: 'Why the Oil & Gas sector requires more than just grammar.',
    image: 'https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=1000',
    content: 'Professional English in the Rio tech and energy sectors is about more than just vocabulary; it is about cultural nuances and specific industry terminology.'
  }
];
