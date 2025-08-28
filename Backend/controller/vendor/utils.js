const Counter = require('../../model/vendor/Counter');

async function getNextSeq(name) {
  const c = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return c.seq;
}
module.exports = { getNextSeq };
