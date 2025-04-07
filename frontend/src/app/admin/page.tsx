"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  category_id: string;
  category_name: string;
  rating: number;
  image: string;
  description?: string;
  battery_life?: string;
  age?: string;
  size?: string;
  material?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  is_admin: boolean;
  rating: number;
}

interface Category {
  _id: string;
  name: string;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category_id: "",
    image: "",
    description: "",
  });
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    email: "",
    is_admin: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, categoriesRes, usersRes] = await Promise.all([
    fetch(`${API_URL}/home`),
    fetch(`${API_URL}/categories`),
    fetch(`${API_URL}/users`)
    ]);
    const [productsData, categoriesData, usersData] = await Promise.all([
    productsRes.json(),
    categoriesRes.json(),
    usersRes.json()
    ]);

    setProducts(productsData);
    setCategories(categoriesData);
    setUsers(usersData);
    
  };

  const handleAddProduct = async () => {

      setError("");
      setSuccess("");

      const selectedCategory = categories.find(c => c._id === newProduct.category_id);
      const productToSend: any = {
        ...newProduct,
        price: Number(newProduct.price),
      };
      if (selectedCategory) {
        switch (selectedCategory.name) {
          case "GPS Sport Watches":
            productToSend.battery_life = newProduct.battery_life || "";
            break;
          case "Antique Furniture":
            productToSend.age = newProduct.age || "";
            productToSend.material = newProduct.material || "";
            break;
          case "Running Shoes":
            productToSend.size = newProduct.size || "";
            productToSend.material = newProduct.material || "";
            break;
          case "Vinyls":
            productToSend.age = newProduct.age || "";
            break;
        }
      }
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToSend),
      });
      const data = await response.json();
      setProducts([...products, data]);
      setNewProduct({
        name: "",
        price: 0,
        category_id: "",
        image: "",
        description: "",
      });
      setSuccess("Product added successfully");
    
  };

  const handleRemoveProduct = async (productId: string) => {

      setError("");
      setSuccess("");
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      setProducts(products.filter((product) => product._id !== productId));
      setSuccess("Product deleted successfully");
    
  };

  const handleAddUser = async () => {
      setError("");
      setSuccess("");

      if (!newUser.username || !newUser.email) {
        throw new Error("Username and email are required");
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }

      const data = await response.json();
      setUsers([...users, data]);
      setNewUser({
        username: "",
        email: "",
        is_admin: false,
      });
      setSuccess("User added successfully");
    
  };

const handleRemoveUser = async (userId: string) => {
  setError("");
  setSuccess("");
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    setUsers(users.filter((user) => user._id !== userId));
    setSuccess("User deleted successfully");
  } catch (err) {
    setError((err as Error).message);
  }
};


  const renderCategorySpecificFields = () => {
    const selectedCategory = categories.find(c => c._id === newProduct.category_id);
    
    if (!selectedCategory) return null;

    switch (selectedCategory.name) {
      case "GPS Sport Watches":
        return (
          <input
            type="text"
            placeholder="Battery Life"
            className="w-full p-2 border rounded text-black"
            value={newProduct.battery_life || ""}
            onChange={(e) => setNewProduct({...newProduct, battery_life: e.target.value})}
          />
        );
      case "Antique Furniture":
        return (
          <>
            <input
              type="text"
              placeholder="Age"
              className="w-full p-2 border rounded text-black"
              value={newProduct.age || ""}
              onChange={(e) => setNewProduct({...newProduct, age: e.target.value})}
            />
            <input
              type="text"
              placeholder="Material"
              className="w-full p-2 border rounded text-black"
              value={newProduct.material || ""}
              onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
            />
          </>
        );
      case "Running Shoes":
        return (
          <>
            <input
              type="text"
              placeholder="Size"
              className="w-full p-2 border rounded text-black"
              value={newProduct.size || ""}
              onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
            />
            <input
              type="text"
              placeholder="Material"
              className="w-full p-2 border rounded text-black"
              value={newProduct.material || ""}
              onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
            />
          </>
        );
      case "Vinyls":
        return (
          <input
            type="text"
            placeholder="Age"
            className="w-full p-2 border rounded text-black"
            value={newProduct.age || ""}
            onChange={(e) => setNewProduct({...newProduct, age: e.target.value})}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-black font-bold mb-8">Admin Panel</h1>
    {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#f4bbbb] p-6 rounded-lg shadow-md">
          <h2 className="text-2xl text-black font-semibold mb-4">Manage Products</h2>

          <div className="mb-6">
            <h3 className="text-lg text-black font-medium mb-2">Add New Product</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Product Name*"
                className="w-full p-2 border rounded text-black"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Price*"
                className="w-full p-2 border rounded text-black"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                required
                min="0"
                step="0.01"
              />
              <select
                className="w-full p-2 border rounded text-black"
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                required
              >
                <option value="">Select Category*</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            {newProduct.category_id && renderCategorySpecificFields()}
              
              <input
                type="text"
                placeholder="Image URL"
                className="w-full p-2 border rounded text-black"
                value={newProduct.image || ""}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded text-black"
                value={newProduct.description || ""}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
              <button
                className="bg-[#50c878] text-black py-2 px-4 rounded hover:bg-green-600 transition"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg text-black font-medium mb-2">Existing Products</h3>
            {products.length === 0 ? (
              <p className="text-gray-500">No products found</p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product._id} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-black">{product.name}</span>
                    <button
                      className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600 transition"
                      onClick={() => handleRemoveProduct(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#f4bbbb] p-6 rounded-lg shadow-md">
          <h2 className="text-2xl text-black font-semibold mb-4">Manage Users</h2>
          <div className="mb-6">
            <h3 className="text-lg text-black font-medium mb-2">Add New User</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Username*"
                className="w-full p-2 border rounded text-black"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email*"
                className="w-full p-2 border rounded text-black"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newUser.is_admin || false}
                  onChange={(e) => setNewUser({...newUser, is_admin: e.target.checked})}
                />
                <span className="text-black">Admin User</span>
              </label>
              <button
                className="bg-[#50c878] text-white py-2 px-4 rounded hover:bg-green-600 transition"
                onClick={handleAddUser}
              >
                Add User
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg text-black font-medium mb-2">Existing Users</h3>
            {users.length === 0 ? (
              <p className="text-gray-500">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user._id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium text-black">{user.username}</span>
                      {user.is_admin && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600 transition"
                      onClick={() => handleRemoveUser(user._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/">
          <button className="bg-[#fb8a2e] text-white py-2 px-4 rounded hover:bg-orange-600 transition">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}