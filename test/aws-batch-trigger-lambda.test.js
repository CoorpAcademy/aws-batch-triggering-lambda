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
    .event({jobName: 'test', jobQueue: 'queue', jobDefinition: 'jobdef'})
    .expectError(err => t.deepEqual(err.message, 'BOOM'));
});

test('failing AWS Batch', t => {
  const event = {
    Records: [
      {
        EventVersion: '1.0',
        EventSubscriptionArn: 'arn:aws:sns:EXAMPLE',
        EventSource: 'aws:sns',
        Sns: {
          SignatureVersion: '1',
          Timestamp: '1970-01-01T00:00:00.000Z',
          Signature: 'EXAMPLE',
          SigningCertUrl: 'EXAMPLE',
          MessageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
          Message: 'NOT A JSON',
          MessageAttributes: {
            Test: {
              Type: 'String',
              Value: 'TestString'
            },
            TestBinary: {
              Type: 'Binary',
              Value: 'TestBinary'
            }
          },
          Type: 'Notification',
          UnsubscribeUrl: 'EXAMPLE',
          TopicArn: 'arn:aws:sns:EXAMPLE',
          Subject: 'TestInvoke'
        }
      }
    ]
  };

  mockSubmitJob((param, cb) => cb(null, param));
  return t.context.lambda
    .event(event)
    .expectError(err => t.deepEqual(err.message, 'SNS Payload is not a json'));
});

test('working AWS Batch', t => {
  mockSubmitJob((param, cb) => cb(null, {jobName: 'test', jobId: 'id'}));
  return t.context.lambda
    .event({jobName: 'test', jobQueue: 'queue', jobDefinition: 'jobdef'})
    .expectResult(res => t.deepEqual(res, {jobName: 'test', jobId: 'id'}));
});
