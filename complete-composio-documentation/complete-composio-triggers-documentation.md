# Delete a trigger

**Documentation:** /reference/api-reference/triggers/deleteTriggerInstancesManageByTriggerId

Permanently deletes a trigger instance. This stops the trigger from listening for events and removes it from your project. Use the PATCH endpoint with status "disable" if you want to temporarily pause a trigger instead.

---

## DELETE `/api/v3/trigger_instances/manage/{triggerId}`

**Endpoint:** `https://backend.composio.dev/api/v3/trigger_instances/manage/{triggerId}`

**Summary:** Delete a trigger

Permanently deletes a trigger instance. This stops the trigger from listening for events and removes it from your project. Use the PATCH endpoint with status "disable" if you want to temporarily pause a trigger instead.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `triggerId` (string (triggerInstanceId)) *(required)*: The ID of the trigger instance to delete

### Responses

#### 200 - Successfully deleted the trigger instance

**Response Schema:**

- `trigger_id` (string (triggerInstanceId)) *(required)*: The ID of the deleted trigger instance

**Example Response:**

```json
{
  "trigger_id": "string"
}
```

#### 400 - Bad request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Trigger instance not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 409 - Trigger instance already deleted

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 410 - Trigger instance already gone

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X DELETE "https://backend.composio.dev/api/v3/trigger_instances/manage/string" \
  -H "x-api-key: YOUR_API_KEY"
```
# Delete a trigger

**Documentation:** /reference/api-reference/triggers/deleteTriggerInstancesManageByTriggerId

Permanently deletes a trigger instance. This stops the trigger from listening for events and removes it from your project. Use the PATCH endpoint with status "disable" if you want to temporarily pause a trigger instead.

---

## DELETE `/api/v3/trigger_instances/manage/{triggerId}`

**Endpoint:** `https://backend.composio.dev/api/v3/trigger_instances/manage/{triggerId}`

**Summary:** Delete a trigger

Permanently deletes a trigger instance. This stops the trigger from listening for events and removes it from your project. Use the PATCH endpoint with status "disable" if you want to temporarily pause a trigger instead.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `triggerId` (string (triggerInstanceId)) *(required)*: The ID of the trigger instance to delete

### Responses

#### 200 - Successfully deleted the trigger instance

**Response Schema:**

- `trigger_id` (string (triggerInstanceId)) *(required)*: The ID of the deleted trigger instance

**Example Response:**

```json
{
  "trigger_id": "string"
}
```

#### 400 - Bad request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Trigger instance not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 409 - Trigger instance already deleted

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 410 - Trigger instance already gone

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X DELETE "https://backend.composio.dev/api/v3/trigger_instances/manage/string" \
  -H "x-api-key: YOUR_API_KEY"
```

# Get trigger type by slug

**Documentation:** /reference/api-reference/triggers/getTriggersTypesBySlug

Retrieve detailed information about a specific trigger type using its slug identifier

---

## GET `/api/v3/triggers_types/{slug}`

**Endpoint:** `https://backend.composio.dev/api/v3/triggers_types/{slug}`

**Summary:** Get trigger type by slug

Retrieve detailed information about a specific trigger type using its slug identifier

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `slug` (string) *(required)*: The unique slug identifier for the trigger type. Case-insensitive (internally normalized to uppercase).

### Query Parameters

- `toolkit_versions` (any): Toolkit version specification. Use "latest" for latest versions or bracket notation for specific versions per toolkit.

### Responses

#### 200 - Successfully retrieved trigger type

**Response Schema:**

- `slug` (string) *(required)*: Unique identifier for the trigger type
- `name` (string) *(required)*: Human-readable name of the trigger
- `description` (string) *(required)*: Detailed description of what the trigger does
- `instructions` (string) *(required)*: Step-by-step instructions on how to set up and use this trigger
- `type` (enum: "webhook" | "poll") *(required)*: The trigger mechanism - either webhook (event-based) or poll (scheduled check)
- `toolkit` (object) *(required)*: Information about the toolkit that provides this trigger
  - `slug` (string) *(required)*: Unique identifier for the parent toolkit
  - `name` (string) *(required)*: Deprecated: Use slug instead
  - `logo` (string) *(required)*: Logo of the toolkit
