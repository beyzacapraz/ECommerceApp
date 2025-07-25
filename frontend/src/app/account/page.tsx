"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './account.module.css';

interface Review {
  text: string;
  product_name?: string;
}
interface Rating {
  rating: number;
  product_name?: string;
  product_id: string;
}

interface Account {
  _id: string;
  username: string;
  email: string;
  avg_rating?: number; 
  ratings?: Rating[]; 
  reviews?: Review[];
  is_admin?: boolean;
}

export default function MyAccountPage() {
  const [user, setUser] = useState<Account | null>(null);
  const router = useRouter();
  // const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${API_URL}/user/${token}`);
      const data = await response.json();
      setUser(data);
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  if (!user) return <div className="text-center mt-10">No user found.</div>;
 return (
    <div className={styles.container}>
        <div className={`${styles.details_card} relative backdrop-blur-md`}>
        <button className={styles.close_button} onClick={() => router.push('/')}>×</button>

        <div className={styles.details_grid}>
            <div className="space-y-4 text-gray-800">

            <div className="bg-white/80 border border-gray-200 rounded-lg p-5 shadow-sm">
                <h1 className="text-2xl font-bold mb-2 text-gray-900">Welcome, {user.username}</h1>
                <p className="mb-1"><strong>Email:</strong> {user.email}</p>
                <p className="mb-1"><strong>Admin:</strong> {user.is_admin ? "Yes" : "No"}</p>
                {user.avg_rating !== undefined && (
                    <p className="mb-1"><strong>Average Rating:</strong> {user.avg_rating.toFixed(1)} / 10</p>
                  )}
                {user.ratings && user.ratings.length > 0 && (
                  <div className="bg-white/80 border border-gray-200 rounded-lg p-5 shadow-sm mt-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800 border-b pb-1">Your Ratings</h2>
                    <ul className="space-y-4 text-sm text-gray-700">
                      {user.ratings.map((rating, index) => (
                        <li key={index} className="border-b pb-2">
                          <p className="mb-1"><strong>Product:</strong> {rating.product_name || "Unknown Product"}</p>
                          <p className="mb-1"><strong>Rating:</strong> {rating.rating}/10</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-[#50c878] text-black rounded-md shadow">
                    Edit Profile
                </button>
                <button
                    onClick={() => {
                    localStorage.removeItem("token");
                    router.push('/');
                    }}
                    className="px-4 py-2 bg-[#fb8a2e] text-black rounded-md shadow"
                >
                    Logout
                </button>
                </div>
            </div>

            {user.reviews && user.reviews.length > 0 && (
                <div className="bg-white/80 border border-gray-200 rounded-lg p-5 shadow-sm mt-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800 border-b pb-1">Your Reviews</h2>
                    <ul className="space-y-4 text-sm text-gray-700">
                    {user.reviews.map((review, index) => (
                        <li key={index} className="border-b pb-2">
                        <p className="mb-1"><strong>Product:</strong> {review.product_name || "Unknown Product"}</p>
                        <p className="mb-1"><strong>Review:</strong> {review.text}</p>
                        </li>
                    ))}
                    </ul>
                </div>
                )}
            </div>
        </div>
        </div>
    </div>
    );

}
