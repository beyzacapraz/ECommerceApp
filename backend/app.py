from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

app = Flask(__name__)
CORS(app)

MONGO_URI = "mongodb+srv://beyzacapraz:BeyzaC.2@ecommercedb.cpwha.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["ecommercedb"]

@app.route("/home", methods=["GET"])
def get_products():
    categories = {}
    categories_cursor = db.categories.find()
    for category in categories_cursor:
        categories[str(category["_id"])] = category["name"]
    
    products_cursor = db.products.find()
    products = []
    
    for product in products_cursor:
        product_id = str(product["_id"])
        category_id = None
        category_name = "Uncategorized"
        
        if "category_id" in product:
            category_id = str(product["category_id"])
            if category_id in categories:
                category_name = categories[category_id]
        
        product_dict = {
            "_id": product_id,
            "name": product.get("name", "Unnamed Product"),
            "price": product.get("price", 0),
            "description": product.get("description", ""),
            "image": product.get("image", ""),
            "seller": product.get("seller", "Unknown"),
            "rating": product.get("rating", 0),
            "category_id": category_id,
            "category_name": category_name
        }
        
        if category_name == "GPS Sport Watches":
            product_dict["battery_fife"] = product.get("battery_life", "")
        elif category_name in ["Antique Furniture", "Vinyls"]:
            product_dict["age"] = product.get("age", "")
        elif category_name == "Running Shoes":
            product_dict["size"] = product.get("size", "")
            product_dict["material"] = product.get("material", "")
        elif category_name == "Antique Furniture":
            product_dict["material"] = product.get("material", "")
            
        products.append(product_dict)
        
    return jsonify(products)

@app.route("/categories", methods=["GET"])
def get_categories():
    categories_cursor = db.categories.find()
    categories = []
    
    for category in categories_cursor:
        categories.append({
            "_id": str(category["_id"]),
            "name": category.get("name", "")
        })
        
    return jsonify(categories)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    username = data.get("username", "")
    is_admin = data.get("is_admin", False)

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = db.user.find_one({"email": email})

    if user:
        if user["password"] != password:
            return jsonify({"error": "Incorrect password"}), 401
        return jsonify({"message": "Login successful", "token": str(user["_id"])})
    else:
        new_user = {
            "username": username,
            "email": email,
            "password": password,
            "rating": 0,
            "reviews": [],
            "is_admin": is_admin
        }
        result = db.user.insert_one(new_user)
        return jsonify({"message": "User created and logged in", "token": str(result.inserted_id)})

@app.route("/user/<token>", methods=["GET"])
def get_user(token):
      user_id = ObjectId(token)
      user = db.user.find_one({"_id": user_id})
      
      if user:
          return jsonify({
              "_id": str(user["_id"]),
              "username": user.get("username", ""),
              "email": user.get("email", ""),
              "is_admin": user.get("is_admin", False),
              "rating": user.get("rating", 0),
              "reviews": user.get("reviews", [])
          })
      else:
          return jsonify({"error": "User not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)