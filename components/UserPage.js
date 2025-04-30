import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import axios from 'axios';

function UserPage() {
  	const [searchTerm, setSearchTerm] = useState('');
    const [filteredMapIds, setFilteredMapIds] = useState([]);
    const [mapIds, setMapIds] = useState([]);

    useEffect(() => {
        const fetchMapIds = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/map-ids');
                const data = response.data;
                setMapIds(data);
                setFilteredMapIds(data);
            } catch (e) {
                console.error('Error fetching map IDs:', e);
            } finally {
            	console.error('Error fetching map IDs:');
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

    function MapIdList({ mapIds, onRemoveMap }: { mapIds: number[]; }) {
        const buttonStyle = {
            padding: '10px 20px',
            margin: '5px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f0f0f0',
            cursor: 'pointer',
            textAlign: 'center',
            position: 'relative',
            width: '60%',
            textDecoration: 'none'
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '0 auto' }}>
                {mapIds.map((mapId, index) => (
                    <Link to={`/view/${mapId}`} style={buttonStyle} key={index}>
                        <a>{mapId}</a>
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div style={{ position: 'absolute', top: '35px', right: '20px', left: '20px', bottom: '20px'}}>
            <br />
            <h2>Our Maps</h2>
            <br />
                <div style={{width: '60%', left: '20%', position: 'absolute'}}>
                    <div style={{ width: '40%' }}>
                        <input
                            style={{ width: '100%', padding: '8px' }}
                            type="text"
                            placeholder="Search Map ID..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                        />
                    </div>
                </div>
                <br />
                <br />
                <MapIdList mapIds={filteredMapIds} />
            </div>
    );
}

export default UserPage;