- `config` (object) *(required)*: Configuration schema required to set up this trigger
- `payload` (object) *(required)*: Schema of the data payload this trigger will deliver when it fires
- `version` (string) *(required)*: Version of the trigger type

**Example Response:**

```json
{
  "slug": "string",
  "name": "string",
  "description": "string",
  "instructions": "string",
  "type": "webhook",
  "toolkit": {
    "slug": "string",
    "name": "string",
    "logo": "string"
  },
  "config": {},
  "payload": {},
  "version": "string"
}
```

#### 400 - Bad request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X GET "https://backend.composio.dev/api/v3/triggers_types/string" \
  -H "x-api-key: YOUR_API_KEY"
```
# List trigger type enums

**Documentation:** /reference/api-reference/triggers/getTriggersTypesListEnum

Retrieves a list of all available trigger type enum values that can be used across the API from latest versions of the toolkit only

---

## GET `/api/v3/triggers_types/list/enum`

**Endpoint:** `https://backend.composio.dev/api/v3/triggers_types/list/enum`

**Summary:** List trigger type enums

Retrieves a list of all available trigger type enum values that can be used across the API from latest versions of the toolkit only

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Responses

#### 200 - Successfully retrieved trigger enum list

**Response Schema:**


**Example Response:**

```json
[
  "string"
]
```

#### 400 - Bad request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X GET "https://backend.composio.dev/api/v3/triggers_types/list/enum" \
  -H "x-api-key: YOUR_API_KEY"
```
# Enable or disable a trigger

**Documentation:** /reference/api-reference/triggers/patchTriggerInstancesManageByTriggerId

Updates the status of a trigger instance to enable or disable it. Disabling a trigger pauses event listening without deleting the trigger configuration. Re-enabling restores the trigger to its active state. Use this for temporary maintenance or to control trigger execution.

---

## PATCH `/api/v3/trigger_instances/manage/{triggerId}`

**Endpoint:** `https://backend.composio.dev/api/v3/trigger_instances/manage/{triggerId}`

**Summary:** Enable or disable a trigger

Updates the status of a trigger instance to enable or disable it. Disabling a trigger pauses event listening without deleting the trigger configuration. Re-enabling restores the trigger to its active state. Use this for temporary maintenance or to control trigger execution.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `triggerId` (string (triggerInstanceId)) *(required)*: The ID of the trigger instance to update

### Request Body

**Schema:**

- `status` (enum: "enable" | "disable") *(required)*

**Example:**

```json
{
  "status": "enable"
}
```

### Responses

#### 200 - Successfully updated trigger status

**Response Schema:**

- `status` (enum: "success") *(required)*: Status of the operation

**Example Response:**

```json
{
  "status": "success"
}
```

#### 400 - Bad Request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Trigger instance not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 409 - Trigger instance already enabled/disabled

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 410 - Trigger instance already gone

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal Server Error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 501 - Not implemented

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X PATCH "https://backend.composio.dev/api/v3/trigger_instances/manage/string" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "enable"
  }'
```
# Create or update a trigger

**Documentation:** /reference/api-reference/triggers/postTriggerInstancesBySlugUpsert

Creates a new trigger instance or updates an existing one with the same configuration. Triggers listen for events from external services (webhooks or polling) and can invoke your workflows. If a matching trigger already exists and is disabled, it will be re-enabled. Requires a connected account ID to associate the trigger with a specific user connection.

---

## POST `/api/v3/trigger_instances/{slug}/upsert`

**Endpoint:** `https://backend.composio.dev/api/v3/trigger_instances/{slug}/upsert`

**Summary:** Create or update a trigger

Creates a new trigger instance or updates an existing one with the same configuration. Triggers listen for events from external services (webhooks or polling) and can invoke your workflows. If a matching trigger already exists and is disabled, it will be re-enabled. Requires a connected account ID to associate the trigger with a specific user connection.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `slug` (string) *(required)*: The slug of the trigger instance. Case-insensitive (internally normalized to uppercase).

### Request Body

**Schema:**

