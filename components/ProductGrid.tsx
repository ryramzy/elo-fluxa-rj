/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { PRODUCTS } from '../constants.ts';
import { Product } from '../types.ts';
import ProductCard from './ProductCard.tsx';

interface ProductGridProps {
  onProductClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      {PRODUCTS.map(product => (
        <ProductCard key={product.id} product={product} onClick={onProductClick} />
      ))}
    </div>
  );
};

export default ProductGrid;