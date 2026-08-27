/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Product, Testimonial } from './types.ts';

export const STUDENT_COUNT = 54;
export const WHATSAPP_NUMBER = "5522992322566";
export const WHATSAPP_MESSAGE = "Oi Matt! Vi o ELO! (eloingles.com.br) e quero começar a aprender inglês americano";
export const BRAND_NAME = "ELO!";
export const DOMAIN_NAME = "eloingles.com.br";
export const MATT_EMAIL = "mramsay0@gmail.com";
export const ZOOM_MEETING_URL = "https://meet.google.com/new";
export const CLASSROOM_HUB_URL = "/classroom";

// Public Pix Payment Information (Mercado Pago)
export const PUBLIC_PIX_KEY = "cc7fd708-6244-4e81-a2d4-5c89cbfb4bc6";
export const PUBLIC_PIX_RECEIVER = "ELO! Inglês (Mercado Pago)";
export const PUBLIC_PIX_BANK = "Mercado Pago";

// WhatsApp CTAs for different contexts
export const WHATSAPP_MESSAGES = {
  landing: "Oi Matt! Vi o ELO! e quero agendar minha aula ao vivo com você no Zoom!",
  lessonPaywall: "Oi Matt! Quero assinar o ELO! e começar minhas aulas de conversação no Zoom!",
  subscription: "Oi Matt! Quero tirar dúvidas sobre os planos de aula do ELO!",
  booking: "Oi Matt! Quero agendar minha aula particular no Zoom pelo ELO!",
  onboarding: "Oi Matt! Acabei de me cadastrar no ELO! Quero combinar meu horário de aula no Zoom",
  general: "Oi Matt! Preciso de ajuda com minha conta no ELO!",
  corporate: "Oi Matt! Quero saber mais sobre os planos corporativos do ELO! para minha empresa",
  upcomingClass: "Oi Matt! Tenho uma aula agendada no Zoom e quero confirmar detalhes com você"
};

export const getPixReceiptWhatsAppLink = (studentName?: string, plan?: string, price?: number) => {
  const planLabel = plan === 'biweekly' ? 'Plano 2x por Semana' : 'Plano 1x por Semana';
  const priceLabel = price ? `R$ ${price}` : (plan === 'biweekly' ? 'R$ 700' : 'R$ 400');
  const student = studentName ? `Sou o(a) ${studentName}` : 'Sou aluno(a) do ELO!';
  const msg = `Oi Matt! ${student}. Fiz o pagamento Pix de ${priceLabel} referente ao ${planLabel} do ELO! e estou enviando meu comprovante para atendimento.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};

export const getWhatsAppLink = (
  context: keyof typeof WHATSAPP_MESSAGES, 
  customDetails?: { studentName?: string; date?: string; time?: string }
) => {
  let baseMsg = WHATSAPP_MESSAGES[context] || WHATSAPP_MESSAGES.general;
  if (customDetails?.studentName) {
    baseMsg = `Oi Matt! Sou o(a) ${customDetails.studentName}. ` + (
      customDetails.date && customDetails.time 
        ? `Tenho aula agendada para ${customDetails.date} às ${customDetails.time} no Zoom.` 
        : baseMsg
    );
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMsg)}`;
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
      publisher: "Elo! Editorial",
      description: "An exploration of how cultural context shapes professional communication."
    }
  ]
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Gabriel Santos",
    location: "Rio de Janeiro, RJ",
    content: "O Matt é incrível. Estava travado para entrevistas em inglês na área de tecnologia e em 1 mês já me sentia super confiante para falar.",
    stars: 5
  },
  {
    name: "Mariana Costa",
    location: "São Paulo, SP",
    content: "A melhor experiência que já tive com inglês. As aulas são leves, sem aquela pressão de cursinho tradicional. Recomendo demais!",
    stars: 5
  },
  {
    name: "Lucas Oliveira",
    location: "Niterói, RJ",
    content: "O método com os decks de slides e a conversa no Zoom é muito dinâmico. Você aprende o inglês real das ruas, não o de livro antigo.",
    stars: 5
  }
];
