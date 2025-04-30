import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

function ViewMap() {
    const params = useParams();
    const { mapId } = params;
    const navigate = useNavigate();
    const [gridSize, setGridSize] = useState(100);
    const squareSize = 30; // Let's use a fixed pixel size for the base unit
    const gridContainerSize = gridSize * squareSize; // Total size of the grid container
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedCol, setSelectedCol] = useState(null);
    const [coordinateProducts, setCoordinateProducts] = useState({});
    const [gridData, setGridData] = useState(() => {
        const initialGrid: GridLocation[][] = [];
        for (let i = 0; i < gridSize; i++) {
            initialGrid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                initialGrid[i][j] = { locationX: i, locationY: j, color: 'white', products: [] };
            }
        }
        return initialGrid;
    });
    const [allProducts, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [shoppingCart, setShoppingCart] = useState([]);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [productQuantities, setProductQuantities] = useState(null);
    const [highlightedLocation, setHighlightedLocation] = useState(null);
    const searchInputRef = useRef(null); // Ref for search input
    const [isMouseDown, setIsMouseDown] = useState(false);
    const canvasRef = useRef(null);
    const [pathUpdate, setPathUpdate] = useState(true);

    /*****************************************************************************************************

         useEffect

    ******************************************************************************************************/

    useEffect(() => {
        const handleMouseUp = () => setIsMouseDown(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/maps/${mapId}`);
                if (response.data) {
                    setGridData(response.data.grid);

                    const products = [];

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
                const response = await axios.get('http://localhost:5000/api/cart');
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


        function shortestPath(grid, start, end) {
            const rows = grid.length;
            const cols = grid[0].length;

            const isInBounds = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows;
            const isWalkable = (x, y) => isInBounds(x, y) && (grid[x][y].color === 'white' || grid[x][y].color === 'red' || grid[x][y].color === 'yellow');

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
                const { x, y, path } = queue.shift();

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
        
        
        var previous = null;
        shoppingCart.forEach(item => {
        	if(previous != null)
			{
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

    const handleSquareClick = (row, col) => {
        setSelectedRow(row);
        setSelectedCol(col);
        setHighlightedLocation(null); // Clear highlight on grid click
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.focus(); // Refocus on the input
        }
    };

    const handleSearchQuantityChange = (event, product) => {
        const newQuantity = parseInt(event.target.value, 10);
        setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [product.name]: isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity,
        }));
        updateCart(product, isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity);
    };

    const updateCart = async (product, quantity) => {
        try {
            const response = await axios.post('http://localhost:5000/api/cart/add', { product, quantity });
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

    const handleCartQuantityChange = async (event, productName) => {
        const newQuantity = parseInt(event.target.value, 10);

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

    const pageStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    };

    const topControlsStyle = {
        display: 'flex',
        width: '80%',
        padding: '10px',
        boxSizing: 'border-box',
        alignItems: 'center',
        position: 'absolute',
        top: '0%',
        left: '10%',
        right: '10%',
        justifyContent: 'space-between',
        flexDirection: 'column',
    };

    const searchContainerStyle = {
        position: 'fixed',
        width: '50%',
        margin: '10px auto',
        zIndex: 500,
    };

    const searchInputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
    };

    const dropdownStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginTop: '5px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 500,
    };

    const productItemStyle = {
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const productDetailsStyle = {
        flexGrow: 1,
        textAlign: 'left',
        marginRight: '10px',
        zIndex: 500,
    };

    const actionsStyle = {
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        zIndex: 10,
    };

    const shoppingCartButtonStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        zIndex: 100,
    };

    const shoppingCartOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 101,
    };

    const shoppingCartDivStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '80%',
        maxHeight: '80%',
        overflowY: 'auto',
        position: 'relative',
    };

    const cartItemStyle = {
        borderBottom: '1px solid #eee',
        padding: '10px 0',
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gridTemplateRows: 'auto auto auto',
        alignItems: 'center',
        gap: '10px',
    };

    const cartItemNameStyle = {
        gridColumn: '1 / 2',
        gridRow: '1 / 2',
        textAlign: 'left',
        fontWeight: 'bold',
    };

    const cartItemPriceStyle = {
        gridColumn: '3 / 4',
        gridRow: '1 / 2',
        textAlign: 'right',
    };

    const cartItemQuantityContainerStyle = {
        gridColumn: '3 / 4',
        gridRow: '3 / 4',
        textAlign: 'right',
    };

    const cartItemDescriptionStyle = {
        gridColumn: '1 / -1',
        gridRow: '2 / 3',
        fontSize: '0.9em',
        color: '#555',
        marginTop: '5px',
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        cursor: 'pointer',
        fontSize: '1.5em',
        color: '#555',
        background: 'none',
        border: 'none',
        padding: 0,
    };

    const checkoutButtonStyle = {
        marginTop: '20px',
        backgroundColor: 'green',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        width: '100%',
    };

    const clearButtonStyle = { // new style
        position: 'absolute',
        top: '50%',
        right: '10px',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#888',
        background: 'none',
        border: 'none',
        padding: 0,
        display: searchTerm ? 'block' : 'none', // only show if there is text
        zIndex: 10,
    };

    const canvasWrapperStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        width: `${gridContainerSize}px`, // Fixed width
        height: `${gridContainerSize}px`, // Fixed height
    };

    const canvasContentStyle = {
        position: 'relative',
        width: '100%', // Use 100% of the container
        height: '100%', // Use 100% of the container
        zIndex: -9
    };

    /*****************************************************************************************************

         useEffect

    ******************************************************************************************************/


    return (
        <div style={pageStyle}>
            <div style={topControlsStyle}>
                <div style={searchContainerStyle}>
                    <input
                        type="text"
                        placeholder="Search Products..."
                        style={searchInputStyle}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        ref={searchInputRef} // attach the ref
                    />
                    <button
                        onClick={handleClearSearch}
                        style={clearButtonStyle}
                        aria-label="Clear Search"
                    >
                        &times;
                    </button>
                    {searchTerm && filteredProducts.length > 0 && (
                        <div style={dropdownStyle}>
                            {filteredProducts.map(product => (
                                <div key={product.name} style={productItemStyle}>
                                    <div style={productDetailsStyle}>
                                        <div><strong>{product.name}</strong></div>
                                        <div>Cost: £{product.cost}</div>
                                        <div>Weight: {product.weight}kg</div>
                                        <div>{product.description.substring(0, 50)}...</div>
                                    </div>
                                    <div style={actionsStyle}>
                                        <div onClick={() => handleViewProductOnMap(product)}>👁</div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={productQuantities && productQuantities[product.name] !== undefined ? productQuantities[product.name] : 0}
                                            onChange={(e) => handleSearchQuantityChange(e, product)}
                                            style={{ width: '40px', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            <div id="canvas-wrapper" style={canvasWrapperStyle}>
                <div style={canvasContentStyle}>
                    {gridData.flat().map((cell) => (
                        <div
                            key={`row-${cell.locationX}-col-${cell.locationY}`}
                            style={{
                                position: 'absolute',
                                width: `${squareSize}px`,
                                height: `${squareSize}px`,
                                top: `${cell.locationX * squareSize}px`,
                                left: `${cell.locationY * squareSize}px`,
                                backgroundColor: highlightedLocation && highlightedLocation.row === cell.locationX && highlightedLocation.col === cell.locationY ? 'red' : cell.color,
                                cursor: 'pointer',
                                border: '1px solid lightgrey',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                                zIndex: -8
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
                            onClick={() => {
                                setSelectedRow(cell.locationX);
                                setSelectedCol(cell.locationY);
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {(
                <button style={shoppingCartButtonStyle} onClick={toggleCartVisibility}>
                    Shopping Cart ({shoppingCart.reduce((sum, item) => sum + (item.quantity || 0), 0)})
                </button>
            )}

            {isCartVisible && (
                <div style={shoppingCartOverlayStyle} onClick={toggleCartVisibility}>
                    <div style={shoppingCartDivStyle} onClick={(e) => e.stopPropagation()}>
                        <h2>Shopping Cart</h2>
                        <button style={closeButtonStyle} onClick={toggleCartVisibility}>&times;</button>
                        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                            {shoppingCart.length === 0 ? (
                                <p>Your cart is empty.</p>
                            ) : (
                                shoppingCart.map(item => (
                                    <div key={item.name} style={cartItemStyle}>
                                        <div style={cartItemNameStyle}>{item.name}</div>
                                        <div style={cartItemPriceStyle}>£{item.cost}</div>
                                        <div style={cartItemQuantityContainerStyle}>
                                            Qty: <input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => handleCartQuantityChange(e, item.name)}
                                                style={{ width: '40px', textAlign: 'right' }}
                                            />
                                        </div>
                                        <div style={cartItemDescriptionStyle}>{item.description}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        {shoppingCart.length > 0 && (
                            <button style={checkoutButtonStyle} onClick={mapProducts}>Map Items</button>
                        )}
                        {shoppingCart.length > 0 && (
                            <button style={checkoutButtonStyle}>Checkout</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewMap;

