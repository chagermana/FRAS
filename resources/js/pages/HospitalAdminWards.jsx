import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HospitalAdminWards() {
    const [wards, setWards] = useState([]);
    const [newWardName, setNewWardName] = useState('');
    const [message, setMessage] = useState('');

    // Fetch wards belonging to this admin's hospital
    useEffect(() => {
        axios.get('/api/wards')
            .then(response => setWards(response.data))
            .catch(error => console.error("Error fetching wards:", error));
    }, []);

    // Handle creating a new ward
    const handleCreateWard = (e) => {
        e.preventDefault();
        axios.post('/api/wards', { name: newWardName })
            .then(response => {
                setWards([...wards, response.data.data]);
                setNewWardName('');
                setMessage('Ward created successfully!');
            })
            .catch(error => {
                console.error("Error creating ward:", error);
                setMessage('Failed to create ward.');
            });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Manage Hospital Wards</h2>
            
            {message && <p className="mb-4 text-blue-600">{message}</p>}

            {/* Creation Form */}
            <form onSubmit={handleCreateWard} className="mb-6 flex gap-2">
                <input 
                    type="text" 
                    value={newWardName}
                    onChange={(e) => setNewWardName(e.target.value)}
                    placeholder="e.g., Maternity, Pediatrics" 
                    className="border p-2 rounded w-64"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add New Ward
                </button>
            </form>

            {/* Wards List */}
            <h3 className="text-xl font-semibold mb-2">Active Wards</h3>
            <ul className="border rounded divide-y">
                {wards.length === 0 ? (
                    <p className="p-4 text-gray-500">No wards created yet.</p>
                ) : (
                    wards.map(ward => (
                        <li key={ward.id} className="p-3 flex justify-between items-center bg-gray-50">
                            <span className="font-medium">{ward.name}</span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">ID: {ward.id}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
