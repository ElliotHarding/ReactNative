import React from 'react';
import { View, Text, Button } from 'react-native';

function LoginPage({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', { itemId: 86, otherParam: 'anything you want here' })}
      />
    </View>
  );
}

export default LoginPage;
