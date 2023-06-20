import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    isRecording: false,
    uploadMessage: '',
  };

  cameraRef = null;

  async componentDidMount() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  }

  handleRecordVideo = async () => {
    const { isRecording } = this.state;

    if (this.cameraRef && !isRecording) {
      try {
        this.setState({ isRecording: true });
        const video = await this.cameraRef.recordAsync();

        //const captureDate = new Date();
        //const year = captureDate.getFullYear();
        //const month = String(captureDate.getMonth() + 1).padStart(2, '0');
        //const day = String(captureDate.getDate()).padStart(2, '0');
        //const hour = String(captureDate.getHours()).padStart(2, '0');
        //const minute = String(captureDate.getMinutes()).padStart(2, '0');
        //const second = String(captureDate.getSeconds()).padStart(2, '0');
        const fileName = `VID.mp4`;

        const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'Camera');
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'Camera');
        }

        const newFilePath = `${FileSystem.documentDirectory}Camera/${fileName}`;
        await FileSystem.moveAsync({
          from: video.uri,
          to: newFilePath,
        });

        // Create a FormData object and append the video file
        const data = new FormData();
        data.append('video', {
          uri: newFilePath,
          type: 'video/mp4',
          name: fileName,
        });

        // Send the video file to the server
        const response = await fetch('http://172.26.11.121:5000/upload', {
          method: 'POST',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.ok) {
          this.setState({ uploadMessage: 'Video uploaded successfully' });
          setTimeout(() => {
            this.setState({ uploadMessage: '' });
          }, 1000); // Clear the message after 1 second
        } else {
          this.setState({ uploadMessage: 'Failed to upload video' });
          setTimeout(() => {
            this.setState({ uploadMessage: '' });
          }, 1000); // Clear the message after 1 second
        }
      } catch (error) {
        console.error('Error recording video:', error);
      } finally {
        this.setState({ isRecording: false });
      }
    } else {
      console.log('Another recording is already in progress.');
    }
  };

  handleStopRecording = () => {
    if (this.cameraRef && this.state.isRecording) {
      this.cameraRef.stopRecording();
      this.setState({ isRecording: false });
    }
  };

  setCameraRef = (ref) => {
    this.cameraRef = ref;
  };

  render() {
    const { hasCameraPermission, isRecording, uploadMessage } = this.state;

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={styles.container}>
          <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={this.setCameraRef} />
          <TouchableOpacity style={styles.button} onPress={this.handleRecordVideo} disabled={isRecording}>
            <Text style={styles.buttonText}>{isRecording ? 'Recording...' : 'Record video'}</Text>
          </TouchableOpacity>
          {isRecording && (
            <TouchableOpacity style={styles.button} onPress={this.handleStopRecording}>
              <Text style={styles.buttonText}>Stop recording</Text>
            </TouchableOpacity>
          )}
          {uploadMessage !== '' && <Text style={styles.uploadMessage}>{uploadMessage}</Text>}
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  camera: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 16,
    bottom:100
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadMessage: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    bottom:50,
    backgroundColor:"#fff"
  },
});