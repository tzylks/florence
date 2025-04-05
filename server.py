from flask import Flask, request, jsonify
from transformers import AutoProcessor, AutoModelForCausalLM
from torch import torch
from PIL import Image
import io
from accelerate import init_empty_weights, load_checkpoint_and_dispatch
import os

app = Flask(__name__)

print("Starting server setup...")

# Model configuration
model_name = "microsoft/Florence-2-base"
device = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

print(f"Device: {device}, Torch dtype: {torch_dtype}")

# Pre-download the model to get the local cache path
print("Pre-downloading model weights...")
model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)  # Download once
cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "huggingface", "hub")
checkpoint_path = os.path.join(cache_dir, f"models--microsoft--Florence-2-base", "snapshots")
checkpoint_path = next(os.path.join(checkpoint_path, d) for d in os.listdir(checkpoint_path) if os.path.isdir(os.path.join(checkpoint_path, d)))

print(f"Using checkpoint path: {checkpoint_path}")

# Now initialize with empty weights and load from local checkpoint
print("Initializing model with empty weights...")
with init_empty_weights():
    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)

print("Moving model to device with to_empty...")
model.to_empty(device=device)

print("Loading weights from checkpoint...")
model = load_checkpoint_and_dispatch(
    model,
    checkpoint=checkpoint_path,  # Use the local path
    device_map="auto",
    dtype=torch_dtype
)

print("Loading processor...")
processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)

print("Model and processor loaded successfully!")

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    image = Image.open(image_file).convert("RGB")

    task_prompt = "<CAPTION>"
    inputs = processor(text=task_prompt, images=image, return_tensors="pt").to(device, torch_dtype)

    generated_ids = model.generate(
        input_ids=inputs["input_ids"],
        pixel_values=inputs["pixel_values"],
        max_new_tokens=1024,
        num_beams=3,
        do_sample=False
    )
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
    result = processor.post_process_generation(generated_text, task=task_prompt, image_size=(image.width, image.height))

    return jsonify({'result': result})

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5001, debug=True)