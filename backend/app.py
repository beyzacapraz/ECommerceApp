from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

MONGO_URI = "mongodb+srv://beyzacapraz:BeyzaC.2@ecommercedb.cpwha.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["ecommercedb"]  # Database name
db.products.insert_one({
  "name": "Vinyl Record",
  "price": 29.99,
  "category": "Vinyls"
})

@app.route("/products", methods=["GET"])
def get_products():
    products = list(db.products.find({}, {"_id": 0}))  # Exclude _id field
    return jsonify(products)

if __name__ == "__main__":
    app.run(debug=True)
