# iOS Shortcuts OTP Setup

Use an iPhone Shortcut to `POST` OTP codes to the local OTP server:

- Endpoint: `POST http://<otp-host>:<OTP_SERVER_PORT>/otp`
- Header: `Content-Type: application/json`
- Header: `x-mobile-token: <MOBILE_PUSH_TOKEN>` when `MOBILE_PUSH_TOKEN` is configured on the server

Example JSON body:

```json
{
  "userId": "123456789",
  "code": "482911",
  "source": "ios-shortcuts",
  "deviceId": "iphone-qa-01",
  "note": "optional"
}
```

Shortcut tip:

- Add a `Get Contents of URL` action
- Set method to `POST`
- Send the JSON body above
- Point it to the same OTP server URL your Playwright tests use

If `MOBILE_PUSH_TOKEN` is set, the request must include the matching `x-mobile-token` header or the server will reject the OTP.
