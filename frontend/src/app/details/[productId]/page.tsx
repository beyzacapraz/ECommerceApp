"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './details.module.css';

interface ProductDetails {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  seller: string;
  category_name: string;
  battery_life?: string;
  age?: string;
  size?: number[];
  material?: string;
  rating?: number;
  reviews?: string[];
}

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  useEffect(() => {
    const fetchProduct = async () => {
    const response = await fetch(`http://localhost:5000/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    setProduct(data);

    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (!product) return <div className="text-center mt-10">No product found.</div>;

  return (
    <div className={styles.container}>
      <div className={`${styles.details_card} relative`}>
        <button className={styles.close_button} onClick={() => router.push('/')}>×</button>

        <div className={styles.details_grid}>
          <img src={product.image} alt={product.name} className={styles.product_image} />

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl text-green-600 font-semibold">${product.price.toFixed(2)}</p>

            <div className="bg-gray-50 p-4 rounded-md shadow-inner">
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="text-sm text-gray-800 space-y-2 bg-white border border-gray-200 p-4 rounded-md shadow-sm">
              <p><strong>Seller:</strong> {product.seller}</p>
              <p><strong>Category:</strong> {product.category_name}</p>
              {product.battery_life && <p><strong>Battery Life:</strong> {product.battery_life}</p>}
              {product.age && <p><strong>Age:</strong> {product.age}</p>}
              {product.size && product.size.length > 0 && (
                <p><strong>Available Sizes:</strong> EU {product.size.join(", ")}</p>
              )}
              {product.material && <p><strong>Material:</strong> {product.material}</p>}
              <p><strong>Rating:</strong> {product.rating?.toFixed(1) || "0.0"}/10</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all">
                Rate
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition-all">
                Review
              </button>
            </div>
          </div>
        </div>

        {product.reviews && (
          <div className={styles.review_section}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Customer Reviews</h2>
            {product.reviews.length > 0 ? (
              <ul className="space-y-4">
                {product.reviews.map((review, index) => (
                  <li key={index} className={styles.review_card}>
                    {review}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">No reviews yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
