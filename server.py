from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from transformers import AutoProcessor, AutoModelForCausalLM
from torch import torch
from PIL import Image
import io
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image = Image.open(image_file).convert("RGB")

        task_prompt = "<CAPTION>"
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