- `connectedAuthId` (string (connectedAccountId)): DEPRECATED: This parameter will be removed in a future version. Please use connected_account_id instead.
- `triggerConfig` (object): DEPRECATED: This parameter will be removed in a future version. Please use trigger_config instead.
- `connected_account_id` (string (connectedAccountId)): Connected account nanoid
- `trigger_config` (object): Trigger configuration
- `version` (string): DEPRECATED: This parameter will be removed in a future version. Please use toolkit_versions instead.
- `toolkit_versions` (any): Toolkit version specification. Supports "latest" string or a record mapping toolkit slugs to specific versions.

**Example:**

```json
{
  "connectedAuthId": "string",
  "triggerConfig": {},
  "connected_account_id": "string",
  "trigger_config": {},
  "version": "string",
  "toolkit_versions": null
}
```

### Responses

#### 200 - Successfully upserted trigger instance

**Response Schema:**

- `trigger_id` (string) *(required)*: ID of the updated trigger
- `deprecated` (object) *(required)*
  - `uuid` (string) *(required)*: ID of the updated trigger

**Example Response:**

```json
{
  "trigger_id": "string",
  "deprecated": {
    "uuid": "string"
  }
}
```

#### 201 - Successfully created trigger instance

**Response Schema:**

- `trigger_id` (string) *(required)*: ID of the updated trigger
- `deprecated` (object) *(required)*
  - `uuid` (string) *(required)*: ID of the updated trigger

**Example Response:**

```json
{
  "trigger_id": "string",
  "deprecated": {
    "uuid": "string"
  }
}
```

#### 204 - No content

**Response Schema:**


#### 400 - Bad request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Trigger instance not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 410 - Gone

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 422 - Unprocessable entity

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 501 - Not implemented

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X POST "https://backend.composio.dev/api/v3/trigger_instances/string/upsert" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "connectedAuthId": "string",
    "triggerConfig": {},
    "connected_account_id": "string",
    "trigger_config": {},
    "version": "string",
    "toolkit_versions": null
  }'
```

# Delete webhook subscription

**Documentation:** /reference/api-reference/webhooks/deleteWebhookSubscriptionsById

Permanently deletes a webhook subscription. This action cannot be undone.

---

## DELETE `/api/v3/webhook_subscriptions/{id}`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions/{id}`

**Summary:** Delete webhook subscription

Permanently deletes a webhook subscription. This action cannot be undone.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `id` (string (webhookSubscriptionId)) *(required)*: Webhook subscription ID

### Responses

#### 200 - Webhook subscription deleted

**Response Schema:**

- `success` (boolean) *(required)*

**Example Response:**

```json
{
  "success": true
}
```

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Subscription not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X DELETE "https://backend.composio.dev/api/v3/webhook_subscriptions/string" \
  -H "x-api-key: YOUR_API_KEY"
```

# List webhook subscriptions

**Documentation:** /reference/api-reference/webhooks/getWebhookSubscriptions

Lists all webhook subscriptions for the authenticated project with pagination. Currently limited to one subscription per project.

---

## GET `/api/v3/webhook_subscriptions`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions`

**Summary:** List webhook subscriptions

Lists all webhook subscriptions for the authenticated project with pagination. Currently limited to one subscription per project.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Query Parameters

- `limit` (number,null): Number of items per page, max allowed is 1000
- `cursor` (string): Cursor for pagination. The cursor is a base64 encoded string of the page and limit. The page is the page number and the limit is the number of items per page. The cursor is used to paginate through the items. The cursor is not required for the first page.

### Responses

#### 200 - Webhook subscriptions retrieved

**Response Schema:**

- `items` (array<object>) *(required)*
  - Array items:
    - `id` (string (webhookSubscriptionId)) *(required)*: Unique subscription ID
    - `webhook_url` (string) *(required)*: Webhook destination URL
    - `version` (enum: "V1" | "V2" | "V3") *(required)*: Webhook payload version
    - `enabled_events` (array<string>) *(required)*: Subscribed event types
    - `secret` (string) *(required)*: Masked signing secret (full secret only on create/rotate)
    - `created_at` (string) *(required)*: ISO 8601 timestamp
    - `updated_at` (string) *(required)*: ISO 8601 timestamp
