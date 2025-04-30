import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Button } from 'react-native';
// import { useParams, useNavigate } from 'react-router-native'; // Removed react-router-native
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons'; // For the close button
import { MaterialIcons } from '@expo/vector-icons';  // For the eye icon
import { useNavigation, useRoute } from '@react-navigation/native'; // Added for navigation

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

interface CartItemInterface extends Product {
    quantity: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function ViewMap() {
    // const params = useParams(); // Removed react-router-native
    // const { mapId } = params;    // Removed react-router-native
    const route = useRoute();  // Added for react-navigation
    const { mapId } = route.params as { mapId: string }; // Get mapId from route params
    const navigation = useNavigation(); // Added for react-navigation

    const [gridSize, setGridSize] = useState(100);
    const squareSize = 30; // Let's use a fixed pixel size for the base unit
    const gridContainerSize = gridSize * squareSize; // Total size of the grid container
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [selectedCol, setSelectedCol] = useState<number | null>(null);
    const [coordinateProducts, setCoordinateProducts] = useState<{ [key: string]: Product[] }>({});
    const [gridData, setGridData] = useState<GridLocation[][]>(() => {
        const initialGrid: GridLocation[][] = [];
        for (let i = 0; i < gridSize; i++) {
            initialGrid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                initialGrid[i][j] = { locationX: i, locationY: j, color: 'white', products: [] };
            }
        }
        return initialGrid;
    });
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [shoppingCart, setShoppingCart] = useState<CartItemInterface[]>([]);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [productQuantities, setProductQuantities] = useState<{ [key: string]: number } | null>(null);
    const [highlightedLocation, setHighlightedLocation] = useState<{ row: number; col: number } | null>(null);
    const searchInputRef = useRef<TextInput>(null); // Ref for search input
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [pathUpdate, setPathUpdate] = useState(true);


    /*****************************************************************************************************

         useEffect

     ******************************************************************************************************/

