import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'


function App() {
  useEffect(()=> {
   // const [count, setCount] = useState(0)

    // Wait until the component has mounted
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return; // prevent Leaflet from running too early

    {/* Initialize the map and set its view */}
    var map = L.map('map').setView([51.505, -0.09], 13);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Test marker
    L.marker([51.505, -0.09]).addTo(map).bindPopup("Hello from London!").openPopup();

    // Cleanup when component unmounts (important for hot reloads)
    return () => {
      map.remove();
    };
  }, []);

  return (
    <>
      <div>

      <div id="map" style={{height: "100vh", width: "100%"}}></div>
    </>
  );
}



export default App
