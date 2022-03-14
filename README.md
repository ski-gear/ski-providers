## Ski Goggles - Ski Providers

This is the engine that powers Ski-Goggles (https://github.com/ski-gear/ski-goggles) and other related projects.
If you are looking for the Chrome Extension that can help you debug Snowplow analytics (and other vendors), check [this repository.](https://github.com/ski-gear/ski-goggles)

## How to test locally
1. Be in ski-vendors root
2. `yarn link` (this generates the synthetic local module)
3. Be in ski-goggles root
4. `yarn link ski-vendors` (this links the app to the local ski vendors module)
5. `yarn install --force` (this will pull the latest changes, need to confirm if this has to be run everytime)
6. Switch to ski-vendors
7. Make changes in ski-vendors
8. `yarn compile` to generate the package changes
9. Switch to ski-goggles
10. `yarn build` or `yarn dev-build` to see your changes reflect in the app
11. Open Chrome + Ski-Goggles and check your changes
12. Loop steps 6-10 for Ski-Vendors engine testing
13. `yarn unlink` before you publish~~

### Vendors Mapped:
1. Adobe Analytics
2. Facebook
3. Google Analytics
4. Krux
5. Mixpanel
6. Nielsen
7. Rubicon
8. Snowplow