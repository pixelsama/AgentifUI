import { encryptApiKey } from '@lib/utils/encryption';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await (await cookieStore).get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: any) {
          (await cookieStore).set({ name, value, ...options });
        },
        async remove(name: string, options: any) {
          (await cookieStore).set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // get request data
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 400 });
    }

    // get encryption key
    const masterKey = process.env.API_ENCRYPTION_KEY;

    if (!masterKey) {
      console.error('API_ENCRYPTION_KEY environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error: encryption key not set' },
        { status: 500 }
      );
    }

    // encrypt API key
    const encryptedKey = encryptApiKey(apiKey, masterKey);

    // return encrypted key
    return NextResponse.json({ encryptedKey });
  } catch (error) {
    console.error('Error encrypting API key:', error);
    return NextResponse.json(
      { error: 'Error encrypting API key' },
      { status: 500 }
    );
  }
}
