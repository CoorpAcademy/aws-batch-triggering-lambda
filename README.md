AWS Batch Triggering Lambda
===========================

[![Build Status](https://travis-ci.org/CoorpAcademy/aws-batch-triggering-lambda.svg)](https://travis-ci.org/CoorpAcademy/aws-batch-triggering-lambda)
[![codecov](https://codecov.io/gh/CoorpAcademy/aws-batch-triggering-lambda/branch/master/graph/badge.svg)](https://codecov.io/gh/CoorpAcademy/aws-batch-triggering-lambda)

> Lambda to trigger AWS Batch Jobs

## About
This Node Lambda is to trigger a job on *AWS batch* from a Lambda.

This lambda can be triggered by a standard event (from a **CloudWatch** cron for instance, and a lambda call)
, by a **kinesis** message or by a **SNS** message.

## Usage

The lambda expect the following payload:

```json
{
  "jobDefinition": "the-job-definition",
  "jobQueue": "the-job-queue",
  "jobName": "the-job-name",
  "parameters": {
     "some": "optional parameter"
  }
}
```

This can be transmitted through the event, or an Kinesis/Sns event.

`jobDefinition`, `jobQueue` parameters are mandatory.
`parameters` object is optional.

A `jobName` would be added based on the following logic :

- `jobName` if such key exist
- `jobNamePrefix` if defined followed by a date and a random string
- `jobDefinition` otherwise followed by a date and a random string

For the two last option name would look like this:
`test-from-lambda-via-sns--2017-09-21T13-28-55--f6c83928fa175106ea35fd0ff31068e6`

The lambda will respond with either an error (and reason why) or
a json with the following format:

```json
{
  "jobName": "the-job-name",
  "jobId": "b3e985b1-e02a-41c9-ac8f-4801e04c9a27-whatever"
}
```

## Configuration
You can customize the lambda through environment variable to enable or not the
supported *event Sources*:

- `aws:sns`: SNS triggers
- `aws:kinesis`: Kinesis triggers

To do so, use either `AWS_BATCH_TRIGGER_ENABLE` and `AWS_BATCH_TRIGGER_DISABLE`
that accept a `;` separated whitelist/blacklist.

It's also possible to restrict the jobs and/or the queue on which the job can be invocated.
To do so, use the `AWS_BATCH_JOB_WHITELIST` and `AWS_BATCH_QUEUE_WHITELIST` which accept
a `;` separated list of pattern (without the `^` and `$` at the extremities).
(for instance `job-queue;staging-.*queue`)
