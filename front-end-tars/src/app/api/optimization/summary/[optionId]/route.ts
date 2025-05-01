import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { optionId: string } }
) {
  try {
    // Get the option ID from the URL params
    const { optionId } = params;
    
    // Get the external API endpoint from environment variables
    // Fall back to the specific URL if not defined
    const externalApiEndpoint = process.env.EXTERNAL_API_ENDPOINT || 'http://13.82.95.209/api/optimization';
    
    // Forward the request to the external API
    const response = await fetch(`${externalApiEndpoint}/summary/${optionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the response from the external API
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error in summary API proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data from external API' },
      { status: 500 }
    );
  }
} 