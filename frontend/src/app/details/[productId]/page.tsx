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
  reviews?: {
    text: string;
    username: string;
    created_at?: string;
  }[];
}
export const dynamic = "force-dynamic";

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("token");
      const userRes = await fetch(`http://localhost:5000/user/${token}`);
      if (!userRes.ok) {
        throw new Error("Failed to get user information");
      }
      const userData = await userRes.json();
      const reviewPayload = {
        text: reviewText,
        user_id: token,
        product_id: productId,
        rating: rating
      };

      const response = await fetch("http://localhost:5000/add-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload)
      });
      if (response.ok) {
        const newReview = {
          text: reviewText,
          username: userData.username,
          created_at: new Date().toISOString()
        };

        setProduct((prev) => prev && {
          ...prev,
          reviews: [...(prev.reviews || []), newReview]
        });
        setReviewText("");
        setRating(5);
        alert("Review added successfully!");
        fetchProduct();
      }

  };

  const fetchProduct = async () => {
      const response = await fetch(`http://localhost:5000/products/${productId}`);
      const data = await response.json();
      setProduct(data);

  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (!product) return <div className="text-center mt-10">Loading product details...</div>;

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

            <div className="mt-6 border-t pt-4">
              <h3 className="text-black font-semibold mb-2">Add Your Review</h3>
              <textarea
                className="w-full p-2 border rounded text-black"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
              />
              <div className="my-2 text-black">
                <label className="mr-2 font-medium text-black">Rating:</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="border rounded p-1"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <span className="ml-1">/10</span>
              </div>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-[#c3e5ae] text-black  mt-2"
              >
                Submit Review
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
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-700">{review.username}</span>
                    </div>
                    <p className="text-gray-800 mt-1">{review.text}</p>
                    {review.created_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    )}
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