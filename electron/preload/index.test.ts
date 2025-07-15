import { test, expect } from 'vitest'

test('should not throw', () => {
  expect(() => require('./index')).not.toThrow()
})
