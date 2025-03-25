import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return new Response('Not available in production', { status: 403 });
    }

    const session = await auth();
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Import PDF utils dynamically
    const { fetchAndExtractPDFText } = await import('@/lib/ai/pdf-utils');
    
    // URL to the DC Probate Guide PDF
    const pdfUrl = "https://www.dccourts.gov/sites/default/files/pdf-forms/AfterDeathAGuideToProbateInTheDistrictOfColumbia.pdf";
    
    // Try to fetch the PDF
    console.log('Fetching PDF from:', pdfUrl);
    const pdfContent = await fetchAndExtractPDFText(pdfUrl);
    
    // Check if we got content
    const contentLength = pdfContent?.length || 0;
    const excerpt = pdfContent?.substring(0, 200) || '';
    
    return NextResponse.json({
      success: true,
      contentLength,
      excerpt: `${excerpt}...`,
      message: `Successfully retrieved PDF content (${contentLength} characters)`
    });
  } catch (error) {
    console.error('Error in test-pdf endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve PDF content'
    }, { status: 500 });
  }
} 