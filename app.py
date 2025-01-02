import os
import torch
import numpy as np
import librosa
from flask import Flask, request, jsonify
from torch import nn
from flask_cors import CORS
import torch.nn.functional as F
app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app)
class Conv1DModel(nn.Module):
    def __init__(self, input_length, num_classes):
        super(Conv1DModel, self).__init__()
        self.conv1 = nn.Conv1d(in_channels=1, out_channels=256, kernel_size=5, padding=2)
        self.conv2 = nn.Conv1d(in_channels=256, out_channels=128, kernel_size=5, padding=2)
        self.conv3 = nn.Conv1d(in_channels=128, out_channels=128, kernel_size=5, padding=2)
        self.conv4 = nn.Conv1d(in_channels=128, out_channels=128, kernel_size=5, padding=2)
        self.pool = nn.MaxPool1d(kernel_size=8)
        self.dropout1 = nn.Dropout(0.1)
        self.dropout2 = nn.Dropout(0.5)
        self.flatten = nn.Flatten()

        # Compute flattened size after pooling
        pooled_size = input_length // 8  # Adjust based on your pooling layers
        self.fc = nn.Linear(128 * pooled_size, num_classes)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = self.dropout1(x)
        x = self.pool(x)
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        x = self.dropout2(x)
        x = self.flatten(x)
        x = self.fc(x)
        return x
# Define the Transformer model (same as your model)
class TransformerModel(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(TransformerModel, self).__init__()
        self.embedding = nn.Linear(input_dim, 256)
        self.transformer_layer = nn.TransformerEncoderLayer(d_model=256, nhead=4)
        self.transformer = nn.TransformerEncoder(self.transformer_layer, num_layers=2)
        self.classifier = nn.Linear(256, num_classes)

    def forward(self, inputs):
        embedded = self.embedding(inputs)
        transformer_out = self.transformer(embedded.permute(1, 0, 2))  # Sequence-first
        logits = self.classifier(transformer_out[0])  # Use the first token's output
        return logits

# Load the trained PyTorch model
model = TransformerModel(input_dim=180, num_classes=6)  # Adjust input_dim and num_classes as per your model
checkpoint = torch.load("./transformer_model.pth")
model.load_state_dict(checkpoint)
model.eval()  # Set the model to evaluation mode

# Emotion label map
label_map = {0: 'angry', 1: 'disgust', 2: 'happy', 3: 'neutral', 4: 'sad',5:"fear",6:"unknown",7:"unknown"}


# Feature extraction function
def extract_feature(data, sr, mfcc=True, chroma=True, mel=True):
    """
    Extract features from audio files into numpy array.

    Parameters
    ----------
    data : np.ndarray, audio time series
    sr : number > 0, sampling rate
    mfcc : boolean, Mel Frequency Cepstral Coefficient, represents the short-term power spectrum of a sound
    chroma : boolean, pertains to the 12 different pitch classes
    mel : boolean, Mel Spectrogram Frequency

    """
    result = np.array([])
    if chroma:
        stft = np.abs(librosa.stft(data))
    if mfcc:
        mfccs = np.mean(librosa.feature.mfcc(y=data, sr=sr, n_mfcc=40).T, axis=0)
        result = np.hstack((result, mfccs))
    if chroma:
        chroma_features = np.mean(librosa.feature.chroma_stft(S=stft, sr=sr).T, axis=0)
        result = np.hstack((result, chroma_features))
    if mel:
        mel_features = np.mean(librosa.feature.melspectrogram(y=data, sr=sr).T, axis=0)
        result = np.hstack((result, mel_features))

    return result # Stack features horizontally

# Utility function to convert features to tensor
def process_features(file_path):
    data, sr = librosa.load(file_path)
    features = extract_feature(data, sr, mfcc=True, chroma=True, mel=True) # Extract audio features
    features = features.reshape(1, 1, -1)
    features = torch.tensor(features).float()  # Convert to tensor
    return features

@app.route("/predict", methods=["POST"])
def predict_emotion():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)  # Create the uploads folder if it doesn't exist
    
    # Save the file temporarily
    audio_file_path = os.path.join("uploads", file.filename)
    file.save(audio_file_path)
    
    # Extract features from the uploaded audio file
    features = process_features(audio_file_path)
    
    # Predict emotion probabilities using the model
    with torch.no_grad():  # Disable gradient computation (for inference)
        prediction = model(features)  # Get the prediction from the model
    
    # Convert prediction to probabilities (softmax)
    probabilities = torch.nn.functional.softmax(prediction, dim=-1)
    
    # Map probabilities to emotions
    emotion_probabilities = {label_map[i]: round(float(prob),2) for i, prob in enumerate(probabilities[0]) if label_map[i]!="unknown"}
    print(emotion_probabilities)
    # Remove the uploaded file after processing
    os.remove(audio_file_path)
    
    return jsonify(emotion_probabilities)

if __name__ == "__main__":
    app.run(debug=True)
