const test = require('ava');

const {validateAndExtractRequest, validateString} = require('..');

test('validateAndExtractRequest extract args', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: 'test-job'
  };
  t.deepEqual(req, validateAndExtractRequest(req));
});
test.todo('validateAndExtractRequest detect missing args');
test.todo('validateAndExtractRequest detect wrong type args');
test.todo('validateAndExtractRequest leave out other args');
