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

function EditMap() {
    const params = useParams();
    const { editMapId } = params;
    const navigate = useNavigate();
    const [gridSize, setGridSize] = useState(100);
    const squareSize = 30; // Let's use a fixed pixel size for the base unit
    const gridContainerSize = gridSize * squareSize; // Total size of the grid container
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedCol, setSelectedCol] = useState(null);
    const [isGridEditable, setIsGridEditable] = useState(false);
    const [productName, setProductName] = useState('');
    const [productCost, setProductCost] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productWeight, setProductWeight] = useState('');
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
    const [squareEditColor, setSquareEditColor] = useState('black');
    const [isMouseDown, setIsMouseDown] = useState(false);
    
    const [showProducts, setShowProducts] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showEditMap, setShowEditMap] = useState(false);
    
    //Search bar
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const searchInputRef = useRef(null); // Ref for search input
    const [highlightedLocation, setHighlightedLocation] = useState(null);
    
    
    /*****************************************************************************************************
    
   	useEffect
    
    ******************************************************************************************************/

	useEffect(() => {
        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, allProducts]);

    useEffect(() => {
        const handleMouseUp = () => setIsMouseDown(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/maps/${editMapId}`);
                if (response.data) {
                	if(response.data.grid.length !== 1) //TODO IF THE MAP IS NEW THERE IS NO DATA BUT DON'T SET TODO
                	{
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
                }
            } catch (error) {
                console.error('Error fetching map data:', error);
            }
        };

        if (editMapId) {
            fetchMapData();
        }
    }, [editMapId, gridSize]);  // gridSize added as dependency
    
    const bytesToMB = (bytes: number): string => {
	  const mb = bytes / (1024 * 1024);
	  return `${mb.toFixed(2)} MB`;
	};
	
	useEffect(() => {
        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, allProducts]);

    useEffect(() => {
        const wrapper = document.getElementById('canvas-wrapper');
        if (wrapper) {
            wrapper.scrollTop = 0; //wrapper.scrollHeight / 8;
            wrapper.scrollLeft = 0; //wrapper.scrollWidth / 8;
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });

        const preventZoom = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.deltaY !== 0)) {
                e.preventDefault();
            }
        };
        document.addEventListener('wheel', preventZoom, { passive: false });

        const preventKeyZoom = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-')) {
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', preventKeyZoom);

        return () => {
            document.removeEventListener('gesturestart', (e) => {
                e.preventDefault();
            });
            document.removeEventListener('wheel', preventZoom);
            document.removeEventListener('keydown', preventKeyZoom);
        };
    }, []);
    
    /*****************************************************************************************************
    
   	functions
    
    ******************************************************************************************************/
    
    const onShowProductsPressed = () => {
    	setShowProducts(true);
    	setShowAddProduct(false);
    	setShowEditMap(false);
    	setIsGridEditable(false);
    };
    
    const onShowAddProduct = () => {
    	setShowProducts(false);
    	setShowAddProduct(true);
    	setShowEditMap(false);
    	setIsGridEditable(false);
    };
    
    const onShowEditMap = () => {
    	setShowProducts(false);
    	setShowAddProduct(false);
    	setShowEditMap(true);
    	setIsGridEditable(true);
    };
    
    const saveMapData = async () => {
        try {
        	const jsonData = JSON.stringify(gridData);
			const payloadSizeInBytes = new Blob([jsonData]).size; // More accurate byte size
			
			axios.defaults.maxBodyLength = 10 * 1024 * 1024;

		alert(('Payload size (JSON):' + bytesToMB(payloadSizeInBytes) + 'mb'));
        
        	
        
            const response = await axios.post(
                `http://localhost:5000/api/maps/${editMapId}/save`,
                { grid: gridData }
            );
            if (response.data.success) {
                alert('Map data saved!');
            } else {
                alert('Failed to save map data.');
            }
        } catch (error) {
            console.error('Error saving map data:', error);
            alert('An error occurred while saving.');
        }
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

    const handleSquareClick = (row: number, col: number) => {
        if (isGridEditable) {
        	if(row < 20 && col < 20)
        	{
        		return;
        	}
        
            const newGridData = gridData.map((rowData) =>
                rowData.map((cell) =>
                    cell.locationX === row && cell.locationY === col
                        ? { ...cell, color: squareEditColor }
                        : cell
                )
            );
            setGridData(newGridData);
        } else {
            setSelectedRow(row);
            setSelectedCol(col);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (selectedRow !== null && selectedCol !== null) {
            const newProduct: Product = {
                name: productName,
                cost: productCost,
                weight: productWeight,
                description: productDescription,
                count: 1,
                locationX: selectedRow,
                locationY: selectedCol,
            };

            const newGridData = gridData.map(row =>
                row.map(cell => {
                    if (cell.locationX === selectedRow && cell.locationY === selectedCol) {
                        return {
                            ...cell,
                            products: [...(cell.products || []), newProduct],
                        };
                    }
                    return cell;
                })
            );

            setGridData(newGridData);
            setProductName('');
            setProductCost('');
            setProductDescription('');
            setProductWeight('');
        } else {
            alert('Please select a square on the grid first.');
        }
    };

    const removeProduct = (indexToRemove: number) => {
        if (selectedRow !== null && selectedCol !== null) {
            const newGridData = gridData.map(row =>
                row.map(cell => {
                    if (cell.locationX === selectedRow && cell.locationY === selectedCol) {
                        const updatedProducts = cell.products
                            ? cell.products.filter((_, index) => index !== indexToRemove)
                            : [];
                        return { ...cell, products: updatedProducts };
                    }
                    return cell;
                })
            );
            setGridData(newGridData);
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
        alignItems: 'center',
    };

    const topControlsStyle = {
        position: 'fixed',
        display: 'flex',
        boxSizing: 'border-box',
        alignItems: 'center',
        top: '10%',
        justifyContent: 'space-between',
        border: '1px solid black',
        backgroundColor: 'white',
        color: 'grey',
        zIndex: 200,
    };

    const gridSizeInputContainerStyle = {
        display: 'flex',
        alignItems: 'center',
    };

    const gridSizeInputStyle = {
        textAlign: 'left',
        marginLeft: '10px',
        padding: '5px',
        width: '50px',
    };

    const gridContainerStyle = {
        position: 'absolute',
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, ${squareSize}vw)`,
        gridTemplateRows: `repeat(${gridSize}, ${squareSize}vw)`,
        gap: '0px',
        boxSizing: 'border-box',
    };

    const leftSidebarStyle = {
        position: 'fixed',
        border: '1px solid black',
        width: '20%',
        height: '65%',
        left: '5%',
        top: '20%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: 'white',
        color: 'grey',
        boxSizing: 'border-box',
        overflow: 'scroll'
    };

    const rightSidebarStyle = {
        position: 'fixed',
        border: '1px solid black',
        width: '20%',
        height: '65%',
        right: '5%',
        top: '20%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: 'white',
        color: 'grey',
        boxSizing: 'border-box',
        overflow: 'scroll'
    };
    
    const bottomSidebarStyle = {
    	position: 'fixed',
        /*border: '1px solid black',*/
        
        bottom: '5%',
        width: '50%',
        height: '10%',
        left: '50%',
        transform: 'translate(-50%, 0%)'
    }

    const formContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        width: '80%',
        maxWidth: '400px',
        marginBottom: '20px',
    };

    const formGroupStyle = {
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
    };

    const labelStyle = {
        textAlign: 'left',
        marginBottom: '5px',
        fontWeight: 'bold',
    };

    const inputStyle = {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        textAlign: 'center',
    };

    const descriptionInputStyle = {
        ...inputStyle,
        minHeight: '80px',
        textAlign: 'left',
    };

    const selectedCoordinateKey = selectedRow !== null && selectedCol !== null ? `${selectedRow}-${selectedCol}` : null;
    const currentProducts = selectedCoordinateKey
        ? gridData[selectedRow]?.[selectedCol]?.products || []
        : [];

    const handleColorSelect = (color: string) => {
        setSquareEditColor(color);
    };

    const colorKeyContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        padding: '10px',
        borderRadius: '5px',
        width: 'fit-content'
    };

    const colorSquareStyle = (color: string) => ({
        width: '20px',
        height: '20px',
        backgroundColor: color,
        border: '1px solid #ccc',
        borderRadius: '3px',
        cursor: 'pointer',
        ...(squareEditColor === color && {
            border: `3px solid ${color}`,
            boxShadow: `0 0 5px ${color}`
        }),
    });

    const colorTextStyle = {
        cursor: 'pointer',
        padding: '5px',
        borderRadius: '3px',
    };

    const canvasWrapperStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'scroll',
    };

    const canvasContentStyle = {
        position: 'relative',
        width: `${gridContainerSize}px`, // Fixed width
        height: `${gridContainerSize}px`, // Fixed height
    };
    
    
    /****************************************************************************************************
    		search bar css
    *****************************************************************************************************/
    
    const topSearchControlsStyle = {
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

	/*****************************************************************************************************
    
   	typescript
    
    ******************************************************************************************************/
    

    return (
        <div style={pageStyle}>
        
        
        	<div style={topSearchControlsStyle}>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        

			{ showEditMap && (

            <div style={topControlsStyle}>
                <div style={colorKeyContainerStyle}>
                    <div>Color Key:</div>
                    <div
                        onClick={() => handleColorSelect('black')}
                        style={colorSquareStyle('black')}
                    />
                    <span
                        onClick={() => handleColorSelect('black')}
                        style={colorTextStyle}
                    >
                        Shelf
                    </span>
                    <div
                        onClick={() => handleColorSelect('white')}
                        style={colorSquareStyle('white')}
                    />
                    <span
                        onClick={() => handleColorSelect('white')}
                        style={colorTextStyle}
                    >
                        Empty
                    </span>
                    <div
                        onClick={() => handleColorSelect('blue')}
                        style={colorSquareStyle('blue')}
                    />
                    <span
                        onClick={() => handleColorSelect('blue')}
                        style={colorTextStyle}
                    >
                        Door
                    </span>
                    <div
                        onClick={() => handleColorSelect('pink')}
                        style={colorSquareStyle('pink')}
                    />
                    <span
                        onClick={() => handleColorSelect('pink')}
                        style={colorTextStyle}
                    >
                        Cash register
                    </span>
                </div>

            </div>
            
            )}

            <div id="canvas-wrapper" style={canvasWrapperStyle}>
                <div style={canvasContentStyle}>
                    {gridData.flat().map((cell) => (
                        <div
                            key={`row-${cell.locationX}-col-${cell.locationY}`}
                            style={{
                                position: 'absolute',
                                width: `${squareSize}vw`,
                                height: `${squareSize}vw`,
                                top: `${cell.locationX * squareSize}px`,
                                left: `${cell.locationY * squareSize}px`,
                                backgroundColor: highlightedLocation && highlightedLocation.row === cell.locationX && highlightedLocation.col === cell.locationY ? 'red' : cell.color,
                                border: '1px solid lightgrey',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
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
                                if (!isGridEditable) {
                                    setSelectedRow(cell.locationX);
                                    setSelectedCol(cell.locationY);
                                }
                            }}
                        ></div>
                    ))}
                </div>
            </div>
            
            {showAddProduct && (

            <div style={rightSidebarStyle}>
                <h1>Add Product</h1>
                <p>
                    {selectedRow !== null && selectedCol !== null && !isGridEditable
                        ? `Selected: Row ${selectedRow}, Col ${selectedCol}`
                        : isGridEditable
                            ? 'Grid editing is enabled'
                            : 'Select a square'}
                </p>
                <form onSubmit={handleSubmit} style={formContainerStyle}>
                    <div style={formGroupStyle}>
                        <label htmlFor="productName" style={labelStyle}>Product Name:</label>
                        <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} placeholder="Enter product name" />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="productCost" style={labelStyle}>Product Cost (£):</label>
                        <input type="number" id="productCost" value={productCost} onChange={(e) => setProductCost(e.target.value)} style={inputStyle} placeholder="Enter product cost" />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="productDescription" style={labelStyle}>Product Description:</label>
                        <textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} style={descriptionInputStyle} placeholder="Enter product" />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="productWeight" style={labelStyle}>Product Weight (kg):</label>
                        <input type="number" id="productWeight" value={productWeight} onChange={(e) => setProductWeight(e.target.value)} style={inputStyle} placeholder="Enter product weight" />
                    </div>
                    <button type="submit" style={{ padding: '10px', borderRadius: '4px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Add Product to Coordinate
                    </button>
                </form>
            </div>
            
            )}

			{showProducts && (

            <div style={leftSidebarStyle}>
                <h1>Products at Location</h1>
                <div style={{ overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {selectedCoordinateKey && !isGridEditable ? (
                        currentProducts.length === 0 ? (
                            <p>No products added to this coordinate yet.</p>
                        ) : (
                            currentProducts.map((product, index) => (
                                <div key={index} style={{
                                    width: '90%',
                                    marginBottom: '15px',
                                    paddingBottom: '15px',
                                    borderBottom: '1px solid #eee',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gridTemplateRows: 'auto auto auto',
                                    alignItems: 'center',
                                }}>
                                    <div style={{ textAlign: 'left', fontWeight: 'bold' }}>{product.name}</div>
                                    <div style={{ textAlign: 'right' }}>
                                        {product.cost}£
                                        <button onClick={() => removeProduct(index)} style={{ marginLeft: '5px' }}>X</button>
                                    </div>
                                    <div style={{ textAlign: 'left', gridColumn: '1 / 3' }}>{product.weight}kg</div>
                                    <div style={{ textAlign: 'center', gridColumn: '1 / 3', marginTop: '10px', width: '100%' }}>
                                        <p style={{ textAlign: 'left' }}>{product.description}</p>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        <p>{isGridEditable ? 'Click squares to change their color.' : 'Select a coordinate on the grid to see its products.'}</p>
                    )}
                </div>
            </div>
            
            )}
            
            
            <div style={bottomSidebarStyle}>

		        <button onClick={saveMapData}
		            style={{
		                position: 'fixed', bottom: '5%', left: '20%',
		                transform: 'translate(-50%, 0%)',
		                backgroundColor: '#007bff',
		                color: 'white',
		                border: 'none',
		                borderRadius: '5px',
		                cursor: 'pointer',
		                fontSize: '16px',
		                width: '30%',
		                height: '45%',
		            }}>
		            💾
		        </button>
		        
		        <button onClick={onShowAddProduct}
		            style={{
		                position: 'fixed', bottom: '5%', left: '40%',
		                transform: 'translate(-50%, 0%)',
		                backgroundColor: '#007bff',
		                color: 'white',
		                border: 'none',
		                borderRadius: '5px',
		                cursor: 'pointer',
		                fontSize: '16px',
		                width: '30%',
		                height: '45%',
		            }}>
		            <b>+</b>
		        </button>
		        
		        <button onClick={onShowProductsPressed}
		            style={{
		                position: 'fixed', bottom: '5%', left: '60%',
		                transform: 'translate(-50%, 0%)',
		                backgroundColor: '#007bff',
		                color: 'white',
		                border: 'none',
		                borderRadius: '5px',
		                cursor: 'pointer',
		                fontSize: '16px',
		                width: '30%',
		                height: '45%',
		            }}>
		            i
		        </button>
		        
		        <button onClick={onShowEditMap}
		            style={{
		                position: 'fixed', bottom: '5%', left: '80%',
		                width: '30%',
		                height: '45%',
		                transform: 'translate(-50%, 0%)',
		                backgroundColor: '#007bff',
		                color: 'white',
		                border: 'none',
		                borderRadius: '5px',
		                cursor: 'pointer',
		                fontSize: '16px',
		            }}>
		            <b>&#9998;</b>
		        </button>
            
            </div>

        </div>
    );
}

export default EditMap;
