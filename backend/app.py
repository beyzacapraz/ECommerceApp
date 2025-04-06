from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import datetime


app = Flask(__name__)
CORS(app)

# MONGO_URI = os.getenv('MONGO_URI')
MONGO_URI = "mongodb+srv://beyzacapraz:BeyzaC.2@ecommercedb.cpwha.mongodb.net/?retryWrites=true&w=majority&appName=ECommerceDb"
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

@app.route("/user/<token>", methods=["GET", "POST"])
def get_user(token):
    user_id = ObjectId(token)
    user = db.user.find_one({"_id": user_id})
    review_docs = []
    for review_id in user.get("reviews", []):
        review = db.reviews.find_one({"_id": ObjectId(review_id)})
        if review:
            product = db.products.find_one({"_id": review["product_id"]})
            review_docs.append({
                "text": review.get("text", ""),
                "product_name": product["name"] if product else "Unknown Product"
            })

    return jsonify({
        "_id": str(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "is_admin": user.get("is_admin", False),
        "rating": user.get("rating", 0),
        "reviews": review_docs
    })
      

@app.route("/products/<product_id>", methods=["GET"])
def get_product_details(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    category_id = product.get("category_id")
    category_name = "Uncategorized"
    if category_id:
        category = db.categories.find_one({"_id": ObjectId(category_id)})
        if category:
            category_name = category.get("name", "Uncategorized")

    product_details = {
        "_id": str(product["_id"]),
        "name": product.get("name", "Unnamed Product"),
        "price": product.get("price", 0),
        "description": product.get("description", ""),
        "image": product.get("image", ""),
        "seller": product.get("seller", "Unknown"),
        "rating": product.get("rating", 0),
        "category_name": category_name,
        "reviews": []
    }
    if category_name == "GPS Sport Watches":
        product_details["battery_life"] = product.get("battery_life", "")
    elif category_name in ["Antique Furniture", "Vinyls"]:
        product_details["age"] = product.get("age", "")
    if category_name == "Running Shoes":
        product_details["size"] = product.get("size", "")
        product_details["material"] = product.get("material", "")
    elif category_name == "Antique Furniture":
        product_details["material"] = product.get("material", "")

    if "reviews" in product:
        for review_id in product["reviews"]:
            review = db.reviews.find_one({"_id": review_id})
            if review:
                product_details["reviews"].append({
                    "text": review.get("text", ""),
                    "username": review.get("username", "Anonymous"),
                    "created_at": review.get("created_at", datetime.datetime.utcnow()).isoformat() if review.get("created_at") else None,
                    "rating": review.get("rating", 0)
                })
        
    return jsonify(product_details)

@app.route("/add-review", methods=["POST"])
def add_review():
    data = request.json
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    text = data.get("text")
    rating = data.get("rating", 5)
    user_obj_id = ObjectId(user_id)
    product_obj_id = ObjectId(product_id)

    user = db.user.find_one({"_id": user_obj_id})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    username = user.get("username", "Anonymous")
    review_doc = {
        "user_id": user_obj_id,
        "product_id": product_obj_id,
        "text": text,
        "rating": rating,
        "username": username,
        "created_at": datetime.datetime.utcnow()
    }
    
    result = db.reviews.insert_one(review_doc)
    review_id = result.inserted_id
    db.user.update_one(
        {"_id": user_obj_id},
        {"$push": {"reviews": review_id}}
    )
    db.products.update_one(
        {"_id": product_obj_id},
        {"$push": {"reviews": review_id}}
    )
    product_reviews = list(db.reviews.find({"product_id": product_obj_id}))
    if product_reviews:
        avg_rating = sum(review.get("rating", 0) for review in product_reviews) / len(product_reviews)
        db.products.update_one(
            {"_id": product_obj_id},
            {"$set": {"rating": avg_rating}}
        )

    return jsonify({
        "message": "Review added successfully", 
        "review_id": str(review_id)
    })
        


if __name__ == "__main__":
    app.run(debug=True)