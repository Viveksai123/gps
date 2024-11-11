// src/MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const MapComponent = () => {
  const [position, setPosition] = useState([0, 0]); // Default position
  const [path, setPath] = useState([]);             // Array to store path coordinates
  const [time, setTime] = useState(new Date());

  // Fetch GPS data periodically
  useEffect(() => {
    const fetchData = () => {
      axios.get('https://json-production-4a9d.up.railway.app/records')
        .then(response => {
          const data = response.data;
          console.log("API Data:", data);

          if (data.length > 0) {
            // Get the latest GPS record (last item in the array)
            const latestRecord = data[data.length - 1];
            const newPosition = [latestRecord.latitude, latestRecord.longitude];

            // Update the position and path if there's a new point
            if (newPosition[0] !== position[0] || newPosition[1] !== position[1]) {
              setPosition(newPosition);
              setPath(prevPath => [...prevPath, newPosition]); // Add new position to the path
            }
          } else {
            console.error("No GPS data found in response.");
          }
        })
        .catch(error => console.error("Error fetching GPS data:", error));
    };

    // Fetch data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [position]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Current Location</h2>
      <p>Time: {time.toLocaleTimeString()}</p>
      <MapContainer center={position} zoom={18} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            Latitude: {(position[0] || 0).toFixed(6)}, Longitude: {(position[1] || 0).toFixed(6)}
          </Popup>
        </Marker>

        {/* Render a blue polyline for the path */}
        <Polyline positions={path} color="blue" />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
