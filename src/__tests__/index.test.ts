import { expect } from "chai";
import "mocha";
import { SkiProviders, SkiProviderHelpers } from '../index';

describe('Smoke Test', () => {
    describe('SkiProviders', () => {
        it('is exported correctly', () => {
            expect(SkiProviders).to.contain.all.keys(
                [
                    'Snowplow',
                    'Krux',
                    'AdobeAnalyticsAppMeasurement',
                    'Rubicon',
                    'Nielsen',
                    'GoogleAnalytics',
                    'Facebook',
                    'Mixpanel',
                    'Braze',
                    'TealiumIQ'
                ]
            );
        });
    });

    describe('SkiProviderHelpers', () => {
        it('is exported correctly', () => {
            expect(SkiProviderHelpers.lookup('Snowplow').canonicalName).to.eql('Snowplow');
        });
    });

    describe('SkiProviderHelpers', () => {
        it('is exported correctly', () => {
            expect(SkiProviderHelpers.lookup('TealiumIQ').canonicalName).to.eql('TealiumIQ');
        });
    });
});
