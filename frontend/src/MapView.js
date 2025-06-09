import './MapView.css';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
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
  const [trafficType, setTrafficType] = useState('all');
  const [aircrafts, setAircrafts] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState({});
  const [loadingInfo, setLoadingInfo] = useState(null);
  const [selectedAircraftIdx, setSelectedAircraftIdx] = useState(null);
  const [lastBox, setLastBox] = useState(null);
  const [canFetch, setCanFetch] = useState(true);
  const mapRef = useRef();

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



  const handleMarkerClick = async (callsign, idx) => {
    setSelectedAircraftIdx(idx);
    setLoadingInfo(idx);
    try {
      const res = await fetch(`http://localhost:8000/api/flights/info/${callsign}`);
      const data = await res.json();
      setSelectedInfo(prev => ({ ...prev, [idx]: data }));
    } catch (err) {
      setSelectedInfo(prev => ({ ...prev, [idx]: { error: 'Failed to fetch info' } }));
    } finally {
      setLoadingInfo(null);
    }
  };

  // Example POST request from frontend
  const fetchAircraftsInBox = async (sw, ne) => {
    const res = await fetch('http://localhost:8000/api/flights/box', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sw, ne })
    });
    const data = await res.json();
    console.log('Aircrafts from /api/flights/box:', data); // <-- log here
    return data;
  };

  const handleFetchBox = useCallback(async (sw, ne) => {
    if (!canFetch) return;
    setCanFetch(false);

    try {
      const data = await fetchAircraftsInBox(sw, ne);
      // Map geo_point to latitude/longitude if needed
      const mapped = data.map(f => ({
        ...f,
        latitude: f.latitude ?? f.geo_point?.latitude,
        longitude: f.longitude ?? f.geo_point?.longitude,
      }));
      setAircrafts(mapped);
    } catch (err) {
      console.error('Failed to fetch aircrafts in box:', err);
    } finally {
      setTimeout(() => setCanFetch(true), 10000); // 10 seconds
    }
  }, [canFetch, fetchAircraftsInBox]);

  function MapEventHandler({ onFetch }) {
    useMapEvents({
      moveend: (e) => {
        const map = e.target;
        const zoom = map.getZoom();
        if (zoom >= 3) {
          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          onFetch(
            { lat: sw.lat, lng: sw.lng },
            { lat: ne.lat, lng: ne.lng }
          );
        }
      },
      zoomend: (e) => {
        const map = e.target;
        const zoom = map.getZoom();
        if (zoom >= 3) {
          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          onFetch(
            { lat: sw.lat, lng: sw.lng },
            { lat: ne.lat, lng: ne.lng }
          );
        }
      }
    });
    return null;
  }

  // Initial fetch on mount if zoom >= 3
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    if (zoom >= 3) {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      handleFetchBox(
        { lat: sw.lat, lng: sw.lng },
        { lat: ne.lat, lng: ne.lng }
      );
    }
    // Only run once on mount
    // eslint-disable-next-line
  }, []);

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
    type="radio"
    id="traffic-all"
    name="traffic-toggle"
    checked={trafficType === 'all'}
    onChange={() => setTrafficType('all')}
  />
  <input
    type="radio"
    id="traffic-plane"
    name="traffic-toggle"
    checked={trafficType === 'plane'}
    onChange={() => setTrafficType('plane')}
  />
  <input
    type="radio"
    id="traffic-ship"
    name="traffic-toggle"
    checked={trafficType === 'ship'}
    onChange={() => setTrafficType('ship')}
  />
  <label htmlFor="traffic-all" className="toggle-label all">All</label>
  <label htmlFor="traffic-plane" className="toggle-label plane">✈️</label>
  <label htmlFor="traffic-ship" className="toggle-label ship">🚢</label>
  <span className="toggle-bg"></span>
  <span className={`toggle-slider ${trafficType}`}></span>
</div>

      {/* The Map */}
      <MapContainer
        ref={mapRef}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        center={[60.1695, 24.9354]}
        zoom={6}
        minZoom={2}
        zoomControl={false}
        style={{ height: '100vh', width: '100vw' }}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <MapEventHandler onFetch={handleFetchBox} />
        <TileLayer
          url={tileLayers[selectedMap]}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl className="leaflet-control-zoom" position="bottomleft" />
        <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
          {aircrafts
            .filter(plane =>
              typeof plane.latitude === 'number' &&
              typeof plane.longitude === 'number' &&
              !isNaN(plane.latitude) &&
              !isNaN(plane.longitude)
            )
            .map((plane, idx) =>
              <Marker
                key={idx}
                position={[plane.latitude, plane.longitude]}
                icon={RotatedIcon(plane.track || 0, selectedMap === 'CartoVoyagerDark')}
                eventHandlers={{
                  click: () => handleMarkerClick(plane.callsign, idx)
                }}
              />
            )
          }
        </MarkerClusterGroup>
      </MapContainer>

      <div className="aircraft-info-bar">
  {selectedAircraftIdx !== null && selectedInfo[selectedAircraftIdx] && !selectedInfo[selectedAircraftIdx].error && (() => {
    const info = selectedInfo[selectedAircraftIdx];
    if (!info) return null;
    return (
      <div className="aircraft-info-content">
        {/* Aircraft image if available */}
        <div className="aircraft-info-img-placeholder">
          {info.imageUrl ? (
            <a href={info.imageLink} target="_blank" rel="noopener noreferrer">
              <img src={info.imageUrl} alt="Aircraft" style={{width: '80px', height: '60px', objectFit: 'cover', borderRadius: '10px'}} />
            </a>
          ) : (
            <span style={{color: '#aaa'}}>No image</span>
          )}
        </div>
        <div className="aircraft-info-main">
          <div className="aircraft-info-row">
            <span className="flight-number">{info.number || info.callSign}</span>
            <span className="airline">{info.airline?.name || ''}</span>
            <span className={`status status-${(info.status || '').toLowerCase()}`}>{info.status}</span>
          </div>
          <div className="aircraft-info-row">
            <span className="airport">
              <strong>{info.departure?.airport?.iata || info.departure?.airport?.icao}</strong>
              &nbsp;{info.departure?.airport?.municipalityName || info.departure?.airport?.name}
            </span>
            <span className="arrow">→</span>
            <span className="airport">
              <strong>{info.arrival?.airport?.iata || info.arrival?.airport?.icao}</strong>
              &nbsp;{info.arrival?.airport?.municipalityName || info.arrival?.airport?.name}
            </span>
          </div>
          <div className="aircraft-info-row times">
            <span>
              <strong>Dep:</strong> {info.departure?.scheduledTime?.local || info.departure?.scheduledTime?.utc}
            </span>
            <span>
              <strong>Arr:</strong> {info.arrival?.predictedTime?.local || info.arrival?.predictedTime?.utc}
            </span>
            <span>
              <strong>Aircraft:</strong> {info.aircraft?.model} ({info.aircraft?.reg})
            </span>
          </div>
        </div>
        <button className="close-btn" onClick={() => setSelectedAircraftIdx(null)}>×</button>
      </div>
    );
  })()}
  {selectedAircraftIdx !== null && loadingInfo === selectedAircraftIdx && (
    <div className="aircraft-info-content">Loading info...</div>
  )}
  {selectedAircraftIdx !== null && selectedInfo[selectedAircraftIdx]?.error && (
    <div className="aircraft-info-content" style={{color: 'red'}}>
      {selectedInfo[selectedAircraftIdx].error}
      <button className="close-btn" onClick={() => setSelectedAircraftIdx(null)}>×</button>
    </div>
  )}
</div>
    </div>
  );
}

export default MapView;