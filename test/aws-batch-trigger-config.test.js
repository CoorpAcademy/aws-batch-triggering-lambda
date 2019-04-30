const test = require('ava');

const {getActivatedEventSources} = require('..');

test('getActivatedEventSources with default config', t => {
  t.deepEqual(getActivatedEventSources(['ab', 'cd'], {}), ['ab', 'cd']);
});

test('getActivatedEventSources with enable config', t => {
  t.deepEqual(
    getActivatedEventSources(['ab', 'cd'], {
      AWS_BATCH_TRIGGER_ENABLE: 'ab'
    }),
    ['ab']
  );
});

test('getActivatedEventSources with enable config empty', t => {
  t.deepEqual(
    getActivatedEventSources(['ab', 'cd'], {
      AWS_BATCH_TRIGGER_ENABLE: ''
    }),
    []
  );
});

test('getActivatedEventSources with enable config and non supported type', t => {
  t.deepEqual(
    getActivatedEventSources(['ab', 'cd'], {
      AWS_BATCH_TRIGGER_ENABLE: 'ab;cd;ef'
    }),
    ['ab', 'cd']
  );
});

test('getActivatedEventSources with disable config (complete)', t => {
  t.deepEqual(
    getActivatedEventSources(['ab', 'cd', 'ef'], {
      AWS_BATCH_TRIGGER_DISABLE: 'ab;cd;ef'
    }),
    []
  );
});

test('getActivatedEventSources with disable config (partial)', t => {
  t.deepEqual(
    getActivatedEventSources(['ab', 'cd', 'ef'], {
      AWS_BATCH_TRIGGER_DISABLE: 'ab;cd'
    }),
    ['ef']
  );
});
