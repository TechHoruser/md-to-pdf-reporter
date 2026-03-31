import { NextRequest, NextResponse } from 'next/server';
import { generateReportFromMarkdown } from '../../../lib/reportGenerator.js';
import { COMPANY_COLOR_DEFAULTS } from '@/types/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestPayload = {
  markdown: string;
  title?: string;
  version?: string;
  date?: string;
  mainColor?: string;
  author?: {
    name?: string;
    email?: string;
    role?: string;
  };
  company?: {
    name?: string;
    images?: {
      cover?: string;
      header?: string;
    };
    colors?: {
      mainColor?: string;
      secondaryColor?: string;
      bgDarkObsidian?: string;
      bgDarkGray?: string;
      bgMediumGray?: string;
      bgLightGray?: string;
    };
  };
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RequestPayload;

    if (!payload.markdown || typeof payload.markdown !== 'string') {
      return NextResponse.json({ error: 'markdown is required' }, { status: 400 });
    }

    const pdfBuffer: Buffer = await generateReportFromMarkdown({
      markdown: payload.markdown,
      version: payload.version || '1.0',
      date: payload.date || new Date().toISOString().split('T')[0],
      author: {
        name: payload.author?.name || 'Author',
        email: payload.author?.email,
        role: payload.author?.role
      },
      company: {
        name: payload.company?.name || 'Company',
        images: {
          cover: payload.company?.images?.cover || '',
          header: payload.company?.images?.header || ''
        },
        colors: {
          mainColor: payload.mainColor || payload.company?.colors?.mainColor || COMPANY_COLOR_DEFAULTS.mainColor,
          secondaryColor: payload.company?.colors?.secondaryColor || COMPANY_COLOR_DEFAULTS.secondaryColor,
          bgDarkObsidian: payload.company?.colors?.bgDarkObsidian || COMPANY_COLOR_DEFAULTS.bgDarkObsidian,
          bgDarkGray: payload.company?.colors?.bgDarkGray || COMPANY_COLOR_DEFAULTS.bgDarkGray,
          bgMediumGray: payload.company?.colors?.bgMediumGray || COMPANY_COLOR_DEFAULTS.bgMediumGray,
          bgLightGray: payload.company?.colors?.bgLightGray || COMPANY_COLOR_DEFAULTS.bgLightGray
        }
      },
      title: payload.title || 'Live Preview'
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
