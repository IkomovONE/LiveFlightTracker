import './MapView.css';
import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import FloatingMenu from './FloatingMenu';
import WingPathLogo from './WingPathLogoSimple.svg';
import L from 'leaflet';
import airplaneIconImg from './assets/plane.png';
import airplaneClusterIconImg from './assets/planeCluster.png'; // adjust path as needed
import MarkerClusterGroup from 'react-leaflet-markercluster';


const airplaneIcon = new L.Icon({
  iconUrl: airplaneIconImg,
  iconSize: [24, 24], // adjust size as needed
  iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -20], // point from which the popup should open relative to the iconAnchor
});

const RotatedIcon = (angle, isDark) =>
  new L.DivIcon({
    className: isDark ? 'invert-icon' : '',
    html: `<img src="${airplaneIconImg}" style="width:24px; height:24px; transform: rotate(${angle}deg);" />`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

// Custom hook to get current zoom




function MapView() {
  const [selectedMap, setSelectedMap] = useState('CartoVoyager');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [trafficType, setTrafficType] = useState('plane'); // 'plane' or 'ship'

  const toggleMenu = () => {
    if (!menuOpen) {
      setMenuOpen(true);
      setTimeout(() => setFadeIn(true), 10); // allow DOM to render before animating
    } else {
      setFadeIn(false); // start fade-out (if you add it later)
      setTimeout(() => setMenuOpen(false), 300); // remove after fade-out duration
    }
  };

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const tileLayers = {
    OpenStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    CartoVoyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    CartoVoyagerDark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    EsriWorldImagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // Finland bounding box: lat 59.5–70.1, lng 20.0–31.6
  // Example: major airport coordinates (lat, lng)
const airports = [
  { name: "JFK", coords: [40.6413, -73.7781] }, // New York
  { name: "LHR", coords: [51.4700, -0.4543] },  // London
  { name: "CDG", coords: [49.0097, 2.5479] },   // Paris
  { name: "DXB", coords: [25.2532, 55.3657] },  // Dubai
  { name: "HND", coords: [35.5494, 139.7798] }, // Tokyo
  { name: "LAX", coords: [33.9416, -118.4085] },// Los Angeles
  { name: "SIN", coords: [1.3644, 103.9915] },  // Singapore
  { name: "SYD", coords: [-33.9399, 151.1753] } // Sydney
];

// Example: popular routes (pairs of airport indices)
const routes = [
  [0, 1], // JFK <-> LHR
  [1, 2], // LHR <-> CDG
  [0, 5], // JFK <-> LAX
  [3, 4], // DXB <-> HND
  [4, 6], // HND <-> SIN
  [6, 7], // SIN <-> SYD
  [2, 3], // CDG <-> DXB
  [5, 7], // LAX <-> SYD
];

// Generate N random markers along these routes
const NUM_MARKERS = 10000;
const randomMarkers = useMemo(() => {
  return Array.from({ length: NUM_MARKERS }, (_, i) => {
    // Pick a random route
    const [fromIdx, toIdx] = routes[Math.floor(Math.random() * routes.length)];
    const from = airports[fromIdx].coords;
    const to = airports[toIdx].coords;

    // Pick a random point along the route (linear interpolation)
    const t = Math.random();
    const lat = from[0] + (to[0] - from[0]) * t + (Math.random() - 0.5) * 1.5; // add a little scatter
    const lng = from[1] + (to[1] - from[1]) * t + (Math.random() - 0.5) * 1.5;

    return (
      <Marker
        key={i}
        position={[lat, lng]}
        icon={RotatedIcon(Math.random() * 360, selectedMap === 'CartoVoyagerDark')}
      >
        <Popup>
          Simulated Flight #{i + 1}<br />
          {airports[fromIdx].name} → {airports[toIdx].name}
        </Popup>
      </Marker>
    );
  });
  // Add selectedMap as a dependency so icons update when map changes
}, [selectedMap]);
  const createClusterCustomIcon = (cluster) => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <img src="${airplaneClusterIconImg}" style="width:32px; height:32px;"/>
        <span style="
          position: absolute;
          color: white;
          font-weight: bold;
          font-size: 14px;
          left: 0; right: 0; top: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          text-shadow: 0 0 4px #222;
        ">${cluster.getChildCount()}</span>
      </div>
    `,
    className: '', 
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

  return (
    <div className="map-wrapper">
      {/* Floating Hamburger Button */}
      

      {/* Floating TopBar as Menu */}
      

      {/* Map Controls (Search + Select Map) */}

      <button className={`hamburger ${menuOpen ? 'expanded' : ''}`} onClick={toggleMenu}>

        
        
        <img id= "hamlogo" src={WingPathLogo} alt="Logo"/> 

        <span className='arrow'>↓</span>
        
        
        
      </button>
        {menuOpen && (
        <FloatingMenu className={fadeIn ? 'fade-in' : ''} />
        
        
      )}
      <div className="map-controls">
        
        <input
          type="text"
          placeholder="Search flights..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>

        
      </div>


      <div className="mapSelector">

        <label htmlFor="mapSelect">Select Map:</label>

        <select
          onChange={(e) => setSelectedMap(e.target.value)}
          value={selectedMap}
        >
          {Object.keys(tileLayers).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>



      </div>

     


     

      <div className="animated-toggle">
  <input
    type="checkbox"
    id="traffic-toggle"
    checked={trafficType === 'ship'}
    onChange={() => setTrafficType(trafficType === 'plane' ? 'ship' : 'plane')}
  />
  <label htmlFor="traffic-toggle">
    <span className="emoji plane">✈️</span>
    <span className="toggle-bg"></span>
    <span className="toggle-slider"></span>
    <span className="emoji ship">🚢</span>
  </label>
</div>

      {/* The Map */}
      <MapContainer
        center={[60.1695, 24.9354]}
        zoom={6}
        minZoom={2} // <-- Add this line (adjust as needed)
        zoomControl={false}
        style={{ height: '100vh', width: '100vw' }}
        maxBounds={[[-85, -180], [85, 180]]} // Prevents panning outside the world
        maxBoundsViscosity={1.0} // Makes the bounds strict
      >
        <TileLayer
          url={tileLayers[selectedMap]}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl className="leaflet-control-zoom" position="bottomleft" />
        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          <Marker position={[60.1695, 24.9354]} icon={airplaneIcon}>
            <Popup>Helsinki</Popup>
          </Marker>
          {randomMarkers}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default MapView;