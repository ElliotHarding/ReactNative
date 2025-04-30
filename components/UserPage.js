import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

function UserPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMapIds, setFilteredMapIds] = useState([]);
    const [mapIds, setMapIds] = useState([]);
    const navigation = useNavigation(); // Get the navigation object

    useEffect(() => {
        const fetchMapIds = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:5000/api/map-ids');
                const data = response.data;
                setMapIds(data);
                setFilteredMapIds(data);
            } catch (e) {
                //console.error('Error fetching map IDs:', e);
                console.error(e.message);
            } finally {
                console.log('Finished fetching map IDs.'); // Corrected: Removed erroneous console.error
            }
        };

        fetchMapIds();
    }, []);

    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = mapIds.filter(id => String(id).includes(lowercasedTerm));
        setFilteredMapIds(filtered);
        console.log('Search term: ', searchTerm, 'Filtered map IDs:', filtered);
    }, [searchTerm, mapIds]);

    const handleSearchTermChange = (text) => {
        setSearchTerm(text);
    };

    function MapIdList({ mapIds }) {
        return (
            <View style={styles.mapListContainer}>
                {mapIds.map((mapId, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.mapIdButton}
                        onPress={() => navigation.navigate('ViewMap', { mapId })} // Navigate on press
                    >
                        <Text style={styles.mapIdText}>{mapId}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Our Maps</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    type="text"
                    placeholder="Search Map ID..."
                    value={searchTerm}
                    onChangeText={handleSearchTermChange} // Use onChangeText in React Native
                />
            </View>
            <MapIdList mapIds={filteredMapIds} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use flex to manage layout
        paddingTop: 35, // Equivalent to top: 35px
        paddingHorizontal: 20, // Equivalent to right/left: 20px
        paddingBottom: 20, // Equivalent to bottom: 20px
        alignItems: 'center', // Center items horizontally
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    searchContainer: {
        width: '60%',
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
        flex: 1, // Allow the list to grow and take available space
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
        width: '60%',
        alignItems: 'center',
    },
    mapIdText: {
        textAlign: 'center',
        textDecorationLine: 'none', // Remove the default underline of Link
    },
});

export default UserPage;
