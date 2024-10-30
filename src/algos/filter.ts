import { Record } from '../lexicon/types/app/bsky/feed/post';

export type Filter = (record: Record) => boolean;

export interface FilterChain {
  apply(record: Record): boolean;
}

const dangerousLabels = [
  "gore", // グロ
  "graphic-media", // グロ
  "nudity", // R18
];

const relatedWords = ["ミオしゃ", "大神ミオ"];
const relatedTags = ["ミオかわいい", "みおーん絵", "朝ミオ", "朝ミオおたより"];

export const isSafe: Filter = (record: Record): boolean => {
  return !(record.labels && Array.isArray(record.labels.values) && record.labels.values.some((label: any) => dangerousLabels.includes(label.val)));
};

export const isFromMio: Filter = (record: Record): boolean => {
  // https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=ookamimio.hololive.tv
  return record.didid === 'did:plc:t3cnljy5vtnapjyhrnayypo3'; 
};

export const hasMioRelatedWord: Filter = (record: Record): boolean => {
  return relatedWords.some(word => record.text.includes(word));
};

export const hasMioRelatedTags: Filter = (record: Record): boolean => {
  return !!record.tags && record.tags.some(tag => relatedTags.includes(tag));
};

const isReply = (record: Record): boolean => {
  return record.reply !== undefined;
};

export const MioFilter = new class implements FilterChain {
  apply(record: Record): boolean {
    return isFromMio(record) || // 大神ミオのアカウントからの投稿はすべて通過させる
      (isSafe(record) && ( // 前提として、安全な投稿であること
        (hasMioRelatedWord(record) && !isReply(record)) // ミオに関連する単語が含まれている(が、ノイジーになるのでリプライは除去)
          || hasMioRelatedTags(record) // ミオに関連するタグが含まれているか
      ));
  }
};
