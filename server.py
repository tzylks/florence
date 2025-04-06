from flask import Flask, request, jsonify, make_response
from flask_cors import CORS  # Import CORS
from transformers import AutoProcessor, AutoModelForCausalLM
from torch import torch
from PIL import Image
import io
import traceback
import jwt
import datetime
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for all routes

# Secret key for JWT (keep this secure in production)
load_dotenv()
SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "your-secret-key-for-dev-only")

print("Starting server setup...")

# Model configuration
device = "cpu"  # Force CPU
torch_dtype = torch.float32

print(f"Device: {device}, Torch dtype: {torch_dtype}")

print("Loading model...")
model_name = "microsoft/Florence-2-base"
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch_dtype, trust_remote_code=True).to(device)

print("Loading processor...")
processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)

print("Model and processor loaded successfully!")

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Dummy auth (replace with real user database check)
    if email == "test@example.com" and password == "password123":
        # Create JWT token
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
        }, SECRET_KEY, algorithm="HS256")
        
        # Set token in HTTP-only cookie
        response = make_response(jsonify({'message': 'Login successful'}), 200)
        response.set_cookie('token', token, httponly=True, samesite='Lax', max_age=3600)
        return response
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out'}), 200)
    response.set_cookie('token', '', expires=0)  # Clear the token cookie
    return response

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image = Image.open(image_file).convert("RGB")

        task_prompt = "<DETAILED_CAPTION>"
        inputs = processor(text=task_prompt, images=image, return_tensors="pt").to(device, torch_dtype)

        input_ids = inputs["input_ids"]  # Long (torch.int64)
        pixel_values = inputs["pixel_values"].to(torch.float32)

        print("Generating caption...")
        generated_ids = model.generate(
            input_ids=input_ids,
            pixel_values=pixel_values,
            max_new_tokens=1024,
            num_beams=3,
            do_sample=False
        )

        print("Decoding generated IDs...")
        generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
        result = processor.post_process_generation(generated_text, task=task_prompt, image_size=(image.width, image.height))

        return jsonify({'result': result})
    
    except Exception as e:
        print("Error occurred:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5001, debug=True)