import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Assuming you have a server-side Supabase client utility
import { Plan } from '@/lib/services/subscriptionService'; // Re-using the basic type

export async function GET() {
  try {
    const supabase = createClient(); // Creates a Supabase client for Route Handlers

    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly_eur', { ascending: true }); // Order by price for consistent display

    if (error) {
      console.error('Error fetching plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plans', details: error.message },
        { status: 500 }
      );
    }

    // Optionally, filter out sensitive data if any, though stripe_price_id might be needed by client for checkout
    // For now, returning all fields as per Plan interface and RLS policy.
    return NextResponse.json(plans as Plan[]);

  } catch (e: any) {
    console.error('Unexpected error in GET /api/plans:', e);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: e.message },
      { status: 500 }
    );
  }
} 