const test = require('ava');
const AWS = require('aws-sdk-mock');
const LambdaTester = require('lambda-tester');

const {handler} = require('..');

const mockSubmitJob = mockFunction => AWS.mock('Batch', 'submitJob', mockFunction);

test.beforeEach(t => {
  t.context.lambda = LambdaTester(handler);
});
test.afterEach(t => {
  AWS.restore('Batch', 'submitJob');
});

test('Broken AWS Batch', t => {
  mockSubmitJob((param, cb) => cb(new Error('BOOM')));
  return t.context.lambda
    .event({jobName: 'test', jobQueue: 'queue', jobDefinition: ' jobdef'})
    .expectError(err => t.deepEqual(err.message, 'BOOM'));
});

test('working AWS Batch', t => {
  mockSubmitJob((param, cb) => cb(null, {jobName: 'test', jobId: 'id'}));
  return t.context.lambda
    .event({jobName: 'test', jobQueue: 'queue', jobDefinition: ' jobdef'})
    .expectResult(res => t.deepEqual(res, {jobName: 'test', jobId: 'id'}));
});
