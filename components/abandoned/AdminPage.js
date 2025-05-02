import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import axios from 'axios';

interface MapItem {
    customMapId: number;
}

function AdminPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMapIds, setFilteredMapIds] = useState([]);
    const [mapIds, setMapIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMapId, setNewMapId] = useState('');
    const [addingMap, setAddingMap] = useState(false);
    const [addMapError, setAddMapError] = useState(null);

    useEffect(() => {
        const fetchMapIds = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/map-ids');
                const data = response.data;
                setMapIds(data);
                setFilteredMapIds(data);
            } catch (e) {
                console.error('Error fetching map IDs:', e);
                setError(e.message || 'Failed to fetch map IDs.');
            } finally {
                setLoading(false);
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

    // Function to handle changes in the search term
    const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleRemoveMap = async (mapNumber: number) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/maps/${mapNumber}`, {
                method: 'DELETE',
            });

            console.log(`Map with ID ${mapNumber} removed successfully.`);
            // Update the local state to remove the deleted map ID
            setMapIds(prevIds => prevIds.filter(id => id !== mapNumber));
            setFilteredMapIds(prevIds => prevIds.filter(id => id !== mapNumber));
        } catch (error) {
            console.error('Error removing map:', error);
            alert('Removing map failed!');
        }
    };

    const handleAddMap = async () => {
        setAddingMap(true);
        setAddMapError(null);
        try {
            const response = await axios.post('http://localhost:5000/api/maps', { customMapId: parseInt(newMapId) });
            if (response.status === 201) {
                console.log('New map added successfully:', response.data);
                setMapIds(prevIds => [...prevIds, response.data.customMapId]);
                setFilteredMapIds(prevIds => [...prevIds, response.data.customMapId]);
                setNewMapId(''); // Clear the input field
            } else {
                console.error('Failed to add new map:', response.data);
                setAddMapError(response.data.message || 'Failed to add new map.');
            }
        } catch (error) {
            console.error('Error adding new map:', error);
            setAddMapError(error.message || 'Error adding new map.');
        } finally {
            setAddingMap(false);
        }
    };

    function MapIdList({ mapIds, onRemoveMap }: { mapIds: number[]; onRemoveMap: (id: number) => void }) {
        const buttonStyle = {
            padding: '10px 20px',
            margin: '5px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f0f0f0',
            cursor: 'pointer',
            textAlign: 'center',
            position: 'relative',
            width: '60%'
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '0 auto' }}>
                {mapIds.map((mapId, index) => (
                    <div style={buttonStyle} key={index}>
                    	<Link to={`/view/${mapId}`} style={{textDecoration: 'none'}} key={index}>
                        	<a>{mapId}</a>
                    	</Link>
                        <Link to={`/edit/${mapId}`} style={{ position: 'absolute', right: '13%', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                            &#9998; {/* Unicode for pencil icon */}
                        </Link>
                        <Link to={`/view/${mapId}`} style={{ position: 'absolute', right: '7%', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                            &#128065; {/* Unicode for eye icon */}
                        </Link>
                        <span
                            onClick={() => onRemoveMap(mapId)}
                            style={{ position: 'absolute', right: '2%', cursor: 'pointer' }}
                        >
                            &#128465; {/* Unicode for wastebasket icon */}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    if (loading) {
        return <div>Loading Map IDs...</div>;
    }

    if (error) {
        return <div>Error loading Map IDs: {error}</div>;
    }

	//style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', width: '60%', marginLeft: '20%', position: 'relative'

    return (
        <div style={{ position: 'absolute', top: '35px', right: '20px', left: '20px', bottom: '20px'}}>
            <br />
            <h2>Admin Dashboard - Manage Maps</h2>
            <br />
            
            <input
            	style={{ width: '40%', padding: '8px', borderRadius: '15px', transform: 'translate(-10%, 0%)' }}
                type="number"
                placeholder="New Map ID"
                value={newMapId}
                onChange={(e) => setNewMapId(e.target.value)}
            />
            
            <span>
	            <button onClick={handleAddMap} disabled={addingMap} style={{ padding: '8px 15px', width: '10%', cursor: 'pointer', transform: 'translate(-20%, 0%)'}}>
	                {addingMap ? 'Adding...' : 'Add'}
	            </button>
	            {addMapError && <div style={{ color: 'red', marginLeft: '10px' }}>{addMapError}</div>}
            </span>
            
            <br/>
            <br/>
            
            <input
                style={{ width: '40%', padding: '8px', borderRadius: '15px', transform: 'translate(-10%, 0%)' }}
                type="text"
                placeholder="Search Map ID..."
                value={searchTerm}
                onChange={handleSearchTermChange}
            />
            
            <span>
	            <button onClick={handleAddMap} disabled={addingMap} style={{ padding: '8px 15px', width: '10%', cursor: 'pointer', transform: 'translate(-20%, 0%)'}}>
	                {addingMap ? 'Adding...' : 'Search'}
	            </button>
	            {addMapError && <div style={{ color: 'red', marginLeft: '10px' }}>{addMapError}</div>}
            </span>

                
                <br />
                <br />
                <MapIdList mapIds={filteredMapIds} onRemoveMap={handleRemoveMap} />
        </div>
    );
}

export default AdminPage;
