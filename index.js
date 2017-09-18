const AWS = require('aws-sdk');

const knowEventSources = ['aws:sns', 'aws:kinesis'];

exports.handler = (event, context, callback) => {
  const batch = new AWS.Batch({apiVersion: '2016-08-10'});
  let jobRequest;
  try {
    jobRequest = parseEvent(event);
  } catch (err) {
    console.error(err);
    return callback(err);
  }

  batch.submitJob(jobRequest, (err, res) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    console.log(`Job ${res.jobName} launched with id ${res.jobId}`);
    return callback(null, res);
  });
};

const parseEvent = event => {
  let request;
  const records = event.Records;
  if(records) {
    if(records.length !== 1) {
      throw new Error(`Invalid payload format. ${records.length} records. must contain single item.`)
    }
    const record = records[0];
    if (record.eventSource === 'aws:kinesis') {
      request = handleKinesisRecord(record);
    } else if(record.EventSource === 'aws:sns') {
      request = handleSnsRecord(record);
    } else {
      throw new Error(`Event source ${record.eventSource || record.EventSource} not supported`);
    }
  } else {
    request = event;
  }
  //

  return request;
}

const handleKinesisRecord = record => {
  const payload = new Buffer(record.kinesis.data, 'base64').toString('utf-8')
  try {
    return JSON.parse(payload);
  } catch (err) {
    throw new Error('Kinesis Payload is not a json');
  }
};

const handleSnsRecord = record => {
  const payload = record.Sns.Message;
  try {
    return JSON.parse(payload);
  } catch (err) {
    throw new Error('SNS Payload is not a json');
  }
};
