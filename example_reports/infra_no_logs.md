---
title: Infrastructure Error Report - Missing Logs in Kibana
author: AuthorX
company: CompanyX
date: 2026-03-25
version: 1.0
---

# Context

On March 25, 2026, it was identified that App1 logs for the OrgY production environment were not being ingested into Kibana/Elasticsearch. The primary symptom was a lack of visibility into App1 application logs, which notably prevented the tracing of failing API queries, such as HTTP 424 dependency errors. 

# Incident Analysis

Upon reviewing the anomalies with the infrastructure team (PersonY), the following timeline and evidence were established:

* **Initial Discovery:** Early morning requests were missing from the OrgY application logs. Attempts to trace failing requests via Kong headers (e.g., `x-kong-request-id 2eb207295d4b862fd664414932377a36` and `70469c754d83e81e147a8e76bba2db71`) yielded no results.
* **Service Impact:** Kibana data (`kubernetes.labels.app:app1`) confirmed that no new log entries had been ingested since the afternoon of the previous day, indicating a complete halt in log registration.
* **Root Cause Diagnostics:** The underlying disruption was tied to Elasticsearch infrastructure issues:
  * **Shard Saturation:** The Elasticsearch cluster, operating on 3 nodes, reached maximum shard capacity, preventing the successful creation of new indices.
  * **Fluentd Bottleneck:** Unable to write to Elasticsearch, Fluentd queued requests until its buffer filled entirely. This caused the App1 log ingestion pipeline to lock up completely.

Below is an example of a blocked `curl` request that returned a 424 status code (bypassing CloudFront cache) but was missing from Kibana/Elastic reporting:

-```bash
curl 'https://orgy.cdn.companyx.com/api/app1-api/v1/operators/OrgY_bossID/products/LOWI_GUEST/navigation/catalogs/new_companyx_102023_full/languages/es-es/device-types/Web/pages/home/rows/UNK1755?page=0&size=10&ageRating=AGE_X' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'origin: https://orgy-smarttv-staging.prism.companysvcs.com' \
  ...
-```

# Actions Taken

* **Local Reproduction:** Confirmed that failing `curl` requests persistently returned an HTTP 424 as expected.
* **Manual Intervention:** A manual `drop_logs` action was executed by the infrastructure team to unblock the Fluentd queue, allowing it to resume processing. This led to a partial ingestion recovery observed around 12:53 PM.

# Impact

* **Loss of Telemetry:** Total loss of App1/OrgY application logs and event traces from the afternoon of March 24, 2026, until approximately 12:53 PM on March 25, 2026.

  ![Logs Volume by Day](show_logs_volume_by%20day.png)

* **Data Integrity:** A potential trade-off exists regarding policy implementation; proactive steps to release buffer space implicitly lead to dropped older logs during prolonged infrastructure blockages.

# Next Steps

* **Ingestion Monitoring:** Actively monitor log ingestion to ensure all new indices correctly catch up to current API traffic patterns.
* **Scale Cluster Capacity:** Proceed with the planned deployment of 5 additional nodes to the Elasticsearch cluster to mitigate overall shard saturation.
* **Buffer Management:** Implement a controlled `drop_oldest_logs` policy in Fluentd. This safeguards the ingestion pipeline, ensuring it does not become permanently blocked when buffers fill up in the future.
* **Shard Strategy:** Systematically reevaluate index configuration, retention strategies, and log routing algorithms to proactively prevent unchecked shard growth.
* **Enhanced Alerting:** Enable early-warning alerts for Fluentd queue sizes and buffer usage, alongside continuous tracking of Elasticsearch shard configurations and overall cluster health.

> **Note:** This report reflects the collaborative findings of AuthorX and PersonY. For any operational modifications (such as system reboots, cluster configuration changes, or executing drop scripts), standard team change policies must be adhered to, ensuring relevant infrastructure maintainers are notified prior to action.
