from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import datetime


app = Flask(__name__)
CORS(app)
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
            "avg_rating": 0, 
            "reviews": [],
            "ratings": [],  
            "is_admin": is_admin
        }
        result = db.user.insert_one(new_user)
        return jsonify({"message": "User created and logged in", "token": str(result.inserted_id)})

@app.route("/user/<token>", methods=["GET"])
def get_user(token):
    user_id = ObjectId(token)
    user = db.user.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    review_docs = []
    for review_id in user.get("reviews", []):
        review = db.reviews.find_one({"_id": ObjectId(review_id)})
        if review:
            product = db.products.find_one({"_id": review["product_id"]})
            review_docs.append({
                "text": review.get("text", ""),
                "product_name": product["name"] if product else "Unknown Product",
                "product_id": str(review["product_id"])
            })

    rating_docs = []
    for rating_id in user.get("ratings", []):
        rating = db.ratings.find_one({"_id": ObjectId(rating_id)})
        if rating:
            product = db.products.find_one({"_id": rating["product_id"]})
            rating_docs.append({
                "rating": rating.get("rating", 0),
                "product_name": product["name"] if product else "Unknown Product",
                "product_id": str(rating["product_id"])
            })

    return jsonify({
        "_id": str(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "is_admin": user.get("is_admin", False),
        "avg_rating": user.get("avg_rating", 0), 
        "reviews": review_docs,
        "ratings": rating_docs 
    })
      

@app.route("/products/<product_id>", methods=["GET"])
def get_product_details(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
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
        "reviews": [],
        "ratings_count": 0
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
                    "created_at": review.get("created_at", datetime.datetime.utcnow()).isoformat() if review.get("created_at") else None
                })
    if "ratings" in product:
        product_details["ratings_count"] = len(product.get("ratings", []))
        
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
        

@app.route("/users", methods=["GET"])
def get_users():
    users_cursor = db.user.find()
    users = []
    for user in users_cursor:
        users.append({
            "_id": str(user["_id"]),
            "username": user.get("username", ""),
            "email": user.get("email", ""),
            "is_admin": user.get("is_admin", False),
            "avg_rating": user.get("avg_rating", 0)  # Use avg_rating in the response
        })
    return jsonify(users)

@app.route("/products", methods=["POST"])
def add_product():
    data = request.json
    product = {
        "name": data.get("name"),
        "price": data.get("price", 0),
        "category_id": ObjectId(data.get("category_id")) if data.get("category_id") else None,
        "image": data.get("image", ""),
        "description": data.get("description", ""),
        "rating": 0,
        "reviews": []
    }
    result = db.products.insert_one(product)
    product["_id"] = str(result.inserted_id)
    return jsonify(product)

