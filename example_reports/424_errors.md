---
title: 424 App1 Error Report - OrgX
author: AuthorX
company: CompanyX
date: 2026-03-24
version: 1.0
---

# Context
OrgX reports that app performance is below expectations, likely due to 424 errors returned by App1. These occur when a request depends on another that has failed (**Failed Dependency**).

# Incident Analysis
Analyzing logs from the last 72 hours (OrgX and OrgY), we found that the 424 error primarily occurs during requests to **SX (serviceX)**. Some have returned a **502 (Bad Gateway)** while others have triggered policy violations, leading to the 424 in App1:

1.  **Timeout**: Requests exceeding the time limit. This may be due to poor caching or inadequate maintenance.
2.  **Circuit Breaker**: Triggered by high load or performance issues in dependent services.

# Discussion with the SX Team
After reviewing the logs with SX, they confirmed that the root cause is **serviceY**. The failure cascade is as follows:
**serviceY (502) -> SX (502) -> App1 (424)**.

**Observation for SX:** We have requested that, to facilitate our queries, they return a message in the *body* indicating an error with serviceY (e.g., "HTTP returned by serviceY 502"). This way, we won't depend on their logs to identify the failing service.

The serviceY team is currently addressing the performance issue in [this ticket](https://company-content.atlassian.net/browse/ITEM-8041).

# Next Steps
* **Monitoring:** We expect these 424 codes to stop once ticket [ITEM-8041](https://company.atlassian.net/browse/ITEM-8041) is in production. We will monitor this.
* **Logging Improvement:** We will update the App1 log to display more information regarding what the API returns (HTTP and body) in case of an error.
* **App1 Adjustment:** We will evaluate a potential change of the returned error code (from 424 to 502), including a descriptive body.

# Examples of requests that returned a 424 error:

## 502 Error

-```log
====================================================================================================
TRACE_ID: 1c30274e84d486647d1ce19eb8edb079 | EVENTS: 6 | START: 2026-03-20T18:21:17.430224825+00:00 | END: 2026-03-20T18:21:17.496698112+00:00
====================================================================================================
[2026-03-20T18:21:17.430224825+00:00] [INFO] [app1] ---> App1 IN -> [GET] /api/app1-api/v1/operators/OrgX_bossID/products/PREMIUM_L_MAX/catalogs/new_companyx_orgx_finland_full/languages/fi-fi/live?channelPids=LCH90295&start=2026-03-20T18%3A21%3A16.553Z&end=2026-03-20T18%3A21%3A26.553Z
[2026-03-20T18:21:17.432836232+00:00] [INFO] [app1] [CACHE] key: config-json:getConfigJson:operator=OrgX_bossID ttl: 1 hour expiresAt: 2026-03-20T18:52:43.894Z
[2026-03-20T18:21:17.432859683+00:00] [INFO] [app1] serviceX -> [CURL] curl -X GET '[https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90295&end=1774030919999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774030860000](https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90295&end=1774030919999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774030860000)' -H 'Accept: application/json, text/plain, */*' -H 'Content-Type: application/json' -H 'traceparent: 00-1c30274e84d486647d1ce19eb8edb079-739c82d27524590a-00' -d '{}'
[2026-03-20T18:21:17.487679580+00:00] [INFO] [app1] Error handler caught an error
[2026-03-20T18:21:17.496676021+00:00] [INFO] [app1] Api connector error
[2026-03-20T18:21:17.496698112+00:00] [INFO] [app1] <--- App1 OUT -> [GET] /api/app1-api/v1/operators/OrgX_bossID/products/PREMIUM_L_MAX/catalogs/new_companyx_orgx_finland_full/languages/fi-fi/live?channelPids=LCH90295&start=2026-03-20T18%3A21%3A16.553Z&end=2026-03-20T18%3A21%3A26.553Z 424 59ms
-````

## Timeout Policy Error

-```log
====================================================================================================
TRACE_ID: e3192acb7a3099a5d62fffcb7d2cd76a | EVENTS: 12 | START: 2026-03-21T09:00:12.800027708+00:00 | END: 2026-03-21T09:00:20.980968459+00:00
====================================================================================================
[2026-03-21T09:00:12.800027708+00:00] [INFO] [app1] ---> App1 IN -> [GET] /api/app1-api/v1/operators/OrgX_FI_bossID/products/PREMIUM_FI_S_SMALL/catalogs/new_companyx_orgx_finland_full/languages/fi-fi/live?channelPids=LCH90289&start=2026-03-21T09%3A00%3A00.153Z&end=2026-03-21T09%3A00%3A10.153Z
[2026-03-21T09:00:12.800651525+00:00] [INFO] [app1] [CACHE] key: config-json:getConfigJson:operator=OrgX_FI_bossID ttl: 1 hour expiresAt: 2026-03-21T09:30:40.815Z
[2026-03-21T09:00:12.801106892+00:00] [INFO] [app1] serviceX -> [CURL] curl -X GET '[https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000](https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000)' -H 'Accept: application/json, text/plain, */*' -H 'Content-Type: application/json' -H 'traceparent: 00-e3192acb7a3099a5d62fffcb7d2cd76a-0afde6bde1563293-00' -d '{}'
[2026-03-21T09:00:14.801558784+00:00] [INFO] [app1] [POLICY] [functionB] Code: TIMEOUT Status: Unknown IsTaskCancelledError: true
[2026-03-21T09:00:14.843519571+00:00] [INFO] [app1] serviceX -> [CURL] curl -X GET '[https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000](https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000)' -H 'Accept: application/json, text/plain, */*' -H 'Content-Type: application/json' -H 'traceparent: 00-e3192acb7a3099a5d62fffcb7d2cd76a-0afde6bde1563293-00' -d '{}'
[2026-03-21T09:00:16.844785181+00:00] [INFO] [app1] [POLICY] [getScheduledContent] Code: TIMEOUT Status: Unknown IsTaskCancelledError: true
[2026-03-21T09:00:16.873674517+00:00] [INFO] [app1] serviceX -> [CURL] curl -X GET '[https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000](https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000)' -H 'Accept: application/json, text/plain, */*' -H 'Content-Type: application/json' -H 'traceparent: 00-e3192acb7a3099a5d62fffcb7d2cd76a-0afde6bde1563293-00' -d '{}'
[2026-03-21T09:00:18.874324838+00:00] [INFO] [app1] [POLICY] [getScheduledContent] Code: TIMEOUT Status: Unknown IsTaskCancelledError: true
[2026-03-21T09:00:18.979898265+00:00] [INFO] [app1] serviceX -> [CURL] curl -X GET '[https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000](https://servicex.prod.companyproductssvcs.com/v1/catalogs/new_companyx_orgx_finland_full/fi-fi/contents/schedulesByChannel?channelPids=LCH90289&end=1774083659999&includeattributes=CA_Description%2CCA_GenreNames&includeimages=Banner%2CCover%2CIcon%2CLandscapeCover&orderBy=Start%3AA&start=1774083600000)' -H 'Accept: application/json, text/plain, */*' -H 'Content-Type: application/json' -H 'traceparent: 00-e3192acb7a3099a5d62fffcb7d2cd76a-0afde6bde1563293-00' -d '{}'
[2026-03-21T09:00:20.980427018+00:00] [INFO] [app1] Error handler caught an error
[2026-03-21T09:00:20.980954679+00:00] [INFO] [app1] Api connector error
[2026-03-21T09:00:20.980968459+00:00] [INFO] [app1] <--- App1 OUT -> [GET] /api/app1-api/v1/operators/OrgX_FI_bossID/products/PREMIUM_FI_S_SMALL/catalogs/new_companyx_orgx_finland_full/languages/fi-fi/live?channelPids=LCH90289&start=2026-03-21T09%3A00%3A00.153Z&end=2026-03-21T09%3A00%3A10.153Z 424 8.1s
-```

## Circuit Breaker Policy Error

-```log
====================================================================================================
TRACE_ID: b090eb25ac933086c08a105cf30b7fbf | EVENTS: 8 | START: 2026-03-20T12:35:04.556450832+00:00 | END: 2026-03-20T12:35:04.559914462+00:00
====================================================================================================
[2026-03-20T12:35:04.556450832+00:00] [INFO] [app1] ---> App1 IN -> [GET] /api/app1-api/v1/operators/OrgY_bossID/products/ORGY_PREMIUM/catalogs/new_companyx_102023_full/languages/en-gb/device-types/Web/contents?page=0&size=20&ageRating=AGE_18&contentTypes=LSE%2C%20LPR%2C%20MOV%2C%20SER&regionId=ORGY&sort=popular
[2026-03-20T12:35:04.558441417+00:00] [INFO] [app1] [CACHE] key: config-json:getConfigJson:operator=OrgY_bossID ttl: 1 hour expiresAt: 2026-03-20T13:13:30.267Z
[2026-03-20T12:35:04.558455178+00:00] [INFO] [app1] [CACHE] key: productId:ORGY_PREMIUM:subscriptions:getProductSubscriptionPids:catalogId=new_companyx_102023_full|language=en-gb ttl: 1 hour expiresAt: 2026-03-20T13:35:01.203Z
[2026-03-20T12:35:04.558462498+00:00] [INFO] [app1] [CACHE] key: productId:ORGY_PREMIUM:tv-channels:getLiveChannelsByRegion:deviceType=Web|regionId=ORGY ttl: 1 hour expiresAt: 2026-03-20T13:35:01.270Z
[2026-03-20T12:35:04.559354329+00:00] [INFO] [app1] [POLICY] [getContents] CIRCUIT_BREAKER_BLOCKED
[2026-03-20T12:35:04.559354329+00:00] [INFO] [app1] [POLICY] [functionC] CIRCUIT_BREAKER_BLOCKED
[2026-03-20T12:35:04.559899631+00:00] [INFO] [app1] Error handler caught an error
[2026-03-20T12:35:04.559911551+00:00] [INFO] [app1] Api connector error
[2026-03-20T12:35:04.559914462+00:00] [INFO] [app1] <--- App1 OUT -> [GET] /api/app1-api/v1/operators/OrgY_bossID/products/ORGY_PREMIUM/catalogs/new_companyx_102023_full/languages/en-gb/device-types/Web/contents?page=0&size=20&ageRating=AGE_18&contentTypes=LSE%2C%20LPR%2C%20MOV%2C%20SER&regionId=ORGY&sort=popular 424 3ms
