import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

function UserPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();
  const [filteredMaps, setFilteredMaps] = useState([]);
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    const fetchMapIds = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/map-ids');
        setMaps(response.data);
        setFilteredMaps(response.data);
      } catch (e) {
        console.error(e.message);
      }
    };

    fetchMapIds();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredMaps(maps.filter(map => map.name.toLowerCase().includes(term)));
  }, [searchTerm, maps]);

  const handleSearchTermChange = (text) => {
    setSearchTerm(text);
  };

  function MapIdList({ mapIds }) {
    return (
      <View style={styles.mapListContainer}>
        {mapIds.map((mapId) => (
          <TouchableOpacity
            key={mapId.customMapId}
            style={styles.mapIdButton}
            onPress={() => navigation.navigate('ViewMap', { mapId: mapId.customMapId })}
          >
            <Text>{mapId.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          type="text"
          placeholder="Search Map ID..."
          value={searchTerm}
          onChangeText={handleSearchTermChange}
        />
      </View>
      <MapIdList mapIds={filteredMaps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    width: '80%',
    marginBottom: 15,
  },
  searchInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  mapListContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  mapIdButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    width: '80%',
    alignItems: 'center',
  },
  mapIdText: {
    textAlign: 'center',
    textDecorationLine: 'none',
  },
});

export default UserPage;

