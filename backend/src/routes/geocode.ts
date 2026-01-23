import axios from 'axios';
import {Router} from 'express';
import dotenv from 'dotenv';    

dotenv.config();

const router = Router();

router.get("/", async (req, res) => {
    console.log("Geocode route called");
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;

    try{
        // const response = await fetch(url);
        // const data = await response.json();

        const response = await axios.get(url);
        const place = response.data.features[0]?.place_name || "Unknown location";
        res.json({ address: place });
        
    }catch(error){
        console.error("Error fetching geocode data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;