- `next_cursor` (string,null)
- `total_pages` (number) *(required)*
- `current_page` (number) *(required)*
- `total_items` (number) *(required)*

**Example Response:**

```json
{
  "items": [
    {
      "id": "string",
      "webhook_url": "string",
      "version": "V1",
      "enabled_events": [
        "..."
      ],
      "secret": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "next_cursor": null,
  "total_pages": 1,
  "current_page": 1,
  "total_items": 1
}
```

#### 400 - Invalid pagination

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X GET "https://backend.composio.dev/api/v3/webhook_subscriptions" \
  -H "x-api-key: YOUR_API_KEY"
```

# Get webhook subscription

**Documentation:** /reference/api-reference/webhooks/getWebhookSubscriptionsById

Retrieves a webhook subscription by ID.

---

## GET `/api/v3/webhook_subscriptions/{id}`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions/{id}`

**Summary:** Get webhook subscription

Retrieves a webhook subscription by ID.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `id` (string (webhookSubscriptionId)) *(required)*: Webhook subscription ID

### Responses

#### 200 - Webhook subscription retrieved

**Response Schema:**

- `id` (string (webhookSubscriptionId)) *(required)*: Unique subscription ID
- `webhook_url` (string) *(required)*: Webhook destination URL
- `version` (enum: "V1" | "V2" | "V3") *(required)*: Webhook payload version
- `enabled_events` (array<string>) *(required)*: Subscribed event types
- `secret` (string) *(required)*: Masked signing secret (full secret only on create/rotate)
- `created_at` (string) *(required)*: ISO 8601 timestamp
- `updated_at` (string) *(required)*: ISO 8601 timestamp

**Example Response:**

```json
{
  "id": "string",
  "webhook_url": "string",
  "version": "V1",
  "enabled_events": [
    "string"
  ],
  "secret": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Subscription not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X GET "https://backend.composio.dev/api/v3/webhook_subscriptions/string" \
  -H "x-api-key: YOUR_API_KEY"
```

# List available event types

**Documentation:** /reference/api-reference/webhooks/getWebhookSubscriptionsEventTypes

Returns all event types that can be subscribed to, along with their supported webhook versions.

---

## GET `/api/v3/webhook_subscriptions/event_types`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions/event_types`

**Summary:** List available event types

Returns all event types that can be subscribed to, along with their supported webhook versions.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Responses

#### 200 - Event types retrieved

**Response Schema:**

- `items` (array<object>) *(required)*
  - Array items:
    - `event_type` (string) *(required)*: Event type identifier
    - `description` (string) *(required)*: Human-readable description of the event
    - `supported_versions` (array<enum: "V1" | "V2" | "V3">) *(required)*: Webhook versions that support this event

**Example Response:**

```json
{
  "items": [
    {
      "event_type": "string",
      "description": "string",
      "supported_versions": [
        "..."
      ]
    }
  ]
}
```

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X GET "https://backend.composio.dev/api/v3/webhook_subscriptions/event_types" \
  -H "x-api-key: YOUR_API_KEY"
```

# Update webhook subscription

**Documentation:** /reference/api-reference/webhooks/patchWebhookSubscriptionsById

Updates a webhook subscription. At least one field must be provided.

---

## PATCH `/api/v3/webhook_subscriptions/{id}`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions/{id}`

**Summary:** Update webhook subscription

Updates a webhook subscription. At least one field must be provided.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `id` (string (webhookSubscriptionId)) *(required)*: Webhook subscription ID

### Request Body

**Schema:**

- `webhook_url` (string (uri)): HTTPS URL to receive webhook events
- `enabled_events` (array<string>): Array of event types to subscribe to
- `version` (enum: "V1" | "V2" | "V3"): Webhook payload version

**Example:**

```json
{
  "webhook_url": "https://example.com",
  "enabled_events": [
    "string"
  ],
  "version": "V1"
}
```

### Responses

#### 200 - Webhook subscription updated

**Response Schema:**

- `id` (string (webhookSubscriptionId)) *(required)*: Unique subscription ID
- `webhook_url` (string) *(required)*: Webhook destination URL
- `version` (enum: "V1" | "V2" | "V3") *(required)*: Webhook payload version
- `enabled_events` (array<string>) *(required)*: Subscribed event types
- `secret` (string) *(required)*: Masked signing secret (full secret only on create/rotate)
- `created_at` (string) *(required)*: ISO 8601 timestamp
- `updated_at` (string) *(required)*: ISO 8601 timestamp

