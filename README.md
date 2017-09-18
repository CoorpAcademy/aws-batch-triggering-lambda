AWS Batch Triggering Lambda
===========================

[![Build Status](https://travis-ci.org/CoorpAcademy/aws-batch-triggering-lambda.svg)](https://travis-ci.org/CoorpAcademy/aws-batch-triggering-lambda)
[![codecov](https://codecov.io/gh/CoorpAcademy/aws-batch-triggering-lambda/branch/master/graph/badge.svg)](https://codecov.io/gh/CoorpAcademy/aws-batch-triggering-lambda)

> Lambda to trigger AWS Batch Jobs

This Lambda is to trigger a job on AWS batch from a Lambda.

This lambda can be triggered by a standard event (from a cloudwatch cron for instance, and a lambda call)
, by a kinesis message or by a SNS message.
