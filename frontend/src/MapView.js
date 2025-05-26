import './MapView.css'
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';




function MapView() {

  const ref = useRef(null);

  const isInView = useInView(ref, { amount: 0.3, once: true });


  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // You can trigger a map pan or fetch logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="MapView" >



      {/* 

      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >


      <hr style={{ border: 'none', borderTop: '3px solid rgba(116, 223, 255, 0.678)', marginTop: '50px', width: '70%', marginLeft: '35px'}} />



      <h1 className="mapTitle">MapView!
      </h1>

      
      
      
      
      
      
      
      
      
      
      
      
      <button className='MapBigButtons'><Link to='/map'> {'>'} The Flights Map</Link></button>

      <span>|</span>


      <button className='MapBigButtons'><Link to='/search'> {'>'} Search</Link></button>

      <span>|</span>

      <button className='MapBigButtons'><Link to='/cfs'> {'>'} Commercial Flight Schedule</Link></button>


      </motion.div>


      */}


      <MapContainer  center={[60.1695, 24.9354]} zoom={6} style={{ zIndex: '500', height: '90vh', width: '100%', marginTop: '0cm'}}>
      

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

       <div className='SearchField' >
        <input
          type="text"
          placeholder="Search flights..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '5px', marginRight: '8px' }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <Marker position={[60.1695, 24.9354]}>
        <Popup>Helsinki</Popup>
      </Marker>


    </MapContainer>


      

{/* 

<motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
<h2>Need to track a flight?</h2>

</motion.div>


<motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ delay: 1, duration: 0.6, ease: 'easeOut' }}
      >

<p ref={ref}>Whether you're picking someone up from the airport or just love watching the skies, FlightTracker gives you real-time access to flights across the globe. Search by airline, route, or flight number, and get instant updates on departure, arrival, delays, and more—all from a sleek, easy-to-use interface. Your window to the skies starts here.</p>

</motion.div>


*/}




      
        
        
      
    </div>
  );
}

export default MapView;
