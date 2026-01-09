# Create a Zoom Contact Center app with the App Manifest API

This guide shows how to create a general app with a pre-defined configuration a Zoom Contact Center App app using the **App Manifest API**.


### Set local developer env with Ngrok (reverse proxy)
Zoom Apps do not support localhost, and must be served over https. To develop locally, you need to tunnel traffic to this application via https.

```
ngrok http 3000
```

Ngrok will output the origin it has created for your tunnel, eg https://9a20-38-99-100-7.ngrok.io. You'll need to use the https origin from the Ngrok terminal output or what tunnel service of your when testing locally. In the pre-defined configuration, replace all instances of `example.ngrok.app` with your actual ngrok domain.


Please copy the https origin from the Ngrok terminal output and paste it in the ZOOM_REDIRECT_URI value in the .env file

---

### Create and configure Marketplace App

### 1. Create an OAuth app

👉 **[Click here to create an app on the Zoom App Marketplace](https://marketplace.zoom.us/develop/create)**

* Select **General app** and click **Create**.

> [!NOTE]
> Take note of your app ID in the URL after app creation -- you will need it to later on.
---

### 2. Retrieve app credentials

* Click **Manage** > your app
* Navigate to **Basic Information** > **App Credentials**

> [!Note]
> Use these credentials for [authorization](https://developers.zoom.us/docs/integrations/oauth/).
---

### 3. Add required scopes

 On the Scope page, select the following:
 *  Edit marketplace app
 *  View marketplace app information for the account
 --- 

### 4. Update the app using the Manifest API

Use the following endpoint to quickly configure a Zoom Marketplace app:

**Example request:**

```
PUT /marketplace/apps/{appId}/manifest
```
👉 [Update an app by manifest API endpoint](https://developers.zoom.us/docs/api/marketplace/#tag/manifest/put/marketplace/apps/{appId}/manifest)

---

### 5. Use Manifest JSON object to create Zoom App
 Use an API tool like Postman to send a PUT request to the manifest endpoint with the JSON object below as the request body.

> [!NOTE]
> Replace placeholder URLs like `https://example.ngrok.io` with your actual tunnel URL (e.g., from ngrok).

**Request body:**

```
{
    "manifest": {
        "display_information": {
            "display_name": "Zoom Contact Center Apps JS Sample"
        },
        "oauth_information": {
            "usage": "USER_OPERATION",
            "development_redirect_uri": "https://example.ngrok.app/auth/callback",
            "production_redirect_uri": "",
            "oauth_allow_list": [
                "https://oauth.pstmn.io/v1/callback",
                "https://example.ngrok.app/auth/callback"
            ],
            "strict_mode": false,
            "subdomain_strict_mode": false,
            "scopes": [
                {
                    "scope": "marketplace:read:app",
                    "optional": false
                },
                {
                    "scope": "meeting:read:meeting",
                    "optional": false
                },
                {
                    "scope": "team_chat:read:user_message",
                    "optional": false
                },
                {
                    "scope": "zoomapp:inmeeting",
                    "optional": false
                }
            ]
        },
        "features": {
            "products": [
                "ZOOM_CONTACT_CENTER",
                "ZOOM_MEETING"
            ],
            "development_home_uri": "https://example.ngrok.app",
            "production_home_uri": "",
            "domain_allow_list": [
                {
                    "domain": "appssdk.zoom.us",
                    "explanation": ""
                },
                {
                    "domain": "ngrok.app",
                    "explanation": ""
                },
                {
                    "domain": "cdn.ngrok.com",
                    "explanation": ""
                },
                {
                    "domain": "cdn.jsdelivr.net",
                    "explanation": ""
                }
            ],
            "in_client_feature": {
                "zoom_app_api": {
                    "enable": true,
                    "zoom_app_apis": [
                        "getAppContext",
                        "getAppVariableList",
                        "getEngagementContext",
                        "getEngagementStatus",
                        "getEngagementVariableValue",
                        "getMeetingContext",
                        "getMeetingUUID",
                        "getRunningContext",
                        "getSupportedJsApis",
                        "getUserContext",
                        "onEngagementContextChange",
                        "onEngagementMediaRedirect",
                        "onEngagementStatusChange",
                        "onEngagementVariableValueChange"
                    ]
                },
                "guest_mode": {
                    "enable": false,
                    "enable_test_guest_mode": false
                },
                "in_client_oauth": {
                    "enable": false
                },
                "collaborate_mode": {
                    "enable": false,
                    "enable_screen_sharing": false,
                    "enable_play_together": false,
                    "enable_start_immediately": false,
                    "enable_join_immediately": false
                }
            },
            "zoom_client_support": {
                "mobile": {
                    "enable": false
                },
                "zoom_room": {
                    "enable": false,
                    "enable_personal_zoom_room": false,
                    "enable_shared_zoom_room": false,
                    "enable_digital_signage": false,
                    "enable_zoom_rooms_controller": false
                },
                "pwa_client": {
                    "enable": false
                }
            },
            "embed": {
                "meeting_sdk": {
                    "enable": false,
                    "enable_device": false,
                    "devices": []
                },
                "contact_center_sdk": {
                    "enable": true
                },
                "phone_sdk": {
                    "enable": false
                }
            },
            "team_chat_subscription": {
                "enable": false,
                "enable_support_channel": false,
                "shortcuts": []
            },
            "event_subscription": {
                "enable": false,
                "events": []
            }
        }
    }
}
```