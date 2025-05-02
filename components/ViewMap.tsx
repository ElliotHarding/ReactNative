import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Text, Pressable, Button, TouchableOpacity} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

interface Product {
    name: string;
    cost: string;
    weight: string;
    description: string;
    count: number;
    locationX: number;
    locationY: number;
}

interface GridLocation {
    locationX: number;
    locationY: number;
    color: string;
    products?: Product[];
}

const ViewMap = () => {
    const route = useRoute();
    const { mapId } = route.params;
    const imageUrl = `http://192.168.1.146:5000/api/maps/${mapId}/image`;

    const [searchText, setSearchText] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [editMapId, setEditMapId] = useState<string | undefined>(undefined);
    const [gridData, setGridData] = useState<GridLocation[][]>([]);
    const dropdownRef = useRef<AutocompleteDropdown>(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (mapId) {
            setEditMapId(mapId);
        }
    }, [mapId]);

    useEffect(() => {
        const fetchMapData = async () => {
            if (!editMapId) {
                setLoading(false);
                setError("Map ID is undefined."); // set error
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://192.168.1.146:5000/api/maps/${editMapId}`);
                if (response.data) {
                    if (response.data.grid?.length > 0) {
                        setGridData(response.data.grid);

                        const products: Product[] = [];

                        response.data.grid.forEach((row: GridLocation[]) => {
                            if (row) {
                                row.forEach((cell: GridLocation) => {
                                    if (cell && cell.products) {
                                        products.push(...cell.products);
                                    }
                                });
                            }
                        });
                        setAllProducts(products);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching map data:', error);
                setError(error.message || "Failed to fetch map data.");
            } finally {
                setLoading(false);
            }
        };

        if (editMapId) {
            fetchMapData();
        }
    }, [editMapId]);

    const handleSearchTextChange = (text: string) => {
        setSearchText(text);
 
        if (text.length > 0 && allProducts.length > 0) {
            const filtered = allProducts.filter(product =>
                product.name.toLowerCase().includes(text.toLowerCase())
            );
            const mappedProducts = filtered.map(product => ({
                id: product.name,
                title: product.name,
                ...product,
            }));
            setFilteredProducts(mappedProducts);
        } else {
            setFilteredProducts([]);
        }
    };

    const handleProductSelect = (item: any) => {
        if (item) {
            setSearchText(item.name);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <AutocompleteDropdown
		  ref={dropdownRef}
		  dataSet={filteredProducts}
		  onSelectItem={handleProductSelect}
		  suggestionsListMaxHeight={150}
		  renderItem={(item) => (
		    <Text style={styles.dropdownItem}>{item.title}</Text>
		  )}
		  textInputProps={{
		    placeholder: "Search for products...",
		    value: searchText,
		    onChangeText: handleSearchTextChange,
		    style: styles.searchInput,
		    autoCorrect: false,
		    autoCapitalize: 'none',
		  }}
		  containerStyle={{
		    flexGrow: 0,
		    flexShrink: 0,
		    zIndex: 100,
		  }}
		/>
            </View>
            
            <View style={{ width: '90%', alignItems: 'center', marginTop: 10 }}>
            	{filteredProducts.map((item) => (
		  <View key={item.id} style={{ marginBottom: 10, padding: 10, borderWidth: 1, width: '100%', borderColor: 'gray', borderRadius: 5, }}>
		    <TouchableOpacity
		      onPress={() => handleProductSelect(item)}
		      style={styles.resultButton}
		    >
		      <Text style={styles.resultButtonText}>{item.name}</Text>
		    </TouchableOpacity>
		    <Text style={{ fontSize: 12, color: 'gray' }}>{item.description}</Text>
		  </View>
		))}
            </View>
            

            {loading ? (
                <Text>Loading map...</Text>
            ) : error ? (
                <Text style={{ color: 'red' }}>Error: {error}</Text>
            ) : mapId ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                />
            ) : (
                <Text>No Map ID provided.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    searchContainer: {
        width: '90%',
        marginTop: 20,
        zIndex: 1,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 5,
        backgroundColor: 'white',
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
    image: {
        width: '90%',
        height: '80%',
        marginTop: 10,
    },
});

export default ViewMap;

