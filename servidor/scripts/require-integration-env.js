const missing = ['MONGODB_TEST_URI', 'MONGODB_TEST_DATABASE'].filter((name) => !process.env[name]?.trim())

if (missing.length > 0) {
  console.error(`Faltan variables para integración real: ${missing.join(', ')}.`)
  process.exitCode = 1
}
