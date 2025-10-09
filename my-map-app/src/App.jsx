import { useEffect } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
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
  useEffect(()=> {
    //const [count, setCount] = useState(0)

    // Wait until the component has mounted
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return; // prevent Leaflet from running too early

    // const defaultIcon = L.Icon.Default.mergeOptions({
    //   iconRetinaUrl: markerIcon2x,
    //   iconUrl: markerIcon,
    //   shadowUrl: markerShadow,
    // });


    {/* Initialize the map and set its view */}
    var map = L.map('map').setView([51.505, -0.09], 13);

    // Initalize the marker
    var marker = L.marker([51.5, -0.09]).addTo(map);

    var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

 function onMapClick(e){
    alert("You clicked the map at " + e.latlng);
  }

  map.on('click', onMapClick);

    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Marker
    marker.bindPopup("Hello from London!").openPopup();

    circle.bindPopup("I am a circle.");

    // Cleanup when component unmounts (important for hot reloads)
    return () => {
      map.remove();
    };
  }, []);


  return (
    <div>
      <h1>Here is ze map</h1>
      <div id="map" style={{height: "400px", width: "100%"}}></div>
    </div>
  );
}



export default App
