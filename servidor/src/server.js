import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createApp } from './app.js'
import { loadEnvironment } from './config/environment.js'

export function startServer({ config = loadEnvironment(), logger = console } = {}) {
  const app = createApp({ config, logger })
  const server = app.listen(config.port, config.host, () => {
    logger.info(`Innovation Hub API disponible en http://${config.host}:${config.port}.`)
  })

  let stopping = false
  const shutdown = () => new Promise((resolveShutdown, rejectShutdown) => {
    if (stopping || !server.listening) {
      resolveShutdown()
      return
    }
    stopping = true
    server.close((error) => {
      if (error) rejectShutdown(error)
      else resolveShutdown()
    })
  })

  async function stopFromSignal(signal) {
    logger.info(`Señal ${signal} recibida; cerrando el servidor HTTP.`)
    try {
      await shutdown()
    } catch {
      logger.error('No fue posible cerrar el servidor HTTP limpiamente.')
      process.exitCode = 1
    }
  }

  const signalHandlers = new Map(
    ['SIGINT', 'SIGTERM'].map((signal) => {
      const handler = () => stopFromSignal(signal)
      process.once(signal, handler)
      return [signal, handler]
    }),
  )

  server.once('close', () => {
    signalHandlers.forEach((handler, signal) => process.removeListener(signal, handler))
  })

  return { app, server, shutdown }
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  try {
    startServer()
  } catch (error) {
    console.error(`No fue posible iniciar Innovation Hub API: ${error.message}`)
    process.exitCode = 1
  }
}
