import { useEffect, useState, useRef } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import kirboImg from './assets/Kirbo.png'


function App() {
    // Define states for setting markers on the map
    const [markers, setMarkers] = useState([]);
    const [reviews, setReviews] = useState([]);
    
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

    // Initialize the map and set its view 
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

        //Popup form 
        const popupContent = `
          <div style="text-align:center;">
            <b>${message}</b><br>${city || "Unknown"}, ${state || ""}<br><br>
            <h4>Add Review</h4>
            <div id="stars" style="font-size:20px; cursor:pointer;">★★★★★</div>
            <textarea id="reviewText" rows="3" style="width:100%; margin-top:6px;" placeholder="Write something..."></textarea>
            <button id="saveReview" style="margin-top:8px;">Save</button>
          </div>
        `;

        //Creates a variable storing the latitude and logitude of the location
        const marker = L.marker([lat, lng], { icon: kirboIcon });

        marker.addTo(markerGroupRef.current)  // Add marker to the group
          .bindPopup(popupContent)
          .openPopup();  // Open popup immediately
        
        marker.on('popupopen', () => {
          const starEl = document.getElementById('stars');
          const saveBtn = document.getElementById('saveReview');
          const textBox = document.getElementById('reviewText');

          let rating = 0;

          // Handle star clicks
          if (starEl){
            starEl.addEventListener('click', (ev) => {
              const index = Math.floor(ev.offsetX / 20); //rough click index
              rating = index + 1; 
              starEl.innerHTML = '★★★★★' 
                .split('')
                .map((star, i) => `<span style="color:${i < rating ? 'gold' : '#ccc'};">★</span>`)
                .join('');
            })
          }

           // Handle save
        if (saveBtn) {
          saveBtn.addEventListener('click', () => {
            const reviewText = textBox.value.trim();
            if (!rating) {
              alert('Please rate 1–5 stars');
              return;
            }

            // update React state
            const newMarker = {
              id: Date.now(),
              lat,
              lng,
              message,
              city,
              state,
              rating,
              reviewText,
            };
            setReviews((prev) => [...prev, newMarker]);

            marker.bindPopup(`
              <b>⭐ ${rating}/5</b><br>${reviewText || 'No comment.'}
            `);
          });
        }
      })

        //Add to React state
        setMarkers(prev => [...prev, { id: Date.now(), message, city, state, lat: e.latlng.lat, lng: e.latlng.lng}]);
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

    // --- helper: fetch city & state from coordinates ---
  async function fetchCityState(lat, lng) {
    try {
      const res = await fetch(
        `/nominatim/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "KirboMapDemo/1.0 (your_email@example.com)",
            "Accept-Language": "en",
          },
        }
      );
      const data = await res.json();
      return {
        city: data.address.city || data.address.town || data.address.village,
        state: data.address.state,
      };
    } catch {
      return { city: "", state: "" };
    }
  }

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
    <div style={{display: "flex", textAlign: "center"}}>
      {/* Left: map */}
      <div style={{ flex: 3, padding: "10px" }}>
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
          <div style={{ flex: 3, padding: "10px" }}>
            {/* Return the display of the map with its height and width */}
            <div id="map" style={{height: "500px", width: "100%"}}></div>
          </div>
      </div>

      <div
        style={{
          flex: 2,
          padding: "10px",
          borderLeft: "2px solid #ccc",
          backgroundColor: "#f9f9f9",
        }}
      >
        {/* Marker List */}
        {reviews.length === 0 ? (
          <p>No saved reviews yet... click on the map!</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {reviews.map((r) => (
              <li key={r.id}>
                <b>{r.message}</b>
                <br />
                {r.city}, {r.state}
                <br />
                ⭐ {r.rating}/5
                <br />
                <i>{r.reviewText || "No review text"}</i>
              </li>
            ))}
          </ul>
        )}
          
        </div>
      </div>
    
  );
}


export default App;
