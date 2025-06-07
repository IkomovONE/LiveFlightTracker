import './MapView.css';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import FloatingMenu from './FloatingMenu';
import WingPathLogo from './WingPathLogo.svg';

function MapView() {
  const [selectedMap, setSelectedMap] = useState('OpenStreetMap');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

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

      {/* The Map */}
      <MapContainer center={[60.1695, 24.9354]} zoom={6} zoomControl={false} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          url={tileLayers[selectedMap]}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl className="leaflet-control-zoom" position="bottomleft" />
        <Marker position={[60.1695, 24.9354]}>
          <Popup>Helsinki</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MapView;