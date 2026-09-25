/**
 * Developer utility for switching Cloud Run revisions
 * Add to window in development for console access: window.ephemeralApi = ephemeralApi
 */

export async function ephemeralApi(
  prNumber?: number | string,
): Promise<{ revision: string; traffic: Record<string, number> }> {
  const serviceName = 'gamer-hub-api';
  const region = 'us-central1';
  const projectId = 'unity-dummy';

  let targetRevision: string;

  if (prNumber) {
    targetRevision = `pr-${prNumber}`;
  } else {
    targetRevision = 'prod';
  }

  console.log(`🔄 Switching ${serviceName} traffic to revision: ${targetRevision}`);

  try {
    // Call the switch-revision endpoint
    const response = await fetch('/api/dev/switch-revision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisionTag: targetRevision }),
    });

    if (!response.ok) {
      throw new Error(`Failed to switch revision: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully switched to ${targetRevision}`);
    console.log('Traffic distribution:', result.traffic);

    return result;
  } catch (error) {
    console.error('❌ Failed to switch revision:', error);
    throw error;
  }
}

/**
 * Make ephemeralApi available globally in development
 * This will be automatically set up in the frontend or can be manually called
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).ephemeralApi = ephemeralApi;
}

export default ephemeralApi;
