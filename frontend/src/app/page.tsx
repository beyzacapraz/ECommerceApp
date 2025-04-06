"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaUser, FaUserTie } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category_id: string;
  category_name: string;
  rating: number;
  image: string;
  description?: string;
}

interface UserInfo {
  _id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch(`${API_URL}/home`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      });

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/user/${token}`)
        .then((res) => res.json())
        .then((data) => {
          setUserInfo(data);
          setIsLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUserInfo(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((product) => product.category_id === categoryId));
    }
  };

  const UserRoleIcon = () => {
    if (!isLoggedIn || !userInfo) return null;

    return userInfo.is_admin ? (
      <div className="flex items-center text-purple-600" title="Admin Account">
        <FaUserTie className="h-5 w-5 mr-1" />
        <span className="font-medium">Admin</span>
      </div>
    ) : (
      <div className="flex items-center text-blue-600" title="User Account">
        <FaUser className="h-5 w-5 mr-1" />
        <span className="font-medium">User</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-black">My Collections</h1>

       <div className="flex items-center gap-4">
        <UserRoleIcon />
        {isLoggedIn && userInfo?.is_admin && (
          <Link href="/admin">
            <button className="bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
              Admin
            </button>
          </Link>
        )}
        <Link href={isLoggedIn ? "/account" : "/login"}>
          <button className="bg-[#50c878] text-black font-medium py-2 px-4 rounded-lg transition duration-300">
            {isLoggedIn ? "My Account" : "Login"}
          </button>
        </Link>
        {isLoggedIn && (
          <button
            className="bg-[#fb8a2e] text-black font-medium py-2 px-4 rounded-lg transition duration-300"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-black">Filter by Category</h2>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg bg-[#c3e5ae] text-black focus:outline-none focus:ring-2 focus:ring-[#50c878] transition"
        >
          <option value="all">All Products</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-[#586884] dark:bg-[#f4bbbb] rounded-none shadow-md hover:shadow-lg transition duration-300 flex flex-col">
            <div className="relative w-full h-64">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-black">No image</span>
                </div>
              )}
            </div>
            <div className="p-4 flex-grow">
              <h3 className="font-bold text-black mb-1">{product.name}</h3>
              <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-black text-lg">${product.price.toFixed(2)}</span>
                  <div className="flex items-center space-x-1">
                   <span className="text-[#ffa500] text-4xl">★</span>
                    <span className="text-black font-medium">{product.rating}</span>
                  </div>
                </div>

              <p className="text-sm text-black mb-2">{product.category_name}</p>
              <p className="text-sm text-black text-black mb-4 line-clamp-2">
                {product.description || "No description available"}
              </p>
              <Link href={isLoggedIn ? `/details?id=${product._id}` : "/login"}>
                <button className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
                  isLoggedIn
                    ? "bg-[#50c878] hover:bg-[#50c878] text-black"
                    : "bg-[#c3e5ae] text-gray-800" 
                    
                }`}>
                  {isLoggedIn ? "View Details" : "View Details"}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No products found in this category</p>
        </div>
      )}
    </div>
  );
}