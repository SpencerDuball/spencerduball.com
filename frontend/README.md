# Development Guide

## Localhost Development

When developing, in order to allow for first party authorization with Auth0 you must not have http://localhost:3000 in your callback urls list noted here [First Party Authorization](https://auth0.com/docs/get-started/applications/confidential-and-public-applications/user-consent-and-third-party-applications#skip-consent-for-first-party-applications). To get around this, we can set the `/etc/hosts` file on our system to point to another URL that points to the localhost IP:

```bash
# /etc/hosts
# ... keep all of the old records, then at the bottom of the entries add
127.0.0.1 spencerduball.testing
```

> Note! There is not a space character between the IP address and the domain name - this is a tab. Now we can visit this page by typing in `http://spencerduball.testing:3000` into our browser URL.

If there is an issue visiting this domain it may help to clear your Mac's DNS cache:

```bash
sudo killall -HUP mDNSResponder
```

# Auth0 Info

For no reason it would appear that Auth0 has decided to make adding permissions to the scope claim automatically as difficult as humanly possible, please keep this in reference for the future when this inevitably breaks: https://community.auth0.com/t/permissions-claim-or-scopes/30156/9
