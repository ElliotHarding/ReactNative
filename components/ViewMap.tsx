import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ViewMap({ route }) {
  const { mapId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map ID: {mapId}</Text>
      {/* Render your map component here, using the mapId */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default ViewMap;
