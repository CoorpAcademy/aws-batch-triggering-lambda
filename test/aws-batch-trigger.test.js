const test = require('ava');
const LambdaTester = require('lambda-tester');

const {handler} = require('..');

test.beforeEach(t => {
  t.context.lambda = LambdaTester(handler);
});

test('Hello world, handler', t => {
  return t.context.lambda.event({}).expectResult(res => {
    t.truthy(/hello/i.test(res));
  });
});
