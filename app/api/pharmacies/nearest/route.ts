import { NextRequest, NextResponse } from 'next/server';
import firebaseService from '@/app/lib/firebase';
import { NearestPharmacyRequest, Pharmacy } from '@/app/lib/types';

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

export async function POST(request: NextRequest) {
    try {
        const body: NearestPharmacyRequest = await request.json();
        const { latitude, longitude } = body;

        if (!latitude || !longitude) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Latitude and longitude are required',
                },
                { status: 400 }
            );
        }

        const pharmacies = await firebaseService.getOpenPharmacies();

        if (pharmacies.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No open pharmacies found',
                },
                { status: 404 }
            );
        }

        // Filter pharmacies with valid coordinates
        const pharmaciesWithCoords = pharmacies.filter(
            (p) => p.latitude !== undefined && p.longitude !== undefined
        );

        if (pharmaciesWithCoords.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No pharmacies with location data found',
                },
                { status: 404 }
            );
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
            return NextResponse.json(
                {
                    success: false,
                    message: 'Could not find nearest pharmacy',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                pharmacy: nearestPharmacy,
                distance: Math.round(minDistance * 1000) / 1000, // Round to 3 decimal places
            },
        });
    } catch (error) {
        console.error('Error finding nearest pharmacy:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to find nearest pharmacy',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
