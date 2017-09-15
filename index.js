const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const batch = new AWS.Batch({apiVersion: '2016-08-10'});

  const jobDefinition = event;
  batch.submitJob(jobDefinition, (err, res) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    console.log(`Job ${res.jobName} launched with id ${res.jobId}`);
    return callback(null, res);
  });
};
