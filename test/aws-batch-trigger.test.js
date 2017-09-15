const test = require('ava');
const LambdaTester = require('lambda-tester');

const {handler} = require('..');

test.beforeEach(t => {
  t.context.lambda = LambdaTester(handler);
});

test('Hello world, handler', t => {
  t.truthy('Mocking to be set up');
});
