const test = require('node:test')
const assert = require('node:assert/strict')
const { buildAuthEmail, buildAuthPassword } = require('./bootstrap')

test('buildAuthEmail creates a valid email from a phone number', () => {
  const email = buildAuthEmail('+8801712345678')
  assert.match(email, /^bloodlink\+8801712345678@bloodlink\.local$/)
})

test('buildAuthPassword creates a password from a phone number', () => {
  const password = buildAuthPassword('+8801712345678')
  assert.ok(password.length >= 12)
  assert.match(password, /[A-Z]/)
  assert.match(password, /[0-9]/)
})
