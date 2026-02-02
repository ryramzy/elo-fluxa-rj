/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div className="group flex flex-col gap-8 cursor-pointer bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100" onClick={() => onClick(product)}>
      <div className="relative w-full aspect-video overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
            Novo
        </div>
      </div>
      
      <div className="text-left flex-1 flex flex-col">
        <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
        <p className="text-sm font-bold text-blue-500 mb-4 tracking-widest uppercase">{product.tagline}</p>
        <p className="text-slate-600 font-light leading-relaxed mb-8 flex-1">{product.description}</p>
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">A partir de</span>
           <span className="text-xl font-serif font-bold text-slate-900">R${product.price}/h</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;