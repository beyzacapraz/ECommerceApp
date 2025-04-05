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

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch("http://localhost:5000/home")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      });
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`http://localhost:5000/user/${token}`)
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
        <h1 className="text-3xl font-bold">My Collections</h1>
        <div className="flex items-center gap-4">
          <UserRoleIcon />
          <Link href={isLoggedIn ? "/account" : "/login"}>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
              {isLoggedIn ? "My Account" : "Login"}
            </button>
          </Link>
          {isLoggedIn && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            key="all"
            className={`px-4 py-2 rounded-lg transition duration-300 ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => handleCategoryChange("all")}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              className={`px-4 py-2 rounded-lg transition duration-300 ${
                selectedCategory === category._id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => handleCategoryChange(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <div className="h-48 relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{product.rating ? product.rating.toFixed(1) : "New"}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {product.description || "No description available"}
              </p>
              <Link href={isLoggedIn ? `/details/${product._id}` : "/login"}>
                <button className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
                  isLoggedIn ? "details-button-logged-in" : "details-button-logged-out"
                }`}>
                  {isLoggedIn ? "View Details" : "Login to View"}
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