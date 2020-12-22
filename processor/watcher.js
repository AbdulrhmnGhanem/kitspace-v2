const chokidar = require('chokidar')
const cp = require('child_process')
const debounce = require('lodash.debounce')
const fs = require('fs')
const path = require('path')
const util = require('util')
const jsYaml = require('js-yaml')

const processGerbers = require('./tasks/processGerbers')

const exec = util.promisify(cp.exec)
const readFile = util.promisify(fs.readFile)
const accessPromise = util.promisify(fs.access)

function watch() {
  chokidar.watch('/repositories/*/*').on('addDir', gitDir => {
    const debouncedRun = debounce(() => run(gitDir), 1000)
    chokidar.watch(gitDir).on('all', debouncedRun)
  })
}

async function run(gitDir) {
  const name = path.relative('/repositories', gitDir).slice(0, -4)
  const checkoutDir = path.join('/data/checkout', name)

  await sync(gitDir, checkoutDir)

  const filePaths = ['kitspace.yaml', 'kitspace.yml'].map(p =>
    path.join(checkoutDir, p),
  )
  const yamlFile = await Promise.all(
    filePaths.map(tryReadFile),
  ).then(([yaml, yml]) => (yaml ? yaml : yml))
  const kitspaceYaml = jsYaml.safeLoad(yamlFile) || {}

  const hash = await getGitHash(checkoutDir)
  const filesDir = path.join('/data/files', name, hash)

  const files = processGerbers(checkoutDir, kitspaceYaml.gerbers, kitspaceYaml.color, filesDir)

  for await (const f of files) {
    console.log({f})
  }
  const headDir = path.join('/data/files', name, 'HEAD')

  await exec(`rm -r '${headDir}' && ln -s --relative '${filesDir}' '${headDir}'`)
  console.log(`linked '${filesDir}' to '${headDir}'`)
}

async function getGitHash(checkoutDir) {
  const { stdout } = await exec(`cd '${checkoutDir}' && git rev-parse HEAD`)
  return stdout.slice(0, -1)
}

function tryReadFile(filePath) {
  return readFile(filePath).catch(err => {
    // just return an empty string if the file doesn't exist
    if (err.code === 'ENOENT') {
      return ''
    }
    throw err
  })
}

async function sync(gitDir, checkoutDir) {
  if (await exists(checkoutDir)) {
    await exec(`cd ${checkoutDir} && git pull`).catch(err => {
      // repos with no branches yet will create this error
      if (
        err.stderr ===
        "Your configuration specifies to merge with the ref 'refs/heads/master'\nfrom the remote, but no such ref was fetched.\n"
      ) {
        console.warn('repo without any branches', checkoutDir)
        return err
      } else {
        throw err
      }
    })
    console.log('pulled into', checkoutDir)
  } else {
    await exec(`git clone ${gitDir} ${checkoutDir}`)
    console.log('cloned into', checkoutDir)
  }
}

function exists(file) {
  return accessPromise(file, fs.constants.F_OK)
    .then(x => x == null)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return false
      } else {
        throw err
      }
    })
}

module.exports = { watch }
