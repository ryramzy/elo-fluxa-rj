/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Product, JournalArticle } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'c1',
    name: 'Business English',
    tagline: 'Professional mastery.',
    description: 'Foco total em reuniões, e-mails e negociações internacionais de alto nível.',
    longDescription: 'Para executivos e profissionais que precisam de fluência imediata no ambiente corporativo. Trabalhamos vocabulário específico, nuances de negociação em inglês e como estruturar apresentações persuasivas. As sessões são personalizadas para o seu setor de atuação.',
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
    longDescription: 'O Coaching de Fluência é para quem já tem base mas sente "trava" ao falar. Matthew utiliza técnicas de coaching para identificar bloqueios psicológicos e exercícios de fonética para naturalizar sua pronúncia.',
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
    longDescription: 'Curso focado no vocabulário prático do Rio de Janeiro. Ideal para quem trabalha no turismo, hospitalidade ou quer apenas ajudar os estrangeiros que visitam nossa cidade maravilhosa.',
    price: 120,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000',
    features: ['Inglês para Turismo', 'Cultura Brasileira em Inglês', 'Prática em Situações Reais']
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