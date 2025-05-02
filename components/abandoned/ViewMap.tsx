import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import axios from 'axios';

function ViewMap({ route }) {
  const { mapId } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        //const response = await axios.get(`http://10.0.2.2:5000/api/maps/${mapId}/image`);
        /*if (!response.ok) {
          throw new Error('Image not found');
        }*/
        //alert(mapId);
        alert('http://10.0.2.2:5000/api/maps/1/image');
        setImageUrl(`http://10.0.2.2:5000/api/maps/1/image`);
      } catch (err) {
        //console.error('Failed to fetch image:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [mapId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : imageUrl ? (
        <View style={styles.viewer}>
          <ImageViewer
            imageUrls={[{ url: imageUrl }]}
            enableSwipeDown={false}
            backgroundColor="#fff"
          />
        </View>
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

