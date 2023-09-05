import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
from keras import layers
import numpy as np
import re
import io
import base64
from PIL import Image
from PIL import ImageOps

app = Flask(__name__)
CORS(app)

def is_valid_base64(data):
    # Regular expression for valid base64 
    base64_regex = r'^[A-Za-z0-9+/]+={0,2}$'
    return re.match(base64_regex, data)

# Loading the trained model
model = keras.models.load_model("digit_recognition_model.h5")


def update_model(image2dArr, label):
    try:
        image_data = np.array(image2dArr)  # Replace with your image data
        labels = np.array([label])  # Replace with your label
        model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

        model.fit(image_data, labels, epochs=5)
        model.save("digit_recognition_model.h5")
        model = keras.models.load_model("digit_recognition_model.h5")

        return "Successfully updated model.", ''
    except Exception as e:
        return '', str(e)
    

    

# Function to preprocess and predict the image
def predict_number(imgArr):
    try:
        
        image_array = np.array(imgArr)
        image_array = image_array / 255.0

        # Make a prediction
        predictions = model.predict(np.array([image_array]))
        predicted_number = np.argmax(predictions[0])

        return predicted_number
    except Exception as e:
        return str(e)

@app.route('/recognize_number', methods=['POST'])
def recognize_number():
    try:
        data = request.get_json()
        image_data = data.get('image_data')
        predicted_number = predict_number(image_data)
        return jsonify({'predicted_number': int(predicted_number)})
       
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)})
    

@app.route('/train_model', methods=['POST'])
def train_model():
    try:
        data = request.get_json()
        image_data = data.get('image_data')
        label = data.get('image_label')
        resp, err = update_model(image_data, label)

        if err == '':
            return jsonify({'status': int(202), 'message': str(resp) })
       
        return jsonify({'status': int(500), 'message': str(err)})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)


