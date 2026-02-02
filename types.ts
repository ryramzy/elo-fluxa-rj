/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export type SupportedLanguage = 'pt' | 'en' | 'tr' | 'ar' | 'jp' | 'zh';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  price: number;
  /**
   * Updated category type to reflect English teaching services instead of generic hardware.
   */
  category: 'Professional' | 'Coaching' | 'Essential';
  imageUrl: string;
  gallery?: string[];
  features: string[];
}

export interface JournalArticle {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  content: React.ReactNode; 
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  locationCode: string;
  date: string;
  content: string;
  translation?: string;
  isFeatured: boolean;
  portugueseSpeaker?: boolean;
  language: 'en' | 'pt' | 'tr' | 'ar' | 'other' | 'zh' | 'jp';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'product', product: Product }
  | { type: 'journal', article: JournalArticle }
  | { type: 'checkout' };
