import { createClient } from '@lib/supabase/server';
import { exec } from 'child_process';
import util from 'util';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const execAsync = util.promisify(exec);

export async function POST() {
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

  try {
    const projectDir = '/home/bistu/AgentifUI';

    // Step 1: Await the build process
    const { stdout: buildStdout, stderr: buildStderr } = await execAsync(
      `cd ${projectDir} && pnpm build`
    );
    if (buildStderr && !buildStdout.includes('build complete')) {
      // If build fails (stderr has content and stdout doesn't indicate success), return an error.
      console.error('Build process failed:', buildStderr);
      return NextResponse.json(
        { error: 'Build failed', details: buildStderr },
        { status: 500 }
      );
    }
    console.log('Build process successful:', buildStdout);

    // Step 2: Fire-and-forget the restart process and immediately return success
    execAsync(`pm2 restart "AgentifUI"`).catch(err => {
      // Log error if restart command itself fails to execute
      console.error('Failed to start pm2 restart:', err);
    });

    return NextResponse.json({
      message: 'Recompilation successful! Restarting application...',
    });
  } catch (error: any) {
    // This will now mostly catch errors from the build step.
    console.error('An error occurred during rebuild process:', error);
    return NextResponse.json(
      { error: 'Rebuild process failed', details: error.message },
      { status: 500 }
    );
  }
}
