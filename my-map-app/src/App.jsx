import { useEffect, useState, useRef } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import kirboImg from './assets/Kirbo.png'

// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';



// function MyButton(){
//   return(
//     <button>
//       I'm a button
//     </button>
//     );
// }

function App() {
    // Define states for setting markers on the map
    const [markers, setMarkers] = useState([]);
    const mapRef = useRef(null); // store map reference
    const markerGroupRef = useRef(null); // store marker group reference
    const currentLayerRef = useRef(null);

        // Adds the map to the website display
    const streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    });

    useEffect(()=> {

      // Wait until the component has mounted
      const mapContainer = document.getElementById("map");
      
      // Tracks if the mapContainer has been recieved first
      if (!mapContainer){ 
        return; // prevent Leaflet from running too early
      }

    //   L.Icon.Default.mergeOptions({
    //      iconRetinaUrl: markerIcon2x,
    //      iconUrl: markerIcon,
    //      shadowUrl: markerShadow,
    //  });


    {/* Initialize the map and set its view */}
    var map = L.map('map').setView([43.3623, -71.4613], 13);
    mapRef.current = map;
    streetLayer.addTo(mapRef.current); // start with street layer
    currentLayerRef.current = streetLayer;

    // Stores the variable for an icon used when the user clicks on the map
    const kirboIcon = L.icon({
        iconUrl: kirboImg, // place in /public or import from assets
        iconSize: [40, 40], // Defines the size of the icon
        iconAnchor: [20, 40], // Defines the anchor of the icon
    });

    // create a marker layer group (easy to clear later)
    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    // Map click popup
    //const popup = L.popup();
    map.on('click',async (e) => {

      // Stores the message for the prompt window in a variable 
      const message = window.prompt("Favorite Recreational Area:");

      // If the user cancels or leaves the prompt empty
      if(!message){
        // Return a null value
        return;
      }

      //Creates the  state variables with the latitude and logitude
      const {lat, lng} = e.latlng;

      // Fetch city and state data from OpenStreetMap API
      try{
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await res.json();

        const city = data.address.city || data.address.town || data.address.village || "Unknown City";
        const state = data.address.state || "Unknown State";

        //Creates a variable storing the latitude and logitude of the location
        const marker = L.marker([lat, lng], { icon: kirboIcon })
          .bindPopup(`<b>${message}</b><br>${city}, ${state}`)
          .addTo(markerGroupRef.current);  // ✅ add to the layer group, NOT the map

        //Add to React state
        setMarkers(prev => [...prev, { message, city, state, lat: e.latlng.lat, lng: e.latlng.lng}]);
      }
      catch(err){
        console.error("Error fetching location:", err);
        alert("Could not get city/state info. Try again later.");
      }
    });

    //Marker
    return () => {
      map.remove();
    };
  }, []);

  // Reset handler
  const handleReset = () => {
    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers(); // removes all markers from map
    }
    setMarkers([]); // clears list
  };

  const switchToStreet = () => {
    if (mapRef.current && currentLayerRef.current !== streetLayer) {
      mapRef.current.removeLayer(currentLayerRef.current);
      streetLayer.addTo(mapRef.current);
      currentLayerRef.current = streetLayer;
    }
  };

  const switchToSatellite = () => {
    if (mapRef.current && currentLayerRef.current !== satelliteLayer) {
      mapRef.current.removeLayer(currentLayerRef.current);
      satelliteLayer.addTo(mapRef.current);
      currentLayerRef.current = satelliteLayer;
    }
  };

  return (
    <div style={{textAlign: "center"}}>
      {/* Header for the website with a type of h1 */}
      <h1>Here is ze map</h1>

      <div id="buttons">
        <button
            onClick={switchToStreet}
            style={{
            background: "#8f00a1ff",
            border: "none",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          Street View
        </button>
        <button
            onClick={switchToSatellite}
            style={{
            background: "#009f08ff",
            border: "none",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          Satellite View
        </button>

        <button
          onClick={handleReset}
          style={{
            background: "#ff4d4d",
            border: "none",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          🔄 Reset Markers
        </button>
      </div>
      

      {/* Leave this space for display the list of locations */}
      <div style={{display: "flex", justifyContent: "center", gap: "2rem"}}>
        {/* Return the display of the map with its height and width */}
        <div id="map" style={{height: "400px", width: "100%"}}></div>

        {/* Marker List */}
        <div style={{textAlign: "left"}}>
          <h3> Favorite Recreational Locale </h3>
          {markers.length === 0 ? (
            <p>No saved location yet... click on the map!</p>
          ) : (
            <ul>
              {markers.map((m, i) => (
                <li key={i}>
                  <b>{m.message}</b><br></br>{m.city}, {m.state}, {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </li>
              ))}
            </ul>
            )}
          
        </div>
      </div>
    </div>
  );
}


export default App;
