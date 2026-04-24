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
  category: 'Professional' | 'Coaching' | 'Essential';
  imageUrl: string;
  features: string[];
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

export type ViewState = 
  | { type: 'home' }
  | { type: 'product', product: Product };
