/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Product, JournalArticle, Testimonial } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'c1',
    name: 'Business English',
    tagline: 'Professional mastery.',
    description: 'Foco total em reuniões, e-mails e negociações internacionais de alto nível.',
    longDescription: 'Para executivos e profissionais que precisam de fluência imediata no ambiente corporativo. Trabalhamos vocabulário específico, nuances de negociação em inglês e como estruturar apresentações persuasivas.',
    price: 180,
    category: 'Mobile', 
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000',
    features: ['Vocabulário Setorial', 'Simulações de Negociação', 'Revisão de E-mails/Relatórios']
  },
  {
    id: 'c2',
    name: 'Coaching de Fluência',
    tagline: 'Native confidence.',
    description: 'Sessões dinâmicas para destravar sua fala e reduzir o sotaque através da prática real.',
    longDescription: 'Matthew utiliza técnicas de coaching para identificar bloqueios psicológicos e exercícios de fonética para naturalizar sua pronúncia.',
    price: 150,
    category: 'Wearable',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000',
    features: ['Redução de Sotaque', 'Técnicas de Oratória', 'Escuta Ativa']
  },
  {
    id: 'c3',
    name: 'Carioca Survival English',
    tagline: 'English for Rio.',
    description: 'Aprenda o inglês necessário para receber turistas e trabalhar nos grandes eventos do Rio.',
    longDescription: 'Curso focado no vocabulário prático do Rio de Janeiro. Ideal para quem trabalha no turismo, hospitalidade ou quer apenas ajudar os estrangeiros.',
    price: 120,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000',
    features: ['Inglês para Turismo', 'Cultura Brasileira em Inglês', 'Prática em Situações Reais']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'abdrhman',
    location: 'Mainland China',
    locationCode: 'CN',
    date: 'January 2026',
    content: 'I have now completed five months with him, and I never expected that I would begin to feel such improvement this quickly. The way he engages in dialogue, listens attentively, and provides feedback after each session is truly helpful.',
    isFeatured: true,
    language: 'en'
  },
  {
    id: 't2',
    name: 'Utku',
    location: 'Turkey',
    locationCode: 'TR',
    date: 'April 2024',
    content: 'Çok arkadaş canlısı. Derslerde hata yaptığınız zaman nazik bir şekilde yardımcı oluyor. Dersleri çok eğlenceli geçiyor. Çok değerli biri',
    translation: 'Very friendly. He helps in a kind way when you make mistakes in lessons. His lessons are very fun. A very valuable person.',
    isFeatured: true,
    language: 'tr'
  },
  {
    id: 't3',
    name: 'Gilverton',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'January 2024',
    content: "Mr. Matt is incredibly attentive, patient, and good-humored. I enjoy his classes because they're relaxed, and there's always something new to learn. I highly recommend his classes to anyone seeking mastery.",
    isFeatured: true,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't4',
    name: 'Cris Agnes',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'January 2024',
    content: 'Matt é um excelente professor, muito paciente e experiente em ensinar iniciantes, como eu. Suas aulas são bem didáticas e o fato dele falar português me deixa mais tranquila para esclarecer as dúvidas...',
    translation: 'Matt is an excellent teacher, very patient and experienced in teaching beginners like me. His classes are very didactic and the fact that he speaks Portuguese makes me feel more relaxed...',
    isFeatured: true,
    language: 'pt',
    portugueseSpeaker: true
  },
  {
    id: 't5',
    name: 'Yamato',
    location: 'Japan',
    locationCode: 'JP',
    date: 'October 2025',
    content: 'He is a great tutor.',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't6',
    name: 'Euler',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'February 2025',
    content: 'Precisarei remarcar a aula pois na sexta feira vou ter que fazer hora extra depois do expediente',
    translation: 'I will need to reschedule the class because on Friday I will have to work overtime after hours.',
    isFeatured: false,
    language: 'pt',
    portugueseSpeaker: true
  },
  {
    id: 't7',
    name: 'Diego',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'July 2024',
    content: 'Matt its a excellent teacher and make us very confortable to make mistakes, whats a good thing when we are learning a new language. i recommend him.',
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't8',
    name: 'Ju-Ping',
    location: 'Taiwan',
    locationCode: 'TW',
    date: 'April 2024',
    content: 'Good to have lesson with Matt and he taught me a lot of new words',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't9',
    name: 'Stevens Castro',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'January 2024',
    content: 'Matt Ramsay is a great tutor. I learn a lot in your class. He explains using a good didactic. He is a very experienced tutor and helps me when he shares language expressions...',
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't10',
    name: 'Helder',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'December 2023',
    content: "Mr. Matt Ramsay is a great Teacher! He is very kind and polite. I enjoyed his class and I'm sure you are going to like it too.",
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't11',
    name: 'José Amadeu Silva',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'November 2023',
    content: 'Matt is a great teacher, I have learned a lot of things from him, he makes the class fun and corrects me whenever necessary and my English has improved a lot with him.',
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't12',
    name: 'Tamyris',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'October 2023',
    content: 'Gosto muito das aulas com o professor Matt, ele é muito paciente e explica bem gramática.',
    translation: 'I really like the classes with Professor Matt, he is very patient and explains grammar well.',
    isFeatured: false,
    language: 'pt',
    portugueseSpeaker: true
  },
  {
    id: 't13',
    name: 'Kübra',
    location: 'Turkey',
    locationCode: 'TR',
    date: 'September 2023',
    content: 'Hangi konularda eksik olduğumu biliyor ve güzel yönlendirmeler yapıyor. Dersi eğlenceli geçiyor ve özgüven kazanmamda büyük payı var.',
    translation: 'He knows which subjects I am missing and gives good guidance. His lessons are fun and he has a big share in gaining my self-confidence.',
    isFeatured: false,
    language: 'tr'
  },
  {
    id: 't14',
    name: 'Ziyad',
    location: 'Saudi Arabia',
    locationCode: 'SA',
    date: 'August 2023',
    content: 'لديه مهارة كبيرة في فهم المبتدئين ولديه خبرة عاليه في ايصال المعلومة وكشف نقاط ضعفك',
    translation: 'He has great skill in understanding beginners and has high experience in conveying information and uncovering your weaknesses.',
    isFeatured: false,
    language: 'ar'
  },
  {
    id: 't15',
    name: 'Hugn',
    location: 'Mainland China',
    locationCode: 'CN',
    date: 'August 2023',
    content: 'NICE GUY!',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't16',
    name: 'Yutaro',
    location: 'Belgium',
    locationCode: 'BE',
    date: 'August 2023',
    content: 'He considers my best way of making progress and motivates me.',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't17',
    name: 'belce',
    location: 'Turkey',
    locationCode: 'TR',
    date: 'April 2023',
    content: 'He is very kind, friendly and encouraging as a tutor. I feel very confident talking to him. I recommend him to other people who wants to improve their conversational skills.',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't18',
    name: 'Vini Simionato',
    location: 'United States of America',
    locationCode: 'US',
    date: 'April 2023',
    content: 'Great person to talk with! Bring topics related to politics, current affairs, cultural differences of countries and technology trends and tools!',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't19',
    name: 'Amira',
    location: 'Saudi Arabia',
    locationCode: 'SA',
    date: 'April 2023',
    content: 'هو معلم رائع متمكن من توصيل المعلومه بكل وضوح',
    translation: 'He is a great teacher who is able to convey information clearly.',
    isFeatured: false,
    language: 'ar'
  },
  {
    id: 't20',
    name: 'João Felipe',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'March 2023',
    content: 'he is so cool',
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't21',
    name: 'Paulo',
    location: 'Canada',
    locationCode: 'CA',
    date: 'March 2023',
    content: 'Matt is very patient, calm and always keeps the comfortable class. Thank you so much!',
    isFeatured: false,
    language: 'en'
  },
  {
    id: 't22',
    name: 'Daniel Oliveira',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'March 2023',
    content: 'Matt is a very wise guy. We talked about many interesting topics.',
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  },
  {
    id: 't23',
    name: 'Juci',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'March 2023',
    content: 'Matt tem sido muito paciente durante as aulas e me ajuda bastante. Ótimo professor. Como fala Português também, eu indico para alunos brasileiros iniciantes.',
    translation: 'Matt has been very patient during classes and helps me a lot. Great teacher. Since he speaks Portuguese too, I recommend him for Brazilian beginners.',
    isFeatured: false,
    language: 'pt',
    portugueseSpeaker: true
  },
  {
    id: 't24',
    name: 'Alice Abdon',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'March 2023',
    content: 'Gostei muito da aula. Ele me ensinou gramaticalmente alguns erros que cometi, tentava compreender o que eu estava tentando explicar e se fazia compreender.',
    translation: 'I liked the class very much. He taught me grammatically some mistakes I made, tried to understand what I was trying to explain and made himself understood.',
    isFeatured: false,
    language: 'pt',
    portugueseSpeaker: true
  },
  {
    id: 't25',
    name: 'Adriano M Péres',
    location: 'Brazil',
    locationCode: 'BR',
    date: 'February 2023',
    content: 'Mr. Matt Ramsay is a great tutor. As soon as he realizes which English level you are at, he encourages you to go a little bit further by talking about different subjects...',
    isFeatured: false,
    language: 'en',
    portugueseSpeaker: true
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
    {
        id: 1,
        title: "Por que brasileiros travam no inglês?",
        date: "20 de Maio, 2025",
        excerpt: "Uma análise cultural sobre o perfeccionismo e o medo de errar.",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000",
        content: React.createElement(React.Fragment, null,
            React.createElement("p", { className: "mb-6 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left text-[#5D5A53]" },
                "Depois de anos morando no Rio, percebi um padrão: o brasileiro conhece a gramática, mas tem pavor do erro. Esse perfeccionismo é o maior inimigo da fluência."
            ),
            React.createElement("p", { className: "mb-8 text-[#5D5A53]" },
                "Como americano, posso dizer: nós não nos importamos se você errar uma preposição. O que importa é a conexão e a clareza da mensagem."
            ),
            React.createElement("blockquote", { className: "border-l-2 border-[#1A1A1A] pl-6 italic text-xl text-[#1A1A1A] my-10 font-serif" },
                "\"Communication is about connection, not perfection.\""
            )
        )
    }
];

export const BRAND_NAME = 'Elo Matt!';
export const PRIMARY_COLOR = 'slate-900'; 
export const ACCENT_COLOR = 'blue-600';
export const WHATSAPP_NUMBER = '+5522992322566';
export const WHATSAPP_MESSAGE = 'Olá Matthew! Quero agendar minha aula de inglês e saber mais sobre o método Elo Matt!.';