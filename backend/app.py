from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app) 

MONGO_URI = "mongodb+srv://beyzacapraz:BeyzaC.2@ecommercedb.cpwha.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["ecommercedb"]

@app.route("/home", methods=["GET"])
def get_products():
    products_cursor = db.products.find()
    products = []
    for product in products_cursor:
        product["_id"] = str(product["_id"]) 
        if "category_id" in product:
            product["category_id"] = str(product["category_id"])
        products.append(product)
    return jsonify(products)

if __name__ == "__main__":
    app.run(debug=True)
