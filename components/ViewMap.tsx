import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  // Add other relevant product properties
}

interface GridLocation {
  products?: Product[];
  // Add other relevant grid location properties
}

const ViewMap = () => {
  const route = useRoute();
  const { mapId } = route.params;
  const imageUrl = `http://192.168.1.146:5000/api/maps/${mapId}/image`;

  const [searchText, setSearchText] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [editMapId, setEditMapId] = useState<string | undefined>(undefined); // Assuming mapId from route.params is the editMapId
  const [gridData, setGridData] = useState<GridLocation[][]>([]);

  useEffect(() => {
    if (mapId) {
      setEditMapId(mapId);
    }
  }, [mapId]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await axios.get(`http://192.168.1.146:5000/api/maps/${editMapId}`);
        if (response.data) {
          if (response.data.grid?.length > 0) {
            setGridData(response.data.grid);

            const products: Product[] = [];

            // Iterate through the 2D grid
            response.data.grid.forEach((row: GridLocation[]) => {
              if (row) {
                row.forEach((cell: GridLocation) => {
                  if (cell && cell.products) {
                    // Add all products from the current cell to the allProducts array
                    products.push(...cell.products);
                  }
                });
              }
            });
            setAllProducts(products);
          }
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
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
      setFilteredProducts(filtered);
      setIsDropdownVisible(true);
    } else {
      setFilteredProducts([]);
      setIsDropdownVisible(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSearchText(product.name);
    setIsDropdownVisible(false);
    // You can perform further actions here when a product is selected
    console.log('Selected product:', product);
  };

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => handleProductSelect(item)} style={styles.dropdownItem}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  ), [handleProductSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products..."
          value={searchText}
          onChangeText={handleSearchTextChange}
        />
        {isDropdownVisible && filteredProducts.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={filteredProducts}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>

      {mapId ? (
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
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  image: {
    width: '90%',
    height: '80%', // Adjust height to accommodate the search bar
    marginTop: 10,
  },
});

export default ViewMap;