    useEffect(() => {
        const handleMouseUp = () => setIsMouseDown(false);
        // window.addEventListener('mouseup', handleMouseUp); // Removed window.addEventListener
        // return () => window.removeEventListener('mouseup', handleMouseUp); // Removed window.removeEventListener
    }, []);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:5000//api/maps/${mapId}`);
                if (response.data) {
                    setGridData(response.data.grid);

                    const products: Product[] = [];

                    // Iterate through the 2D grid
                    for (const row of response.data.grid) {
                        if (row) {
                            for (const cell of row) {
                                if (cell && cell.products) {
                                    // Add all products from the current cell to the allProducts array
                                    products.push(...cell.products);
                                }
                            }
                        }
                    }
                    setAllProducts(products);
                }
            } catch (error) {
                console.error('Error fetching map data:', error);
            }
        };

        if (mapId) {
            fetchMapData();
        }

        const fetchCart = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:5000//api/cart');
                setShoppingCart(response.data);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };

    }, [mapId]);  // gridSize removed as dependency, as it's now fixed

    useEffect(() => {
        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, allProducts]);

    useEffect(() => {
        if (allProducts && shoppingCart) {
            const syncedQuantities: { [key: string]: number } = {};
            allProducts.forEach(product => {
                const cartItem = shoppingCart.find(item => item.name === product.name);
                syncedQuantities[product.name] = cartItem ? cartItem.quantity : 0;
            });
            setProductQuantities(syncedQuantities);
        }
    }, [shoppingCart, allProducts]);

    useEffect(() => {
        return () => {
            setHighlightedLocation(null);
        };
    }, [isCartVisible]);

    useEffect(() => {

        if (shoppingCart.length == 0) {
            return;
        }


        function shortestPath(grid: GridLocation[][], start: { x: number, y: number }, end: { x: number, y: number }) {
            const rows = grid.length;
            const cols = grid[0].length;

            const isInBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;
            const isWalkable = (x: number, y: number) => isInBounds(x, y) && (grid[x][y].color === 'white' || grid[x][y].color === 'red' || grid[x][y].color === 'yellow');

            const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
            const queue = [{ x: start.x, y: start.y, path: [{ x: start.x, y: start.y }] }];

            visited[start.y][start.x] = true;

            const directions = [
                { dx: 1, dy: 0 }, // right
                { dx: -1, dy: 0 }, // left
                { dx: 0, dy: 1 }, // down
                { dx: 0, dy: -1 } // up
            ];

            while (queue.length > 0) {
                const { x, y, path } = queue.shift()!;

                if (x === end.x && y === end.y) {
                    return path;
                }

                for (const { dx, dy } of directions) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (isWalkable(nx, ny) && !visited[ny][nx]) {
                        visited[ny][nx] = true;
                        queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
                    }
                }
            }

            return null; // No path found
        }


        var previous: Product | null = null;
        shoppingCart.forEach(item => {
            if (previous != null) {
                const start = { x: previous.locationX, y: previous.locationY };
                const end = { x: item.locationX, y: item.locationY };
                const path = shortestPath(gridData, start, end);

                if (path == null) {
                    //Highlight each location
                    shoppingCart.forEach(item => {
                        gridData[item.locationX][item.locationY].color = 'red';
                    });
                    return;
                }

                path.forEach(pathPosition => {
                    gridData[pathPosition.x][pathPosition.y].color = 'yellow';
                });

                //Highlight each location
                shoppingCart.forEach(item => {
                    gridData[item.locationX][item.locationY].color = 'red';
                });
            }
            previous = item;
        });

    }, [isCartVisible, shoppingCart, gridData, squareSize, gridSize, pathUpdate]);


    /*****************************************************************************************************

         functions

     ******************************************************************************************************/

    const handleSquareClick = (row: number, col: number) => {
        setSelectedRow(row);
        setSelectedCol(col);
        setHighlightedLocation(null); // Clear highlight on grid click
    };

    const handleSearchChange = (event: React.ChangeEvent<TextInput>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.focus(); // Refocus on the input
        }
    };

    const handleSearchQuantityChange = (event: React.ChangeEvent<TextInput>, product: Product) => {
        const newQuantity = parseInt(event.target.value, 10);
        setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [product.name]: isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity,
        }));
        updateCart(product, isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity);
    };

    const updateCart = async (product: Product, quantity: number) => {
        try {
            const response = await axios.post('http://10.0.2.2:5000//api/cart/add', { product, quantity });
            if (response.data.success) {
                if (quantity === 0) {
                    setShoppingCart(prevCart => prevCart.filter(item => item.name !== product.name));
                } else {
                    const existingCartItemIndex = shoppingCart.findIndex(item => item.name === product.name);
                    if (existingCartItemIndex > -1) {
                        const updatedCart = [...shoppingCart];
                        updatedCart[existingCartItemIndex].quantity = quantity;
                        setShoppingCart(updatedCart);
                    } else {
                        setShoppingCart([...shoppingCart, { ...product, quantity }]);
                    }
                }
            } else {
                alert(`Failed to update cart: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert('Failed to update cart.');
        }
    };

    const handleViewProductOnMap = (product: Product) => {
        if (product.locationX !== undefined && product.locationY !== undefined) {

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (gridData[i][j].color === 'red') {
                        gridData[i][j].color = 'black';
                    }
                    else if (gridData[i][j].color === 'yellow') {
                        gridData[i][j].color = 'white';
                    }

                }
            }

            setHighlightedLocation({ row: product.locationX, col: product.locationY });
            setSearchTerm(product.name);
        } else {
            alert(`Location not available for ${product.name}`);
            setHighlightedLocation(null);
        }
    };

    const toggleCartVisibility = () => {
        setIsCartVisible(!isCartVisible);
        setHighlightedLocation(null); // Clear highlight when cart opens/closes
    };

    const mapProducts = () => {
        setIsCartVisible(!isCartVisible);
        setHighlightedLocation(null); // Clear highlight when cart opens/closes
        setPathUpdate(!pathUpdate);
    };

    const handleCartQuantityChange = async (productName: string, newQuantity: number) => {

        if (!isNaN(newQuantity) && newQuantity >= 0) {
            const productToUpdate = shoppingCart.find(item => item.name === productName);
            if (productToUpdate) {
                updateCart(productToUpdate, newQuantity);
            }
        } else if (!isNaN(newQuantity) && newQuantity === 0) {
            try {
                const productToRemove = shoppingCart.find(item => item.name === productName);
                if (productToRemove) {
                    const response = await axios.post('http://localhost:5000/api/cart/add', { product: productToRemove, quantity: 0 });
                    if (response.data.success) {
                        setShoppingCart(prevCart => prevCart.filter(item => item.name !== productName));
                    } else {
                        alert(`Failed to remove from cart: ${response.data.message}`);
                    }
                }
            } catch (error) {
                console.error('Error removing from cart:', error);
                alert('Failed to remove from cart.');
            }
        }
    };


    /*****************************************************************************************************

         style

     ******************************************************************************************************/

    const styles = StyleSheet.create({
        page: {
            flex: 1,
            height: '100%',
        },
        topControls: {
            width: '80%',
            padding: 10,
            alignItems: 'center',
            position: 'absolute',
            top: '0%',
            left: '10%',
            right: '10%',
            flexDirection: 'column',
        },
        searchContainer: {
            width: '100%',
            marginVertical: 10,
            zIndex: 500,
        },
        searchInput: {
            width: '100%',
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            fontSize: 16,
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            marginTop: 5,
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 500,
        },
        productItem: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        productDetails: {
            flexGrow: 1,
            textAlign: 'left',
            marginRight: 10,
            zIndex: 500,
        },
        actions: {
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center',
            zIndex: 10,
        },
        shoppingCartButton: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            padding: 15,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 16,
            zIndex: 100,
        },
        shoppingCartOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 101,
        },
        shoppingCartDiv: {
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 5,
            maxWidth: '80%',
            maxHeight: '80%',
            overflowY: 'auto',
            position: 'relative',
        },
        cartItem: {
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingVertical: 10,
            display: 'grid',
            gridTemplateColumns: 'auto auto auto',
            gridTemplateRows: 'auto auto auto',
            alignItems: 'center',
            gap: 10,
        },
        cartItemName: {
            gridColumnStart: 1,
            gridColumnEnd: 2,
            gridRowStart: 1,
            gridRowEnd: 2,
            textAlign: 'left',
            fontWeight: 'bold',
        },
        cartItemPrice: {
            gridColumnStart: 3,
            gridColumnEnd: 4,
            gridRowStart: 1,
            gridRowEnd: 2,
            textAlign: 'right',
        },
        cartItemQuantityContainer: {
            gridColumnStart: 3,
            gridColumnEnd: 4,
            gridRowStart: 3,
            gridRowEnd: 4,
            textAlign: 'right',
        },
        cartItemDescription: {
            gridColumnStart: 1,
            gridColumnEnd: -1,
            gridRowStart: 2,
            gridRowEnd: 3,
            fontSize: 12,
            color: '#555',
            marginTop: 5,
        },
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            cursor: 'pointer',
            fontSize: 24,
            color: '#555',
            background: 'none',
            border: 'none',
            padding: 0,
        },
        checkoutButton: {
            marginTop: 20,
            backgroundColor: 'green',
            color: 'white',
            paddingVertical: 10,
            paddingHorizontal: 15,
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 16,
            width: '100%',
        },
        clearButton: { // new style
            position: 'absolute',
            top: '50%',
            right: 10,
            transform: [{ translateY: '-50%' }],
            cursor: 'pointer',
            fontSize: 16,
            color: '#888',
            background: 'none',
            border: 'none',
            padding: 0,
            display: searchTerm ? 'flex' : 'none', // only show if there is text
            zIndex: 10,
        },
        canvasWrapper: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -10,
            width: gridContainerSize, // Fixed width
            height: gridContainerSize, // Fixed height
        },
        canvasContent: {
            position: 'relative',
            width: '100%', // Use 100% of the container
            height: '100%', // Use 100% of the container
            zIndex: -9
        },
        gridSquare: {
            position: 'absolute',
            width: squareSize,
            height: squareSize,
            borderWidth: 1,
            borderColor: 'lightgrey',
            boxSizing: 'border-box',
            cursor: 'pointer',
            zIndex: -8
        }
    });


    return (
        <View style={styles.page}>
            <View style={styles.topControls}>
                <View style={styles.searchContainer}>
                    <TextInput
                        type="text"
                        placeholder="Search Products..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        ref={searchInputRef} // attach the ref
                    />
                    <TouchableOpacity
                        onPress={handleClearSearch}
                        style={styles.clearButton}
                        accessibilityLabel="Clear Search"
                    >
                        <Text>&times;</Text>
                    </TouchableOpacity>
                    {searchTerm && filteredProducts.length > 0 && (
                        <ScrollView style={styles.dropdown}>
                            {filteredProducts.map(product => (
                                <View key={product.name} style={styles.productItem}>
                                    <View style={styles.productDetails}>
                                        <Text style={{ fontWeight: 'bold' }}>{product.name}</Text>
                                        <Text>Cost: £{product.cost}</Text>
                                        <Text>Weight: {product.weight}kg</Text>
                                        <Text>{product.description.substring(0, 50)}...</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => handleViewProductOnMap(product)}>
                                            <MaterialIcons name="visibility" size={24} color="black" />
                                        </TouchableOpacity>
                                        <TextInput
                                            type="number"
                                            min="0"
                                            value={productQuantities && productQuantities[product.name] !== undefined ? productQuantities[product.name] : 0}
                                            onChange={(e) => handleSearchQuantityChange(e, product)}
                                            style={{ width: 40, textAlign: 'right' }}
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>


            <View style={styles.canvasWrapper}>
                <View style={styles.canvasContent}>
                    {gridData.flat().map((cell) => (
                        <TouchableOpacity
                            key={`row-${cell.locationX}-col-${cell.locationY}`}
                            style={[
                                styles.gridSquare,
                                {
                                    top: cell.locationX * squareSize,
                                    left: cell.locationY * squareSize,
                                    backgroundColor: highlightedLocation && highlightedLocation.row === cell.locationX && highlightedLocation.col === cell.locationY ? 'red' : cell.color,
                                }
                            ]}
                            onPress={() => {
                                handleSquareClick(cell.locationX, cell.locationY);
                            }}
                            onMouseDown={() => {
                                setIsMouseDown(true);
                                handleSquareClick(cell.locationX, cell.locationY);
                            }}
                            onMouseEnter={() => {
                                if (isMouseDown) {
                                    handleSquareClick(cell.locationX, cell.locationY);
                                }
                            }}
                        >
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {(
                <TouchableOpacity style={styles.shoppingCartButton} onPress={toggleCartVisibility}>
                    <Text style={{ color: 'white' }}>
                        Shopping Cart ({shoppingCart.reduce((sum, item) => sum + (item.quantity || 0), 0)})
                    </Text>
                </TouchableOpacity>
            )}

            {isCartVisible && (
                <View style={styles.shoppingCartOverlay} onPress={toggleCartVisibility}>
                    <View style={styles.shoppingCartDiv} onPress={(e) => e.stopPropagation()}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Shopping Cart</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={toggleCartVisibility}>
                            <Text>&times;</Text>
                        </TouchableOpacity>
                        <ScrollView style={{ maxHeight: '70vh' }}>
                            {shoppingCart.length === 0 ? (
                                <Text>Your cart is empty.</Text>
                            ) : (
                                shoppingCart.map(item => (
                                    <View key={item.name} style={styles.cartItem}>
                                        <Text style={styles.cartItemName}>{item.name}</Text>
                                        <Text style={styles.cartItemPrice}>£{item.cost}</Text>
                                        <View style={styles.cartItemQuantityContainer}>
                                            <Text>Qty: </Text>
                                            <TextInput
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const qty = parseInt(e.target.value);
                                                    handleCartQuantityChange(item.name, isNaN(qty) ? 0 : qty);
                                                }}
                                                style={{ width: 40, textAlign: 'right' }}
                                            />
                                        </View>
                                        <Text style={styles.cartItemDescription}>{item.description}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                        {shoppingCart.length > 0 && (
                            <TouchableOpacity style={styles.checkoutButton} onPress={mapProducts}>
                                <Text style={{ color: 'white' }}>Map Items</Text>
                            </TouchableOpacity>
                        )}
                        {shoppingCart.length > 0 && (
                            <TouchableOpacity style={styles.checkoutButton}>
                                 <Text style={{ color: 'white' }}>Checkout</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
            <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      	    <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
    );
}

export default ViewMap;

