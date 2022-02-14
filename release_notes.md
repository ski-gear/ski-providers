# Ski Goggles release notes

Cumulative release notes updated when a new version of Ski Goggles is published to the web store

[Chrome Web Store Listing](https://chrome.google.com/webstore/detail/ski-goggles/epjlgeofddfejkenffcddgcdnjkcanle?hl=en)

## Version 1.9.4 - 24 Jan 2022

## What's new?
- Added **Braze** as a vendor, users can now toggle on/off Braze network requests.
  - This currently also includes the sync calls which aren't useful and come up as "Unknown Event", this will be fixed in the next version
- Added key information to the accordion (pre-dropdown)
  - Snowplow to display schema version (Page first, else Event that triggered it)
  - Adobe Analytics AppMeasurement to display reporting suite
  - Google Analytics to display property id

## What's fixed?
- Fixed **Adobe Analytics AppMeasurement** requests which were coming up as "Unknown Event", these now show the `custom_link_name` or `pev2` parameter
