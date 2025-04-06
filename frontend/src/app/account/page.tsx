"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './account.module.css';
interface Review {
  text: string;
  product_name?: string;
}

interface Account {
  _id: string;
  username: string;
  email: string;
  rating?: number;
  reviews?: Review[];
  is_admin?: boolean;
}


export default function MyAccountPage() {
  const [user, setUser] = useState<Account | null>(null);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchUser = async () => {
    const response = await fetch(`http://localhost:5000/user/${token}`);
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
                {user.rating !== undefined && (
                <p className="mb-1"><strong>Rating:</strong> {user.rating.toFixed(1)} / 10</p>
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
