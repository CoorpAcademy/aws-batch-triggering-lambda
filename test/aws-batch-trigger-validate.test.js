const test = require('ava');

const {
  validateAndExtractRequest,
  validateString,
  validatePattern,
  validateDependsOn,
  generateJobName,
  checkAuthorization
} = require('..');

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
  t.throws(
    () => validateAndExtractRequest(req),
    "WRONG KEY does not comply with pattern '/^[_.a-zA-Z][_.a-zA-Z0-9]+$/'"
  );
});

test('validateAndExtractRequest detect wrong parameters value', t => {
  const req = {
    jobDefinition: 'jobDef',
    jobQueue: 'job-queue',
    jobName: '42',
    parameters: {
      GOODKEY: '34',
      BADKEY: {a: 2}
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
  t.throws(
    () => validateString('toto', ' space in it', validateString.AWS_NAME),
    `toto does not comply with pattern '${validateString.AWS_NAME}'`
  );
  t.throws(
    () => validateString('toto', 'DASH-in-it', validateString.SHELL_VARIABLE),
    `toto does not comply with pattern '${validateString.SHELL_VARIABLE}'`
  );
});

test('generateJobName with jobName', t => {
  t.deepEqual('JN', generateJobName({jobName: 'JN'}));
});

test('generateJobName with jobPrefix', t => {
  t.truthy(
    /^JN--[0-9T-]+--[0-9a-f]{32}$/.test(generateJobName({jobNamePrefix: 'JN', jobDefinition: 'JD'}))
  );
});

test('generateJobName without jobPrefix', t => {
  t.truthy(/^JD--[0-9T-]+--[0-9a-f]{32}$/.test(generateJobName({jobDefinition: 'JD'})));
});

test('validate simple unique pattern', t => {
  const pattern = 'myprefix-.*';
  t.truthy(validatePattern(pattern, 'myprefix-isgood'));
  t.truthy(validatePattern(pattern, 'myprefix-isOK'));
  t.truthy(validatePattern(pattern, 'myprefix-is-super-green'));
  t.falsy(validatePattern(pattern, 'myprefixalone'));
  t.falsy(validatePattern(pattern, 'not-myprefix-followed'));
  t.falsy(validatePattern(pattern, 'this-is-super-red'));
});

test('validate simple unique pattern', t => {
  const pattern = '(t[io])+';
  t.truthy(validatePattern(pattern, 'to'));
  t.truthy(validatePattern(pattern, 'toto'));
  t.truthy(validatePattern(pattern, 'titi'));
  t.falsy(validatePattern(pattern, 'tata'));
  t.falsy(validatePattern(pattern, 'atoto'));
  t.falsy(validatePattern(pattern, 'oto'));
});

test('validate multipattern', t => {
  const multipattern = '(t[io])+;aws-.*';

  t.truthy(validatePattern(multipattern, 'toti'));
  t.truthy(validatePattern(multipattern, 'aws-lambda'));
  t.truthy(validatePattern(multipattern, 'titi'));
  t.falsy(validatePattern(multipattern, 'nimp'));
  t.falsy(validatePattern(multipattern, 'naws-nlambda'));
  t.falsy(validatePattern(multipattern, 'oto'));
});

test('checkAuthorization no restriction', t => {
  t.notThrows(() => checkAuthorization({
    jobDefinition: 'job', jobQueue: 'queue'
  }, {}));
});

test('checkAuthorization respected restriction', t => {
  t.notThrows(() => checkAuthorization({
    jobDefinition: 'job', jobQueue: 'queue'
  }, {AWS_BATCH_JOB_WHITELIST: 'j.b'}));
  t.notThrows(() => checkAuthorization({
    jobDefinition: 'job', jobQueue: 'queue'
  }, {AWS_BATCH_QUEUE_WHITELIST: 'q.*e'}));
});
test('checkAuthorization non respected restriction', t => {
  t.throws(() => checkAuthorization({
    jobDefinition: 'job', jobQueue: 'queue'
  }, {AWS_BATCH_JOB_WHITELIST: 'j[aeiu]b'}), 'JobDefinition job is not allowed');
  t.throws(() => checkAuthorization({
    jobDefinition: 'job', jobQueue: 'queue'
  }, {AWS_BATCH_QUEUE_WHITELIST: 'q.{2}e'}), 'JobQueue queue is not allowed');
});

test('validateDependsOn with normal dependsOn', t => {
  const don = [{jobId: '12'}, {jobId: '24'}];
  t.deepEqual(validateDependsOn(don), don)
});

test('validateDependsOn with extra info in dependsOn', t => {
  const don = [{jobId: '12', extra: 'information'}, {jobId: '24'}];
  t.deepEqual(validateDependsOn(don), [{jobId: '12'}, {jobId: '24'}])
});

test('validateDependsOn with missing jobId in dependsOn', t => {
  const don = [{extra: 'information'}, {jobId: '24'}];
  t.throws(() => validateDependsOn(don),
    'dependsOn job does not have jobId {"extra":"information"}')
});
