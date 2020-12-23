const express = require('express')
const path = require('path')

const watcher = require('./watcher')

const fileStatus = {}
const links = {}

const eventEmitter = watcher.watch()

eventEmitter.on('link', (x, y) => {
  links[x] = y
  console.info('link', x, y)
})

eventEmitter.on('in_progress', x => {
  fileStatus[x] = { status: 'in_progress' }
  console.info('in_progress', x)
})

eventEmitter.on('done', x => {
  fileStatus[x] = { status: 'done' }
  console.info('done', x)
})

eventEmitter.on('failed', (x, e) => {
  fileStatus[x] = { status: 'failed', error: e }
  console.info('failed', x, e)
})

const app = express()
const port = 5000

const allowedDomains = process.env.ALLOWED_CORS_DOMAINS.split(',')

app.use((req, res, next) => {
  const origin = req.get('origin')
  if (!origin) {
    return next()
  }
  if (allowedDomains.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    return next()
  }
  return res.sendStatus(403)
})

const staticFiles = express.static('/data/')

app.get('/status/*', (req, res, next) => {
  let x = path.relative('/status/', req.path)
  if (x in links) {
    x = links[x]
  }
  if (x in fileStatus) {
    return res.send(fileStatus[x])
  }
  return res.sendStatus(404)
})

app.get('/files/*', (req, res, next) => {
  const x = path.relative('/files/', req.path)
  if (x in links) {
    return res.redirect(302, path.join('/files/', links[x]))
  }
  if (x in fileStatus) {
    if (fileStatus[x].status === 'in_progress') {
      return res.sendStatus(202)
    }
    if (fileStatus[x].status === 'done') {
      return staticFiles(req, res, next)
    }
    if (fileStatus[x].status === 'failed') {
      res.status(424)
      return res.send(fileStatus[x].error)
    }
  }
  return res.sendStatus(404)
})

app.listen(port, () => {
  console.info(`processor listening on http://localhost:${port}`)
})
