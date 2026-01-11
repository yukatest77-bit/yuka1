import { NextRequest, NextResponse } from 'next/server';
import firebaseService from '@/app/lib/firebase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pharmacy = await firebaseService.getPharmacyById(id);

        if (!pharmacy) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Pharmacy not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: pharmacy,
        });
    } catch (error) {
        console.error('Error fetching pharmacy:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch pharmacy',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
