const test = require('ava');

const {handler} = require('..');

test.cb('Hello world, handler', t => {
  handler({}, {}, (err, res) => {
    t.falsy(err);
    t.truthy(/hello/i.test(res));
    t.end();
  });
});
