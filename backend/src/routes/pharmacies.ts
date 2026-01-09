import { Router, Request, Response } from 'express';
import firebaseService from '../services/firebase';
import scraperService from '../services/scraper';
import { NearestPharmacyRequest, Pharmacy } from '../types';

const router = Router();

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// GET /api/pharmacies - Get all open pharmacies today
router.get('/', async (req: Request, res: Response) => {
  try {
    const pharmacies = await firebaseService.getOpenPharmacies();
    
    res.json({
      success: true,
      data: {
        pharmacies,
        count: pharmacies.length,
        updatedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/pharmacies/all - Get all pharmacies (including closed)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const pharmacies = await firebaseService.getAllPharmacies();
    
    res.json({
      success: true,
      data: {
        pharmacies,
        count: pharmacies.length,
        updatedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error fetching all pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/pharmacies/:id - Get pharmacy by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pharmacy = await firebaseService.getPharmacyById(id);

    if (!pharmacy) {
      res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
      return;
    }

    res.json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/pharmacies/nearest - Find nearest pharmacy
router.post('/nearest', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude }: NearestPharmacyRequest = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
      return;
    }

    const pharmacies = await firebaseService.getOpenPharmacies();

    if (pharmacies.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No open pharmacies found',
      });
      return;
    }

    // Filter pharmacies with valid coordinates
    const pharmaciesWithCoords = pharmacies.filter(
      (p) => p.latitude !== undefined && p.longitude !== undefined
    );

    if (pharmaciesWithCoords.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No pharmacies with location data found',
      });
      return;
    }

    // Calculate distances and find nearest
    let nearestPharmacy: Pharmacy | null = null;
    let minDistance = Infinity;

    pharmaciesWithCoords.forEach((pharmacy) => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          pharmacy.latitude,
          pharmacy.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestPharmacy = pharmacy;
        }
      }
    });

    if (!nearestPharmacy) {
      res.status(404).json({
        success: false,
        message: 'Could not find nearest pharmacy',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        pharmacy: nearestPharmacy,
        distance: Math.round(minDistance * 1000) / 1000, // Round to 3 decimal places
      },
    });
  } catch (error) {
    console.error('Error finding nearest pharmacy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearest pharmacy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/pharmacies/scrape - Manually trigger scraping
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    console.log('📥 Manual scrape triggered');
    const result = await scraperService.scrapeAndSave();

    res.json({
      success: result.success,
      data: {
        count: result.count,
        message: result.message,
      },
    });
  } catch (error) {
    console.error('Error during manual scrape:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape pharmacies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