@app.route("/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    product_obj_id = ObjectId(product_id)
    reviews = list(db.reviews.find({"product_id": product_obj_id}))
    for review in reviews:
        db.user.update_many(
            {"reviews": review["_id"]},
            {"$pull": {"reviews": review["_id"]}}
        )
    db.reviews.delete_many({"product_id": product_obj_id})
    
    ratings = list(db.ratings.find({"product_id": product_obj_id}))
    affected_users = set()
    
    for rating in ratings:
        affected_users.add(rating["user_id"])
        db.user.update_many(
            {"ratings": rating["_id"]},
            {"$pull": {"ratings": rating["_id"]}}
        )
    
    db.ratings.delete_many({"product_id": product_obj_id})
    for user_id in affected_users:
        remaining_ratings = list(db.ratings.find({"user_id": user_id}))
        if remaining_ratings:
            avg_rating = sum(r.get("rating", 0) for r in remaining_ratings) / len(remaining_ratings)
            db.user.update_one(
                {"_id": user_id},
                {"$set": {"rating": avg_rating}}
            )
        else:
            db.user.update_one(
                {"_id": user_id},
                {"$set": {"rating": 0}}
            )

    db.products.delete_one({"_id": product_obj_id})
    
    return jsonify({"message": "Product deleted successfully"})

@app.route("/users", methods=["GET", "POST"])
def users_operations():
    if request.method == "GET":
        users_cursor = db.user.find()
        users = [{
            "_id": str(user["_id"]),
            "username": user.get("username", ""),
            "email": user.get("email", ""),
            "is_admin": user.get("is_admin", False),
            "avg_rating": user.get("avg_rating", 0)
        } for user in users_cursor]
        return jsonify(users)
    
    elif request.method == "POST":
        data = request.json
        if not data.get("username") or not data.get("email") or not data.get("password"):
            return jsonify({"error": "Username, email, and password are required"}), 400
        existing_user = db.user.find_one({"email": data.get("email")})
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409
            
        user = {
            "username": data.get("username"),
            "email": data.get("email"),
            "password": data.get("password"),
            "is_admin": data.get("is_admin", False),
            "avg_rating": 0,
            "reviews": [],
            "ratings": []  
        }
        result = db.user.insert_one(user)
        user["_id"] = str(result.inserted_id)
        return jsonify(user)

@app.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user_obj_id = ObjectId(user_id)
    
    reviews = list(db.reviews.find({"user_id": user_obj_id}))
    for review in reviews:
        db.products.update_many(
            {"reviews": review["_id"]},
            {"$pull": {"reviews": review["_id"]}}
        )
    db.reviews.delete_many({"user_id": user_obj_id})
    ratings = list(db.ratings.find({"user_id": user_obj_id}))
    affected_products = set()
    
    for rating in ratings:
        affected_products.add(rating["product_id"])
        db.products.update_many(
            {"ratings": rating["_id"]},
            {"$pull": {"ratings": rating["_id"]}}
        )
    
    db.ratings.delete_many({"user_id": user_obj_id})
    for product_id in affected_products:
        remaining_ratings = list(db.ratings.find({"product_id": product_id}))
        if remaining_ratings:
            avg_rating = sum(r.get("rating", 0) for r in remaining_ratings) / len(remaining_ratings)
            db.products.update_one(
                {"_id": product_id},
                {"$set": {"rating": avg_rating}}
            )
        else:
            db.products.update_one(
                {"_id": product_id},
                {"$set": {"rating": 0}}
            )

    db.user.delete_one({"_id": user_obj_id})
    
    return jsonify({"message": "User deleted successfully"})

@app.route("/add-rating", methods=["POST"])
def add_rating():
    data = request.json
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    rating_value = data.get("rating", 5)
    
    user_obj_id = ObjectId(user_id)
    product_obj_id = ObjectId(product_id)
    user = db.user.find_one({"_id": user_obj_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    existing_rating = db.ratings.find_one({
        "user_id": user_obj_id,
        "product_id": product_obj_id
    })
    
    if existing_rating:
        db.ratings.update_one(
            {"_id": existing_rating["_id"]},
            {"$set": {"rating": rating_value, "updated_at": datetime.datetime.utcnow()}}
        )
        rating_id = existing_rating["_id"]
    else:
        rating_doc = {
            "user_id": user_obj_id,
            "product_id": product_obj_id,
            "rating": rating_value,
            "created_at": datetime.datetime.utcnow()
        }
        
        result = db.ratings.insert_one(rating_doc)
        rating_id = result.inserted_id
        db.user.update_one(
            {"_id": user_obj_id},
            {"$addToSet": {"ratings": rating_id}}
        )
        db.products.update_one(
            {"_id": product_obj_id},
            {"$addToSet": {"ratings": rating_id}}
        )
    
    user_ratings = list(db.ratings.find({"user_id": user_obj_id}))
    if user_ratings:
        user_avg_rating = sum(r.get("rating", 0) for r in user_ratings) / len(user_ratings)
        db.user.update_one(
            {"_id": user_obj_id},
            {"$set": {"avg_rating": user_avg_rating}}  # Use avg_rating instead of rating
        )
    
    product_ratings = list(db.ratings.find({"product_id": product_obj_id}))
    if product_ratings:
        product_avg_rating = sum(r.get("rating", 0) for r in product_ratings) / len(product_ratings)
        db.products.update_one(
            {"_id": product_obj_id},
            {"$set": {"rating": product_avg_rating}}
        )
    else:
        db.products.update_one(
            {"_id": product_obj_id},
            {"$set": {"rating": 0}}
        )

    return jsonify({
        "message": "Rating added successfully", 
        "rating_id": str(rating_id)
    })
if __name__ == "__main__":
    app.run(debug=True)