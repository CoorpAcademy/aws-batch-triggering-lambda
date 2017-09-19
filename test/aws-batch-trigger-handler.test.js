const test = require('ava');

const {
  handleKinesisRecord,
  handleSnsRecord,
  handleAwsTrigger,
  activatedEventSources
} = require('..');

const jobDef = {
  jobDefinition: 'bricklane-assign-cluster-staging-job',
  jobQueue: 'progression-job-staging-queue',
  jobName: 'test-from-lambda-via-sns'
};

test('handleAwsTrigger KO more than one record', t => {
  t.throws(
    () => handleAwsTrigger([]),
    'Invalid payload format. 0 records. must contain single item.'
  );
  t.throws(
    () => handleAwsTrigger([1, 2]),
    'Invalid payload format. 2 records. must contain single item.'
  );
});

test('handleAwsTrigger KO unsupported Event Source', t => {
  t.throws(() => handleAwsTrigger([{eventSource: 'yolo'}]), 'Event source yolo not supported');
  t.throws(() => handleAwsTrigger([{EventSource: 'yolo'}]), 'Event source yolo not supported');
});

test('handleAwsTrigger KO deactivated Event Source', t => {
  const deactivatedEventSource = activatedEventSources.pop();
  t.throws(
    () => handleAwsTrigger([{eventSource: deactivatedEventSource}]),
    `Event source ${deactivatedEventSource} not supported`
  );
  t.throws(
    () => handleAwsTrigger([{EventSource: deactivatedEventSource}]),
    `Event source ${deactivatedEventSource} not supported`
  );
  activatedEventSources.push(deactivatedEventSource);
});

test('handleKinesisRecord OK', t => {
  const kinesisRecord = {
    eventID: 'shardId-000000000000:49545115243490985018280067714973144582180062593244200961',
    eventVersion: '1.0',
    kinesis: {
      approximateArrivalTimestamp: 1428537600,
      partitionKey: 'partitionKey-3',
      data: Buffer.from(JSON.stringify(jobDef)).toString('base64'),
      kinesisSchemaVersion: '1.0',
      sequenceNumber: '49545115243490985018280067714973144582180062593244200961'
    },
    invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
    eventName: 'aws:kinesis:record',
    eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
    eventSource: 'aws:kinesis',
    awsRegion: 'us-east-1'
  };
  t.deepEqual(handleKinesisRecord(kinesisRecord), jobDef);
});

test('handleKinesisRecord KO', t => {
  const kinesisRecord = {
    eventID: 'shardId-000000000000:49545115243490985018280067714973144582180062593244200961',
    eventVersion: '1.0',
    kinesis: {
      approximateArrivalTimestamp: 1428537600,
      partitionKey: 'partitionKey-3',
      data: Buffer.from('NOT A JSON').toString('base64'),
      kinesisSchemaVersion: '1.0',
      sequenceNumber: '49545115243490985018280067714973144582180062593244200961'
    },
    invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
    eventName: 'aws:kinesis:record',
    eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
    eventSource: 'aws:kinesis',
    awsRegion: 'us-east-1'
  };
  t.throws(() => handleKinesisRecord(kinesisRecord), 'Kinesis Payload is not a json');
});

test('handleSnsRecord OK', t => {
  const snsRecord = {
    EventVersion: '1.0',
    EventSubscriptionArn: 'arn:aws:sns:EXAMPLE',
    EventSource: 'aws:sns',
    Sns: {
      SignatureVersion: '1',
      Timestamp: '1970-01-01T00:00:00.000Z',
      Signature: 'EXAMPLE',
      SigningCertUrl: 'EXAMPLE',
      MessageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
      Message: JSON.stringify(jobDef),
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
  };
  t.deepEqual(handleSnsRecord(snsRecord), jobDef);
});

test('handleSnsRecord KO', t => {
  const snsRecord = {
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
  };
  t.throws(() => handleSnsRecord(snsRecord), 'SNS Payload is not a json');
});
