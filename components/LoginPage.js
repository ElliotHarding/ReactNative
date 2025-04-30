import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

function LoginPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/home.png')} style={styles.image} />

      <TouchableOpacity
        style={styles.circularButton}
        onPress={() =>
          navigation.navigate('Maps', {
            itemId: 86,
            otherParam: 'anything you want here',
          })
        }
      >
        <Text style={styles.buttonText}>Go</Text>
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
    height: '90%',
    borderRadius: 10,
    marginTop: 20,
    resizeMode: 'cover',
  },
  marketMapperText: {
    position: 'absolute',
    bottom: '40%',
    left: 20,
    color: 'black',
    fontSize: width * 0.04,
  },
  circularButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 36,
  },
});

export default LoginPage;
