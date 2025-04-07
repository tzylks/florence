# api/index.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from transformers import AutoProcessor, AutoModelForCausalLM
import torch
from PIL import Image
import io
import jwt
import datetime
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Load secret key from environment variable
SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "your-secret-key-for-dev-only")

# Florence-2 setup (lazy-loaded)
device = "cpu"
torch_dtype = torch.float32
model_name = "microsoft/Florence-2-base"
model = None
processor = None

def load_model():
    global model, processor
    if model is None or processor is None:
        model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch_dtype, trust_remote_code=True).to(device)
        processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if email == "test@example.com" and password == "password123":
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")
        response = make_response(jsonify({'message': 'Login successful'}), 200)
        response.set_cookie('token', token, httponly=True, samesite='Lax', max_age=3600)
        return response
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out'}), 200)
    response.set_cookie('token', '', expires=0)
    return response

@app.route('/predict', methods=['POST'])
def predict():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Authentication required'}), 401
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({'error': 'Invalid or expired token'}), 401

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    # Load model on first use
    load_model()

    image_file = request.files['image']
    image = Image.open(image_file).convert("RGB")
    task_prompt = "<CAPTION>"
    inputs = processor(text=task_prompt, images=image, return_tensors="pt").to(device, torch_dtype)
    input_ids = inputs["input_ids"]
    pixel_values = inputs["pixel_values"].to(torch.float32)

    generated_ids = model.generate(
        input_ids=input_ids,
        pixel_values=pixel_values,
        max_new_tokens=1024,
        num_beams=3,
        do_sample=False
    )
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
    result = processor.post_process_generation(generated_text, task=task_prompt, image_size=(image.width, image.height))
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run()