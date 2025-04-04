"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  name: string;
  price: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/home")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <Link href="/login">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Go to Login
        </button>
      </Link>
      <ul className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <li key={product.name} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{product.name}</h2>
            <p>${product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}