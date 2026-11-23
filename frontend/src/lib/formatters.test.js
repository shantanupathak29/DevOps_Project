import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatShortTime, normalizeStudentIdentifier } from './formatters.js';

describe('formatters', () => {
  describe('normalizeStudentIdentifier', () => {
    it('trims leading and trailing whitespace', () => {
      assert.strictEqual(normalizeStudentIdentifier('  STU123  '), 'stu123');
    });

    it('converts uppercase characters to lowercase', () => {
      assert.strictEqual(normalizeStudentIdentifier('STUDENT_ID'), 'student_id');
    });

    it('handles empty or undefined values gracefully', () => {
      assert.strictEqual(normalizeStudentIdentifier(''), '');
      assert.strictEqual(normalizeStudentIdentifier(undefined), '');
    });
  });

  describe('formatShortTime', () => {
    it('returns fallback "--" for falsy input', () => {
      assert.strictEqual(formatShortTime(null), '--');
      assert.strictEqual(formatShortTime(''), '--');
      assert.strictEqual(formatShortTime(undefined), '--');
    });

    it('returns fallback "--" for invalid date strings', () => {
      assert.strictEqual(formatShortTime('invalid-date'), '--');
    });

    it('formats a valid date or timestamp string', () => {
      const validDate = new Date('2026-01-01T10:30:00Z');
      const formatted = formatShortTime(validDate);
      assert.strictEqual(typeof formatted, 'string');
      assert.ok(formatted.length > 0 && formatted !== '--');
    });
  });
});
