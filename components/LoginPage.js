import React from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the navigation hook
import { ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window'); // Get screen width

function LoginPage() {
  const navigation = useNavigation(); // Get the navigation object

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Maps', { itemId: 86, otherParam: 'anything you want here' })}
      />

      {/* Image */}
      <Image
        source={{ uri: 'https://placehold.co/400x300' }} // Replace with your image URL
        style={styles.image}
      />

      {/* "Market mapper" Text */}
      <Text style={[styles.marketMapperText, { fontSize: width * 0.04 }]}>Market mapper</Text> {/* Responsive font size */}

      {/* Circular Button */}
      <TouchableOpacity
        style={styles.circularButton}
        onPress={() => console.log('Button Pressed')} // Replace with your action
      >
        <ArrowRight color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  image: {
    width: '80%',
    height: 300,
    borderRadius: 10,
    marginTop: 20,
    resizeMode: 'cover'
  },
  marketMapperText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: 'black',
    // fontSize: 16, // Removed fixed size
  },
  circularButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
});

export default LoginPage;

