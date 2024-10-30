import { FilterChain, Filter, isSafe, MioFilter, isFromMio, hasMioRelatedWord, hasMioRelatedTags } from './filter';
import { Record } from '../lexicon/types/app/bsky/feed/post';

class FakeFilterChain implements FilterChain {
    constructor(private filters: Filter[] = []) { }
    apply(record: Record): boolean {
        return this.filters.every(filter => filter(record));
    }
}

test('How to use/implement FilterChain', () => {

    const filter1: Filter = (record: Record) => record.id === '1';
    const filter2: Filter = (record: Record) => record.text.includes('test');

    const filterChain: FilterChain = new FakeFilterChain([filter1, filter2]);

    const record1: Record = {
        id: '1',
        text: 'this is a test',
        createdAt: ''
    };
    const record2: Record = {
        id: '2',
        text: 'this is a test',
        createdAt: ''
    };
    const record3: Record = {
        id: '2',
        text: 'this is not a pen',
        createdAt: ''
    };

    expect(filterChain.apply(record1)).toBe(true);
    expect(filterChain.apply(record2)).toBe(false);
    expect(filterChain.apply(record3)).toBe(false);
});

test('isSafe filter', () => {
    const safeRecord: Record = {
        id: '1',
        text: 'safe content',
        createdAt: '',
        labels: { values: [{ val: 'safe' }] }
    };
    const unsafeRecord: Record = {
        id: '2',
        text: 'unsafe content',
        createdAt: '',
        labels: { values: [{ val: 'gore' }] }
    };

    expect(isSafe(safeRecord)).toBe(true);
    expect(isSafe(unsafeRecord)).toBe(false);
});

test('isFromMio filter', () => {
    const mioRecord: Record = {
        id: '1',
        text: 'content from Mio',
        createdAt: '',
        didid: 'did:plc:t3cnljy5vtnapjyhrnayypo3'
    };
    const otherRecord: Record = {
        id: '2',
        text: 'content from someone else',
        createdAt: '',
        didid: 'did:plc:other'
    };

    expect(isFromMio(mioRecord)).toBe(true);
    expect(isFromMio(otherRecord)).toBe(false);
});

test('hasMioRelatedWord filter', () => {
    const relatedWordRecord: Record = {
        id: '1',
        text: 'This text contains ミオしゃ',
        createdAt: ''
    };
    const unrelatedWordRecord: Record = {
        id: '2',
        text: 'This text does not contain related words',
        createdAt: ''
    };

    expect(hasMioRelatedWord(relatedWordRecord)).toBe(true);
    expect(hasMioRelatedWord(unrelatedWordRecord)).toBe(false);
});

test('hasMioRelatedTags filter', () => {
    const relatedTagRecord: Record = {
        id: '1',
        text: 'This text',
        createdAt: '',
        tags: ['ミオかわいい']
    };
    const unrelatedTagRecord: Record = {
        id: '2',
        text: 'This text',
        createdAt: '',
        tags: ['unrelated']
    };

    expect(hasMioRelatedTags(relatedTagRecord)).toBe(true);
    expect(hasMioRelatedTags(unrelatedTagRecord)).toBe(false);
});

test('MioFilter chain', () => {
    const mioRecord: Record = {
        id: '1',
        text: 'content from Mio shoule be ok',
        createdAt: '',
        didid: 'did:plc:t3cnljy5vtnapjyhrnayypo3'
    };
    const safeRelatedWordRecord: Record = {
        id: '2',
        text: 'text containing ミオしゃ should be ok',
        createdAt: '',
    };
    const unsafeRecord: Record = {
        id: '3',
        text: 'text containing ミオしゃ but unsafe should be filtered out',
        createdAt: '',
        labels: { values: [{ val: 'gore' }] }
    };
    const relatedTagRecord: Record = {
        id: '4',
        text: 'tags containing ミオかわいい should be ok',
        createdAt: '',
        tags: ['ミオかわいい'],
        labels: { values: [{ val: 'safe' }] }
    };
    const unrelatedRecord: Record = {
        id: '5',
        text: 'non related content should be filtered out',
        createdAt: '',
        labels: { values: [{ val: 'safe' }] }
    };

    expect(MioFilter.apply(mioRecord)).toBe(true);
    expect(MioFilter.apply(safeRelatedWordRecord)).toBe(true);
    expect(MioFilter.apply(unsafeRecord)).toBe(false);
    expect(MioFilter.apply(relatedTagRecord)).toBe(true);
    expect(MioFilter.apply(unrelatedRecord)).toBe(false);
});
