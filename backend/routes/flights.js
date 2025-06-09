import express from 'express';
import fs from 'fs/promises';
import path from 'path';
const router = express.Router();

let canFetch = true; // Global toggle

/* GET users listing. */
router.get('/', function(req, res) {
  res.json({ status: 'Online' });
});

router.get('/all', async function(req, res) {
  const url = 'https://aircraft-adsb-data.p.rapidapi.com/points_in_box/latest/?longitude1=-10&latitude1=40&longitude2=30&latitude2=70';

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '4ba4ef7dacmshfe88074515ac813p1f6026jsna568043b4fb4',
      'x-rapidapi-host': 'aircraft-adsb-data.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching ADS-B data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get('/test', async function(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'routes', 'fetch.json');
    const data = await fs.readFile(filePath, 'utf8');
    const flights = JSON.parse(data);

    // Map to { latitude, longitude, callsign }
    const coords = flights.map(f =>
      f.geo_point
        ? {
            latitude: f.geo_point.latitude,
            longitude: f.geo_point.longitude,
            callsign: f.callsign || 'N/A',
            track: f.track || 0
          }
        : null
    ).filter(Boolean);

    res.json(coords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read coordinates from file' });
  }
});

router.get('/info/:callsign', async function(req, res) {
  const callsign = req.params.callsign;
  const url = `https://aerodatabox.p.rapidapi.com/flights/number/${callsign}?withAircraftImage=false&withLocation=false`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '4ba4ef7dacmshfe88074515ac813p1f6026jsna568043b4fb4',
      'x-rapidapi-host': 'aerodatabox.p.rapidapi.com'
    }
  };

  try {
    // Fetch flight info
    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${text}`);
    }
    const data = await response.json();

    // Get registration number from response
    let reg = null;
    if (Array.isArray(data) && data[0]?.aircraft?.reg) {
      reg = data[0].aircraft.reg;
    } else if (data?.aircraft?.reg) {
      reg = data.aircraft.reg;
    }

    let imageUrl = null;
    let imageLink = null;
    if (reg) {
      // Fetch image from Planespotters
      const imgRes = await fetch(`https://api.planespotters.net/pub/photos/reg/${reg}`);
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        if (imgData.photos && imgData.photos.length > 0) {
          imageUrl = imgData.photos[0].thumbnail_large?.src || imgData.photos[0].thumbnail?.src;
          imageLink = imgData.photos[0].link;
        }
      }
    }

    // Attach image URL to the response
    let enrichedData = Array.isArray(data) ? { ...data[0] } : { ...data };
    enrichedData.imageUrl = imageUrl;
    enrichedData.imageLink = imageLink;

    res.json(enrichedData);
  } catch (error) {
    console.error('Error fetching AeroDataBox info:', error);
    res.status(500).json({ error: 'Failed to fetch aircraft info', details: error.message });
  }
});

// Helper: Merge new aircrafts into file data by callsign
function mergeAircrafts(existing, incoming) {
  const byCallsign = {};
  for (const ac of existing) {
    if (ac.callsign) byCallsign[ac.callsign] = ac;
  }
  for (const ac of incoming) {
    if (ac.callsign) {
      byCallsign[ac.callsign] = ac;
    }
  }
  // Return as array
  return Object.values(byCallsign);
}

// POST /api/flights/box
router.post('/box', async function(req, res) {
  const { sw, ne } = req.body; // { sw: { lat, lng }, ne: { lat, lng } }
  if (!sw || !ne) {
    return res.status(400).json({ error: 'Missing bounding box coordinates' });
  }

  const url = `https://aircraft-adsb-data.p.rapidapi.com/points_in_box/latest/?longitude1=${sw.lng}&latitude1=${sw.lat}&longitude2=${ne.lng}&latitude2=${ne.lat}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '4ba4ef7dacmshfe88074515ac813p1f6026jsna568043b4fb4',
      'x-rapidapi-host': 'aircraft-adsb-data.p.rapidapi.com'
    }
  };

  const filePath = path.join(process.cwd(), 'routes', 'fetch.json');
  let fileData = [];
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    fileData = JSON.parse(fileContent);
  } catch (e) {
    // File may not exist yet, that's fine
    fileData = [];
  }

  if (!canFetch) {
    // Just return current file data
    console.log("Returning cached data, fetch is disabled");
    console.log(canFetch)
    return res.json(fileData);
  }

  console.log("Fetching new data from API...");

  console.log(canFetch)

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${text}`);
    }
    const newData = await response.json();

    // Merge new aircrafts into file data by callsign
    const merged = mergeAircrafts(fileData, newData);

    // Save merged data to file
    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf8');

    // Set toggle off and reset after 2 minutes
    canFetch = false;
    setTimeout(() => { canFetch = true; }, 20 * 1000);

    res.json(merged);
  } catch (error) {
    console.error('Error fetching ADS-B data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

export default router;
