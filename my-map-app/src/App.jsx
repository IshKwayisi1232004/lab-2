import { useEffect, useState } from 'react'
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

    // Stores the variable for an icon used when the user clicks on the map
    const kirboIcon = L.icon({
        iconUrl: kirboImg, // place in /public or import from assets
        iconSize: [40, 40], // Defines the size of the icon
        iconAnchor: [20, 40], // Defines the anchor of the icon
    });


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

      

        //Adds an icon to the map when the user clicks on it
        //L.marker(e.latlng, { icon: kirboIcon }).addTo(map);

        //Creates a variable storing the latitude and logitude of the location
        const marker = L.marker([lat, lng], { icon: kirboIcon }).addTo(map);

        // Display a popup message when the map has been clicked
        marker.bindPopup(`<b>$[marker]</b><br>${city}, ${state}, ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();

        //Add to React state
        setMarkers(prev => [...prev, { marker, city, state, lat: e.latlng.lat, lng: e.latlng.lng}]);
      }
      catch(err){
        console.error("Error fetching location:", err);
        alert("Could not get city/state info. Try again later.");
      }
    });
  
    
    // Adds the map to the website display
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Marker
    return () => {
      map.remove();
    };
  }, []);


  return (
    <div style={{textAlign: "center"}}>
      {/* Header for the website with a type of h1 */}
      <h1>Here is ze map</h1>

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
                  <b>{m.label}</b> - {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
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
