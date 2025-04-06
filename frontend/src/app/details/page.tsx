// app/details/page.tsx
'use client';

import { Suspense } from 'react';
import ProductDetailsContent from './details';

export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Loading product details...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}