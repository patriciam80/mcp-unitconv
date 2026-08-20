import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, dimensionOf, supportedUnits } from '../src/units.ts';

function close(actual: number, expected: number, eps = 1e-9): void {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ${actual} to be within ${eps} of ${expected}`,
  );
}

test('length conversion', () => {
  assert.equal(convert(1, 'km', 'm').value, 1000);
  assert.equal(convert(100, 'cm', 'm').value, 1);
  close(convert(1, 'mi', 'ft').value, 5280);
  close(convert(12, 'in', 'ft').value, 1);
});

test('mass conversion', () => {
  assert.equal(convert(1, 'kg', 'g').value, 1000);
  close(convert(1, 'lb', 'kg').value, 0.45359237);
  close(convert(16, 'oz', 'lb').value, 1, 1e-6);
});

test('time conversion', () => {
  assert.equal(convert(1, 'h', 's').value, 3600);
  assert.equal(convert(1, 'd', 'h').value, 24);
  assert.equal(convert(1000, 'ms', 's').value, 1);
});

test('temperature conversion', () => {
  assert.equal(convert(100, 'C', 'F').value, 212);
  assert.equal(convert(32, 'F', 'C').value, 0);
  close(convert(0, 'C', 'K').value, 273.15);
  close(convert(273.15, 'K', 'C').value, 0);
});

test('conversion result carries dimension and unit labels', () => {
  const result = convert(1, 'km', 'm');
  assert.equal(result.dimension, 'length');
  assert.equal(result.from, 'km');
  assert.equal(result.to, 'm');
});

test('round trip returns the original value', () => {
  close(convert(convert(37, 'C', 'F').value, 'F', 'C').value, 37);
  close(convert(convert(5, 'mi', 'km').value, 'km', 'mi').value, 5);
});

test('rejects mismatched dimensions', () => {
  assert.throws(() => convert(1, 'km', 'kg'));
});

test('rejects unknown units', () => {
  assert.throws(() => convert(1, 'furlong', 'm'));
  assert.throws(() => convert(1, 'm', 'furlong'));
});

test('rejects non-finite values', () => {
  assert.throws(() => convert(NaN, 'm', 'km'));
  assert.throws(() => convert(Infinity, 'm', 'km'));
});

test('dimensionOf finds length, mass and time units but not temperature', () => {
  assert.equal(dimensionOf('m'), 'length');
  assert.equal(dimensionOf('kg'), 'mass');
  assert.equal(dimensionOf('s'), 'time');
  // temperature is handled separately in convert(), so it has no entry in FACTORS
  assert.equal(dimensionOf('C'), null);
  assert.equal(dimensionOf('nope'), null);
});

test('supportedUnits lists every convertible unit once', () => {
  const units = supportedUnits();
  assert.equal(new Set(units).size, units.length);
  for (const unit of ['m', 'km', 'kg', 'lb', 's', 'h', 'C', 'F', 'K']) {
    assert.ok(units.includes(unit), `missing ${unit}`);
  }
});
