const AWS = require('aws-sdk');

const parseEvent = event => {
  let request;
  const records = event.Records;
  if(records) {
    if(records.length !== 1) {
      return new Error(`Invalid payload format. ${records.length} records. must contain single item.`)
    }
    const record = records[0];
    if (record.eventSource === 'aws:kinesis') {
      const payload = new Buffer(record.kinesis.data, 'base64').toString('utf-8')
      try {
        request = JSON.parse(payload);
      } catch (err) {
        return new Error('Kinesis Payload is not a json');
      }
    } else if(record.EventSource === 'aws:sns') {
      const payload = record.Sns.Message;
      try {
        request = JSON.parse(payload);
      } catch (err) {
        return new Error('SNS Payload is not a json');
      }
    } else {
      return new Error(`Event source ${record.eventSource || record.EventSource} not supported`);
    }
  } else {
    request = event;
  }
  //

  return request;
}

exports.handler = (event, context, callback) => {
  const batch = new AWS.Batch({apiVersion: '2016-08-10'});

  const jobRequest = parseEvent(event);
  if (jobRequest instanceof Error) {
    console.error(jobRequest);
    return callback(jobRequest);
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
