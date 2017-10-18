import { expect } from 'chai';
import { describe, it } from 'mocha';
import { lookup, labelReplacerFromDictionary, setTitle } from '../helpers';
import { path } from 'ramda';
import { Snowplow } from '../providers/snowplow';

describe('Providers', () => {
    describe('Helpers', () => {
        describe('lookup', () => {
            describe('when a valid Provider Canonical Name is provided', () => {
                it('returns the correct Provider', () => {
                    const returned = lookup('Snowplow');
                    expect(returned).to.eq(Snowplow);
                });
            });

            describe('when an invalid Provider Canonical Name is provided', () => {
                it('\'undefined\' is returned', () => {
                    const returned = lookup('Farmplow');
                    expect(returned).to.eq(undefined);
                });
            });
        });

        describe('labelReplacerFromDictionary', () => {
            const dictionary = {
                'test': 'Awesome'
            };

            describe('with an existing label', () => {
                it('returns the looked up label', () => {
                    const returned = labelReplacerFromDictionary('test', dictionary);
                    expect(returned).to.eq('Awesome');
                });
            });

            describe('with a non-existent label', () => {
                it('returns the unchanged label', () => {
                    const returned = labelReplacerFromDictionary('what?', dictionary);
                    expect(returned).to.eq('what?');
                });
            });
        });

        describe('setTitle', () => {
            const webRequestData = {
                meta: {},
                params: [
                    { label: 'test', value: 'awesome', valueType: 'string' }
                ]
            };

            it('Sets the title', () => {
                const transformed = setTitle('Awesome Title', webRequestData);
                expect(path(['meta', 'title'], transformed)).to.eq('Awesome Title');
            });
        });
    });
});
