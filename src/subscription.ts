import { FilterChain, MioFilter } from './algos/filter';
import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {

  private filterChain: FilterChain;

  constructor(public db, public service, filterChain?: FilterChain) {
    super(db, service);
    this.filterChain = filterChain || MioFilter;
  }

  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return;
    const ops = await getOpsByType(evt);

    const postsToDelete = ops.posts.deletes.map((del) => del.uri);
    const prePostsToCreate = ops.posts.creates.filter((create) => this.filterChain.apply(create.record));

    const postsToCreate = prePostsToCreate
      .sort((a, b) => new Date(a.record.createdAt).getTime() - new Date(b.record.createdAt).getTime())
      .map((create) => ({
        uri: create.uri,
        cid: create.cid,
        createdAt: create.record.createdAt,
        indexedAt: new Date().toISOString(),
      }));

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute();
    }

    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => {
          return oc.doNothing();
        })
        .execute();
    }
  }
}
