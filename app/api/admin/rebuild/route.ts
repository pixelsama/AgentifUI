import { createClient } from '@lib/supabase/server';
import { exec } from 'child_process';
import util from 'util';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const execAsync = util.promisify(exec);

// --- Concurrent build control ---
// Prevent multiple build processes from running simultaneously
let isBuilding = false;

export async function POST() {
  // --- Check if build is already in progress ---
  if (isBuilding) {
    return NextResponse.json(
      {
        error:
          'Build is already in progress, please wait for the current build to complete.',
      },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // --- Set building lock ---
  isBuilding = true;

  try {
    const projectDir = '/home/bistu/AgentifUI';

    // --- Step 1: Execute build process ---
    const { stdout: buildStdout, stderr: buildStderr } = await execAsync(
      `cd ${projectDir} && pnpm build`
    );

    // --- Log stderr as warnings (not necessarily errors) ---
    if (buildStderr) {
      console.warn('Build stderr output:', buildStderr);
    }

    // --- Check build success using correct Next.js output ---
    if (!buildStdout.includes('compiled successfully')) {
      console.error('Build process failed:', buildStdout, buildStderr);
      return NextResponse.json(
        { error: 'Build failed', details: buildStderr || buildStdout },
        { status: 500 }
      );
    }

    console.log('Build process successful:', buildStdout);

    // --- Step 2: Execute PM2 restart synchronously ---
    const { stdout: restartStdout, stderr: restartStderr } = await execAsync(
      `pm2 restart "AgentifUI"`
    );

    if (restartStderr) {
      console.error('PM2 restart error:', restartStderr);
      // --- Don't fail if restart has stderr, but log it ---
    }

    console.log('PM2 restart success:', restartStdout);

    return NextResponse.json({
      message: 'Recompilation and restart completed successfully!',
      buildOutput: buildStdout,
      restartOutput: restartStdout,
    });
  } catch (error: any) {
    // --- Enhanced error handling ---
    console.error('An error occurred during rebuild process:', error);
    return NextResponse.json(
      { error: 'Rebuild process failed', details: error.message },
      { status: 500 }
    );
  } finally {
    // --- Always release the lock ---
    isBuilding = false;
  }
}
