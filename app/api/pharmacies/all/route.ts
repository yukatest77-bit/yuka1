import { NextResponse } from 'next/server';
import firebaseService from '@/app/lib/firebase';

export async function GET() {
    try {
        const pharmacies = await firebaseService.getAllPharmacies();

        return NextResponse.json({
            success: true,
            data: {
                pharmacies,
                count: pharmacies.length,
                updatedAt: Date.now(),
            },
        });
    } catch (error) {
        console.error('Error fetching all pharmacies:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch pharmacies',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
