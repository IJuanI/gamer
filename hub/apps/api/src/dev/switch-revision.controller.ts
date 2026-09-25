import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';

interface SwitchRevisionDto {
  revisionTag: string;
}

@Controller('dev/switch-revision')
export class SwitchRevisionController {
  constructor(private firestore: FirestoreService) {}

  @Post()
  async switchRevision(@Body() dto: SwitchRevisionDto) {
    // Security: Only allow in development or if properly authenticated
    if (
      process.env.NODE_ENV === 'production' &&
      !this.isAuthorizedUser()
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const { revisionTag } = dto;

    if (!revisionTag.match(/^(pr-\d+|prod)$/)) {
      throw new HttpException('Invalid revision tag format', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.updateCloudRunTraffic(revisionTag);
    } catch (error) {
      console.error('Failed to switch revision:', error);
      throw new HttpException(
        'Failed to switch revision',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async updateCloudRunTraffic(revisionTag: string) {
    // This requires either:
    // 1. Using gcloud CLI via child_process (not recommended)
    // 2. Using Google Cloud REST API
    // 3. Using @google-cloud/run client library
    // For now, we'll use the REST API approach

    const projectId = process.env.FIREBASE_PROJECT_ID || 'unity-dummy';
    const region = 'us-central1';
    const serviceName = 'gamer-hub-api';

    const serviceUrl = `https://run.googleapis.com/v1/projects/${projectId}/locations/${region}/services/${serviceName}`;

    // This requires Application Default Credentials or service account key
    const response = await fetch(serviceUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.getAccessToken()}`,
      },
      body: JSON.stringify({
        spec: {
          traffic: [
            {
              tag: revisionTag,
              percent: 100,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloud Run API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const traffic = data.spec?.traffic || [];

    return {
      revision: revisionTag,
      traffic: traffic.reduce(
        (acc: Record<string, number>, t: any) => {
          acc[t.tag || 'untagged'] = t.percent;
          return acc;
        },
        {},
      ),
    };
  }

  private async getAccessToken(): Promise<string> {
    // Use Application Default Credentials to get an access token
    const auth = require('google-auth-library');
    const googleAuth = new auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await googleAuth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  }

  private isAuthorizedUser(): boolean {
    // TODO: Add proper authorization check
    // For now, allow in development
    return true;
  }
}
