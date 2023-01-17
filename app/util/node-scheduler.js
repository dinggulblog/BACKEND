import { scheduleJob, RecurrenceRule, Range } from 'node-schedule';
import { DraftModel } from '../model/draft.js';

const rule = new RecurrenceRule();

rule.dayOfWeek = [new Range(0, 6)];
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
rule.tz = 'Asia/Seoul';

if (process.env.INSTANCE_ID === 0) {
  const job = scheduleJob(rule, async () => {
    try {
      console.log('A new daily node scheduler has begun!');
      const date = new Date(Date.now());
      const oneWeekAgo = date.getTime() - date.getTimezoneOffset() * 60 * 1000 - 1000 * 60 * 60 * 24 * 7;

      const drafts = await DraftModel.find(
        { createdAt: { $lt: oneWeekAgo } },
        { _id: 1 },
        { lean: true }
      ).exec();

      const deleted = await DraftModel.deleteMany(
        { _id: { $in: drafts.map(({ _id }) => _id) } },
        { lean: true }
      ).exec();

      console.log('\nLength of deleted draft: %d', drafts.length);
      console.log('Succesfully deleted Count: %d', deleted.deletedCount);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  });
}
