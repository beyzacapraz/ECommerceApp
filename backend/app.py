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
            "imageUrl": product.get("image", ""),
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

if __name__ == "__main__":
    app.run(debug=True)