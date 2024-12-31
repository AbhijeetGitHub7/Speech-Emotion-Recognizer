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
        self.encoder_layer = nn.TransformerEncoderLayer(d_model=input_dim, nhead=4, batch_first=True)
        self.transformer_encoder = nn.TransformerEncoder(self.encoder_layer, num_layers=4)
        self.fc = nn.Linear(input_dim, num_classes)

    def forward(self, x):
        x = self.transformer_encoder(x)
        x = x.mean(dim=1)  # Global average pooling
        x = self.fc(x)
        return x

# Load the trained PyTorch model
model = Conv1DModel(input_length=180, num_classes=8)  # Adjust input_dim and num_classes as per your model
checkpoint = torch.load("./cnn_telugu.pth")
model.load_state_dict(checkpoint)
model.eval()  # Set the model to evaluation mode

# Emotion label map
label_map = {0: 'anger', 1: 'disgust', 2: 'happy', 3: 'neutral', 4: 'sad',5:"unknown",6:"unknown",7:"unknown"}


# Feature extraction function
def extract_feature(data, sr, mfcc, chroma, mel):

    """
    extract features from audio files into numpy array

    Parameters
    ----------
    data : np.ndarray, audio time series
    sr : number > 0, sampling rate
    mfcc : boolean, Mel Frequency Cepstral Coefficient, represents the short-term power spectrum of a sound
    chroma : boolean, pertains to the 12 different pitch classes
    mel : boolean, Mel Spectrogram Frequency

    """

    if chroma:
        stft = np.abs(librosa.stft(data))
    result = np.array([])
    if mfcc:
        mfccs = np.mean(librosa.feature.mfcc(y=data, sr=sr, n_mfcc=40).T, axis=0)
        result = np.hstack((result, mfccs))
    if chroma:
        chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sr).T,axis=0)
        result = np.hstack((result, chroma))
    if mel:
        mel = np.mean(librosa.feature.melspectrogram(y=data, sr=sr).T,axis=0)
        result = np.hstack((result, mel))

    return result # Stack features horizontally

# Utility function to convert features to tensor
def process_features(file_path):
    data, sr = librosa.load(file_path)
    features = extract_feature(data, sr, mfcc=True, chroma=True, mel=True) # Extract audio features
    features = features.reshape(1, 1, -1)
    features = torch.tensor(features).float()  # Convert to tensor
      # Add batch dimension
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
