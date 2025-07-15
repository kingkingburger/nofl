import { test, expect, afterAll } from 'vitest'
import { app } from 'electron'

test('should not throw', () => {
  expect(() => require('./index')).not.toThrow()
})

afterAll(() => {
  app.quit()
})
