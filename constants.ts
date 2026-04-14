/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Product, Testimonial, JournalArticle } from './types.ts';

export const STUDENT_COUNT = 54;
export const WHATSAPP_NUMBER = "5522992322566";
export const WHATSAPP_MESSAGE = "Oi Matt! Vi seu site e quero começar a aprender inglês americano";
export const BRAND_NAME = "Elo Matt!";

// WhatsApp CTAs for different contexts
export const WHATSAPP_MESSAGES = {
  landing: "Oi%20Matt!%20Vi%20seu%20site%20e%20quero%20saber%20mais%20sobre%20as%20aulas",
  lessonPaywall: "Oi%20Matt!%20Acabei%20de%20fazer%20a%20aula%20gr%C3%A1tis%20e%20quero%20continuar",
  subscription: "Oi%20Matt!%20Quero%20assinar%20o%20plano%20Pro",
  booking: "Oi%20Matt!%20Quero%20agendar%20uma%20aula",
  onboarding: "Oi%20Matt!%20Acabei%20de%20criar%20minha%20conta%20no%20Elo%20Matt!",
  general: "Oi%20Matt!%20Preciso%20de%20ajuda"
};

export const getWhatsAppLink = (context: keyof typeof WHATSAPP_MESSAGES) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGES[context]}`;
};

export const MATTHEW_BIO = {
  intro: {
    title: "Welcome! It’s great to meet you 😊",
    text: "Whether your goal is fluent conversation, sharper grammar, or speaking confidently about technology, work, and ideas, I’m here to help. My lessons are practical, engaging, and tailored to real life—so you leave each session feeling more confident and clearer in how you express yourself. Let’s make learning effective, relevant, and enjoyable 🚀"
  },
  aboutMe: {
    title: "About Me",
    icon: "👋",
    text: "🌍 Curious mind. Global perspective. I’ve traveled to 13 countries, lived in three, and explored diverse regions of the U.S. Along the way, I’ve developed a deep appreciation for culture, communication, and how ideas move across borders. Professionally and personally, I’m passionate about: Technology & innovation (Generative AI, AI agents, cloud architecture, AWS, S3) Education & communication Philosophy (Stoicism, ethics, critical thinking, systems thinking) Public policy, globalization, and society. I enjoy helping students talk comfortably about modern topics—from AI and tech careers to philosophy, culture, and everyday life—while also improving pronunciation, clarity, and confidence. Outside the classroom, I stay active 💪 (gym, hiking, beach days 🏖️) and believe learning should feel dynamic and human, not rigid or robotic. Whether you want: Natural conversation practice, Professional or tech-focused English, or Thoughtful discussions about ideas, work, or the world—I’ll meet you where you are and help you level up. Book a lesson, and let’s build skills that actually matter 🌍✨"
  },
  languages: [
    { name: "English", level: "Native: USA Accent", icon: "🇺🇸" },
    { name: "Portuguese", level: "Fluent", icon: "🇧🇷" },
    { name: "Spanish", level: "Basic", icon: "🇪🇸" }
  ],
  interests: [
    "Food", "Movies", "Music", "Science", "Travel", "History", "Technology", "Philosophy", 
    "Health and Wellness", "Art", "Fitness & discipline (boxing and martial arts)", 
    "Relationships and communication", "Ancient and alternative history", "Space", 
    "Science and speculative ideas", "Stoic philosophy"
  ],
  specialties: {
    expertise: [
      { name: "Business", icon: "💼" },
      { name: "Finance", icon: "💰" },
      { name: "Technology", icon: "💻" }
    ],
    skills: ["Grammar", "Conversation Practice", "English for Business", "Reading", "Accent Reduction", "Vocabulary", "Test Preparation (IELTS)"],
    industries: [
      "Business", "Finance", "Technology", "Public Services", "Engineering", 
      "Education", "Entertainment", "Government & Research", "Sustainability & Environmental Policy", 
      "Media", "Law & Compliance"
    ],
    levels: ["Beginner", "Intermediate", "Upper Intermediate", "Advanced"]
  },
  teachingStyle: {
    title: "Teaching Style",
    icon: "🖋️",
    text: "In class, I focus on guided learning, practical language foundations, and light dictation to help you understand how English works in real contexts. Our sessions are mostly conversation-based, with flexibility to focus on specific areas you want to improve."
  },
  bibliography: [
    {
      title: "Global Policy and the Digital Frontier",
      year: "2023",
      publisher: "International Relations Review",
      description: "A research piece on the intersection of cloud governance and international law."
    },
    {
      title: "The Stoic Approach to Modern Tech Burnout",
      year: "2024",
      publisher: "Mind & System Journal",
      description: "Applying ancient philosophy to the high-pressure environment of the technology sector."
    },
    {
      title: "Linguistic Patina: Why Native Nuance Matters",
      year: "2024",
      publisher: "Elo Matt Editorial",
      description: "An exploration of how cultural context shapes professional communication."
    }
  ],
  education: [
    {
      degree: "Google Cloud Architect Certification",
      school: "Google Cloud",
      focus: "Entrepreneurship • Technology • Internet. Training in cloud architecture, infrastructure design, scalability, security, and modern technologies including data systems and distributed applications."
    },
    {
      degree: "Graduate Studies in Economics",
      school: "University of Sydney",
      focus: "Finance and Banking. Advanced coursework in economic theory, development, and global markets, with an international perspective shaped by studying and living abroad."
    },
    {
      degree: "Bachelor of Arts (BA)",
      school: "Law • Government • Research",
      focus: "Focused on governance, public policy, international relations, and critical analysis, with strong emphasis on writing, research, and understanding global political systems."
    },
    {
      degree: "TESOL Certification",
      school: "Teaching English to Speakers of Other Languages",
      focus: "Specialized training in pedagogical techniques for non-native speakers."
    }
  ],
  experience: [
    {
      role: "Sustainability Planner",
      company: "ECO Action (Atlanta, GA)",
      desc: "As a sustainability planner, I bring my engineering expertise to drive environmental initiatives. My role involves analyzing, designing, and implementing sustainable solutions."
    },
    {
      role: "Software Programming",
      company: "Tech Lead / Dev",
      desc: "Versatile software programmer with a wealth of experience in front-end and back-end development, as well as DevOps. Passionate about crafting innovative digital solutions."
    },
    {
      role: "Research Associate",
      company: "Legal / Government",
      desc: "Using case law and case studies performed research to improve government policy in regards to disability under the Americans With Disabilities Act."
    },
    {
      role: "Financial Manager",
      company: "Asset Management",
      desc: "Managed portfolios involving Stocks, Forex, and Crypto (BTC & Ethereum)."
    },
    {
      role: "Digital Content Creator",
      company: "Freelance",
      desc: "Published several articles while living in Australia from a student's perspective."
    }
  ]
};

export const PRODUCTS: Product[] = [];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ricardo M.',
    location: 'Rio de Janeiro (Oil & Gas Executive)',
    locationCode: 'BR',
    date: 'Fev 2025',
    content: 'The specific technical vocabulary for the energy sector was a game changer for my meetings with Houston.',
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
  },
  {
    id: 2,
    title: 'The "Americano" Advantage',
    date: 'Mar 15, 2025',
    excerpt: 'How native speakers help you navigate corporate culture.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000',
    content: 'Understanding corporate idioms and unspoken rules is just as important as syntax.'
  }
];