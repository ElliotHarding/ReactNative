import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import axios from 'axios';

function ViewMap({ route }) {
  const { mapId } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /*const fetchImage = async () => {
      try {
        const response = await axios.get(
	  `http://10.0.2.2:5000/api/maps/${mapId}/image`,
	  {
	    responseType: 'blob', // Ensure this is present
	    headers: {
	      'Cache-Control': 'no-cache',
	      'Pragma': 'no-cache',
	    },
	  }
	);

        if (response.status !== 200) {
          throw new Error(`Failed to fetch image: HTTP status ${response.status}`);
        }

        // Create a Blob URL from the image data
        const imageBlob = response.data;
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImageUrl(imageObjectURL);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch image:', err);
        setError('Failed to load image.');
      } finally {
        setLoading(false);
      }
    };*/

    fetchImage();
  }, [mapId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : imageUrl ? (
        <View style={styles.viewer}>
          <ImageViewer
            imageUrls={[{ url: 'http://10.0.2.2:5000/api/maps/${mapId}/image' }]}
            enableSwipeDown={false}
            backgroundColor="#fff"
            loadingRender={() => <ActivityIndicator size="large" />}
          />
        </View>
      ) : error ? (
        <Text style={styles.text}>{error}</Text>
      ) : (
        <Text style={styles.text}>Image not available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default ViewMap;
