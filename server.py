from flask import Flask, request
from datetime import datetime

app = Flask(__name__)


@app.route('/upload', methods=['POST'])
def upload():
    if 'video' not in request.files:
        return 'No video uploaded', 400

    video = request.files['video']
    current_time = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    filename = f'uploaded_video_{current_time}.mp4'
    video.save(
        f'C:\\Users\\User\\OneDrive\\Desktop\\video\\server\\{filename}')

    return 'Video uploaded successfully'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
