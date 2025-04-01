import pickle
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load models
with open("collaborative_model.sav", "rb") as f:
    collaborative_model = pickle.load(f)

with open("content_model.sav", "rb") as f:
    content_model = pickle.load(f)

# Load dataset (make sure it's the same format as during training)
articles = pd.read_csv("shared_articles.csv")  # Adjust path if needed
interactions = pd.read_csv("user_interactions.csv")  # Adjust path if needed

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_id = data.get("userId")
    item_id = data.get("itemId")

    if not user_id and not item_id:
        return jsonify({"error": "Provide either userId or itemId"}), 400

    recommendations = {
        "collaborative": [],
        "content": []
    }

    if user_id:
        # Generate recommendations using collaborative model
        recommendations["collaborative"] = collaborative_model.predict(user_id)

    if item_id:
        # Generate recommendations using content-based model
        recommendations["content"] = content_model.predict(item_id)

    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(port=5001)
