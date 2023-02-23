import { ToadScheduler, AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import { PostModel } from '../model/post.js';
import { cachedPostIds } from '../handler/post.js';

const scheduler = new ToadScheduler();

const task = new AsyncTask(
  'ViewCounter',
  async () => {
    return PostModel.updateMany(
      { _id: { $in: [...cachedPostIds.keys()] } },
      { $set: { viewCount: cachedPostIds.get('$_id') } },
      { lean: true }
    ).exec().then(() => {
      for (const id of cachedPostIds.keys()) {
        cachedPostIds.delete(id)
      }
    }).catch((err) => {
      throw new Error(err);
    });
  },
  (err) => {
    return console.error('Toad scheduler', err)
  }
);

const job1 = new SimpleIntervalJob(
	{ minutes: 10, runImmediately: false },
	task,
  { id: 'id1', preventOverrun: true }
);

scheduler.addSimpleIntervalJob(job1);
