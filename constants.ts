/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Product, Testimonial, JournalArticle } from './types';

export const STUDENT_COUNT = 54;
export const WHATSAPP_NUMBER = "5522992322566";
export const WHATSAPP_MESSAGE = "Olá Matthew! Vi seu site e gostaria de saber mais sobre as aulas de inglês.";
export const BRAND_NAME = "Elo Matt!";

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
  }
];

// Added missing JOURNAL_ARTICLES export to resolve module not found error in Journal.tsx
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
    title: 'Common "Carioca" Pitfalls',
    date: 'Mar 05, 2025',
    excerpt: 'How to avoid the most common mistakes Portuguese speakers make.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000',
    content: 'Many students in Rio struggle with the "th" sound or the difference between "make" and "do". These small adjustments can significantly increase your perceived fluency and confidence in international meetings.'
  }
];
