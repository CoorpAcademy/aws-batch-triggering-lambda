const test = require('ava');

const {validateAndExtractRequest, validateString} = require('..');

test('validateAndExtractRequest extract args', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: 'test-job',
    parameters: {
      param: 'setting'
    }
  };
  t.deepEqual(req, validateAndExtractRequest(req));
});

test('validateAndExtractRequest detect missing args', t => {
  const req = {
    jobDefinition: 'jobDef'
  };
  t.throws(() => validateAndExtractRequest(req), 'jobQueue key is not defined');
});

test('validateAndExtractRequest detect wrong type args', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: 42
  };
  t.throws(() => validateAndExtractRequest(req), 'jobName key is not a string');
});

test('validateAndExtractRequest detect wrong parameters key', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: '42',
    parameters: {
      'WRONG KEY': '34'
    }
  };
  t.throws(() => validateAndExtractRequest(req), 'WRONG KEY does not comply with pattern \'/^[_.a-zA-Z][_.a-zA-Z0-9]+$/\'');
});

test('validateAndExtractRequest detect wrong parameters value', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: '42',
    parameters: {
      'GOODKEY': '34',
      'BADKEY': {a: 2}
    }
  };
  t.throws(() => validateAndExtractRequest(req), 'BADKEY key is not a string');
});

test('validateAndExtractRequest leave out other args', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: 'test-job',
    extraArg: 'Et oué'
  };
  t.deepEqual(validateAndExtractRequest(req), {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: 'test-job'
  });
});

test('validate string throw error if not a string', t => {
  t.throws(() => validateString('key', 40.12), 'key key is not a string');
});

test('validate string throw error if undefined', t => {
  t.throws(() => validateString('toto'), 'toto key is not defined');
});

test('validate string support empty string', t => {
  t.deepEqual(validateString('toto', ''), '');
});

test('validate string support check str pattern', t => {
  t.throws(() => validateString('toto', ' space in it', validateString.AWS_NAME),
    `toto does not comply with pattern '${validateString.AWS_NAME}'`);
  t.throws(() => validateString('toto', 'DASH-in-it', validateString.SHELL_VARIABLE),
    `toto does not comply with pattern '${validateString.SHELL_VARIABLE}'`);
});
