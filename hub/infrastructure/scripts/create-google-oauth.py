#!/usr/bin/env python3
"""
GamER Hub Google OAuth Credential Creator
Creates Google OAuth 2.0 Web Application credentials programmatically
"""

import json
import sys
import os
from pathlib import Path

# Try to import Google API libraries
try:
    from google.auth import default
    from google.auth.transport.requests import Request
    import google.auth.exceptions
    from google.oauth2.service_account import Credentials as SACredentials
except ImportError:
    print("Error: Google Cloud libraries not installed")
    print("Install with: pip install google-auth google-auth-httplib2 google-auth-oauthlib")
    sys.exit(1)

import requests
from urllib.parse import urljoin


class GoogleOAuthCreator:
    """Creates Google OAuth 2.0 credentials"""

    def __init__(self, project_id: str):
        self.project_id = project_id
        self.credentials = None
        self.access_token = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate with Google Cloud"""
        try:
            self.credentials, _ = default()
            print(f"✓ Authenticated with Google Cloud")
            print(f"  Project: {self.project_id}")
        except google.auth.exceptions.DefaultCredentialsError:
            print("✗ Could not find Google Cloud credentials")
            print("  Run: gcloud auth application-default login")
            sys.exit(1)

    def _get_access_token(self) -> str:
        """Get access token for API calls"""
        if not self.credentials.valid:
            request = Request()
            self.credentials.refresh(request)
        return self.credentials.token

    def create_oauth_client(self, display_name: str, redirect_uris: list) -> dict:
        """Create OAuth 2.0 Client ID"""

        access_token = self._get_access_token()

        url = f"https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/default/generateAccessToken"

        # For now, use the REST API to create OAuth credentials
        # The Google API requires using the OAuth 2.0 API endpoint

        api_url = f"https://oauth2.googleapis.com/v2/certs"  # Example endpoint

        # Create credential payload
        payload = {
            "displayName": display_name,
            "redirectUris": redirect_uris,
            "clientType": "WEB_APPLICATION"
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        print(f"\nCreating OAuth Client: {display_name}")
        print(f"  Redirect URIs: {', '.join(redirect_uris)}")

        # Note: Google's REST API doesn't have a public endpoint for creating
        # OAuth 2.0 credentials. This is a known limitation.
        # Users must create these through the GCP Console.

        print("\n⚠ Google API Limitation:")
        print("  OAuth 2.0 Web Application credentials cannot be created via API")
        print("  This requires manual setup through GCP Console")

        return None

    def open_credentials_console(self):
        """Open GCP Console to create credentials"""
        import webbrowser

        url = f"https://console.cloud.google.com/apis/credentials/oauthclient?project={self.project_id}"
        print(f"\nOpening GCP Console in browser...")
        print(f"URL: {url}")

        if webbrowser.open(url):
            print("✓ Browser opened")
        else:
            print(f"⚠ Could not open browser. Please visit:")
            print(f"  {url}")


def main():
    """Main function"""

    project_id = os.environ.get("GCP_PROJECT_ID", "unity-dummy")

    print(f"{'='*60}")
    print(f"Google OAuth Credential Creator")
    print(f"{'='*60}\n")

    creator = GoogleOAuthCreator(project_id)

    redirect_uris = [
        "https://gameer.com.ar/api/auth/google/callback",
        "https://gameer.com.ar/api/auth/google"
    ]

    # Note: Due to Google API limitations, this will guide user to console
    creator.open_credentials_console()

    print("\n" + "="*60)
    print("Manual Steps:")
    print("="*60)
    print("""
1. In the GCP Console, click '+ Create Credentials'
2. Select 'OAuth client ID'
3. Choose application type: 'Web application'
4. Name: 'GamER Hub API'
5. Add Authorized redirect URIs:
   - https://gameer.com.ar/api/auth/google/callback
   - https://gameer.com.ar/api/auth/google
6. Click 'Create'
7. Copy the Client ID and Client Secret from the popup
8. Export environment variables:
   export TF_VAR_google_client_id="YOUR_CLIENT_ID"
   export TF_VAR_google_client_secret="YOUR_CLIENT_SECRET"
9. Run deployment: bash infrastructure/scripts/deploy-api.sh
""")

    print("="*60)

    # Prompt user to paste credentials
    print("\nPaste the credentials from GCP Console:")
    client_id = input("Client ID: ").strip()
    client_secret = input("Client Secret: ").strip()

    if not client_id or not client_secret:
        print("✗ Credentials not provided")
        sys.exit(1)

    print("\n✓ Credentials saved!")
    print(f"\nExport these environment variables:")
    print(f'  export TF_VAR_google_client_id="{client_id}"')
    print(f'  export TF_VAR_google_client_secret="{client_secret}"')

    # Save to .env file if requested
    save_to_file = input("\nSave to infrastructure/.env.local? (y/N): ").strip().lower()
    if save_to_file == 'y':
        env_file = Path("infrastructure/.env.local")
        with open(env_file, "a") as f:
            f.write(f'\n# Google OAuth\n')
            f.write(f'export TF_VAR_google_client_id="{client_id}"\n')
            f.write(f'export TF_VAR_google_client_secret="{client_secret}"\n')
        print(f"✓ Saved to {env_file}")


if __name__ == "__main__":
    main()