**Example Response:**

```json
{
  "id": "string",
  "webhook_url": "string",
  "version": "V1",
  "enabled_events": [
    "string"
  ],
  "secret": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### 400 - Invalid request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Subscription not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X PATCH "https://backend.composio.dev/api/v3/webhook_subscriptions/string" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://example.com",
    "enabled_events": [
      "string"
    ],
    "version": "V1"
  }'
```

# Update webhook subscription

**Documentation:** /reference/api-reference/webhooks/patchWebhookSubscriptionsById

Updates a webhook subscription. At least one field must be provided.

---

## PATCH `/api/v3/webhook_subscriptions/{id}`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions/{id}`

**Summary:** Update webhook subscription

Updates a webhook subscription. At least one field must be provided.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `id` (string (webhookSubscriptionId)) *(required)*: Webhook subscription ID

### Request Body

**Schema:**

- `webhook_url` (string (uri)): HTTPS URL to receive webhook events
- `enabled_events` (array<string>): Array of event types to subscribe to
- `version` (enum: "V1" | "V2" | "V3"): Webhook payload version

**Example:**

```json
{
  "webhook_url": "https://example.com",
  "enabled_events": [
    "string"
  ],
  "version": "V1"
}
```

### Responses

#### 200 - Webhook subscription updated

**Response Schema:**

- `id` (string (webhookSubscriptionId)) *(required)*: Unique subscription ID
- `webhook_url` (string) *(required)*: Webhook destination URL
- `version` (enum: "V1" | "V2" | "V3") *(required)*: Webhook payload version
- `enabled_events` (array<string>) *(required)*: Subscribed event types
- `secret` (string) *(required)*: Masked signing secret (full secret only on create/rotate)
- `created_at` (string) *(required)*: ISO 8601 timestamp
- `updated_at` (string) *(required)*: ISO 8601 timestamp

**Example Response:**

```json
{
  "id": "string",
  "webhook_url": "string",
  "version": "V1",
  "enabled_events": [
    "string"
  ],
  "secret": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### 400 - Invalid request

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Subscription not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X PATCH "https://backend.composio.dev/api/v3/webhook_subscriptions/string" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://example.com",
    "enabled_events": [
      "string"
    ],
    "version": "V1"
  }'
```

# Rotate webhook secret

**Documentation:** /reference/api-reference/webhooks/postWebhookSubscriptionsByIdRotateSecret

Generates a new signing secret for the webhook subscription. The new secret is returned only in this response.

---

## POST `/api/v3/webhook_subscriptions/{id}/rotate_secret`

**Endpoint:** `https://backend.composio.dev/api/v3/webhook_subscriptions/{id}/rotate_secret`

**Summary:** Rotate webhook secret

Generates a new signing secret for the webhook subscription. The new secret is returned only in this response.

### Authentication

**ApiKeyAuth** - API Key in `header` header `x-api-key` OR **UserApiKeyAuth** - API Key in `header` header `x-user-api-key`

### Path Parameters

- `id` (string (webhookSubscriptionId)) *(required)*: Webhook subscription ID

### Responses

#### 200 - Webhook secret rotated

**Response Schema:**

- `id` (string (webhookSubscriptionId)) *(required)*: Subscription ID
- `secret` (string) *(required)*: New signing secret

**Example Response:**

```json
{
  "id": "string",
  "secret": "string"
}
```

#### 401 - Unauthorized

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 404 - Subscription not found

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

#### 500 - Internal server error

**Response Schema:**

- `error` (object) *(required)*
  - `message` (string) *(required)*
  - `code` (number) *(required)*
  - `slug` (string) *(required)*
  - `status` (number) *(required)*
  - `request_id` (string)
  - `suggested_fix` (string)
  - `errors` (array<string>)

### Example cURL Request

```bash
curl -X POST "https://backend.composio.dev/api/v3/webhook_subscriptions/string/rotate_secret" \
  -H "x-api-key: YOUR_API_KEY"
```