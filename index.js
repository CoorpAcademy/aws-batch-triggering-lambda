const AWS = require('aws-sdk');

const handler = (event, context, callback) => {
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
  const request = event.Records ? handleAwsTrigger(event.Records) : event;
  return validateAndExtractRequest(request);
};

const handleAwsTrigger = records => {
  if (records.length !== 1) {
    throw new Error(`Invalid payload format. ${records.length} records. must contain single item.`);
  }
  const record = records[0];
  const eventSource = record.eventSource || record.EventSource;

  if (!supportedEventSources.includes(eventSource)) {
    throw new Error(`Event source ${eventSource} not supported`);
  }

  return eventSourceHandlers[eventSource](record);
};

const validateAndExtractRequest = request => {
  const req = {};
  req.jobDefinition = validateString(request.jobDefinition);
  req.jobQueue = validateString(request.jobQueue);
  req.jobName = validateString(request.jobName);
  return req;
};

const validateString = str => {
  return str;
};

const handleKinesisRecord = record => {
  const payload = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
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

const eventSourceHandlers = {
  'aws:kinesis': handleKinesisRecord,
  'aws:sns': handleSnsRecord
};
const supportedEventSources = Object.keys(eventSourceHandlers);

// export for tests reasons
module.exports = {
  eventSourceHandlers,
  supportedEventSources,
  handleSnsRecord,
  handleKinesisRecord,
  validateAndExtractRequest,
  validateString,
  handleAwsTrigger,
  parseEvent,
  handler
};
