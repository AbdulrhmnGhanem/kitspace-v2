const fs = require('fs')
const globule = require('globule')
const path = require('path')
const cp = require('child_process')
const Jszip = require('jszip')
const util = require('util')

const exec = util.promisify(cp.exec)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const gerberFiles = require('./gerber_files')
const boardBuilder = require('./board_builder')

const topSvgPath = 'images/top.svg'
const bottomSvgPath = 'images/bottom.svg'
// TODO name the zip properly
const zipPath = 'gerbers.zip'
const zipInfoPath = 'zip-info.json'
const topPngPath = 'images/top.png'
const topLargePngPath = 'images/top-large.png'
const topMetaPngPath = 'images/top-meta.png'
const topWithBgndPath = 'images/top-with-background.png'

async function processGerbers(eventEmitter, inputDir, kitspaceYaml, outputDir) {
  eventEmitter.emit('in_progress', topSvgPath)
  eventEmitter.emit('in_progress', bottomSvgPath)
  eventEmitter.emit('in_progress', zipPath)
  eventEmitter.emit('in_progress', zipInfoPath)
  eventEmitter.emit('in_progress', topPngPath)
  eventEmitter.emit('in_progress', topLargePngPath)
  eventEmitter.emit('in_progress', topMetaPngPath)
  eventEmitter.emit('in_progress', topWithBgndPath)

  const failAll = e => {
    eventEmitter.emit('failed', topSvgPath, e)
    eventEmitter.emit('failed', bottomSvgPath, e)
    eventEmitter.emit('failed', zipPath, e)
    eventEmitter.emit('failed', zipInfoPath, e)
    eventEmitter.emit('failed', topPngPath, e)
    eventEmitter.emit('failed', topLargePngPath, e)
    eventEmitter.emit('failed', topMetaPngPath, e)
    eventEmitter.emit('failed', topWithBgndPath, e)
  }

  try {
    const gerberDir = kitspaceYaml.gerbers || ''
    const color = kitspaceYaml.color || 'green'

    const files = globule.find(path.join(inputDir, '**'))

    let gerbers = gerberFiles(files, path.join(inputDir, gerberDir))
    if (gerbers.length === 0) {
      gerbers = await plotKicad(inputDir, files, kitspaceYaml)
    }

    await exec('mkdir -p ' + path.join(outputDir, 'images'))

    const stackupData = []
    const folderName = path.basename(zipPath, '.zip')

    const zip = new Jszip()

    for (const gerberPath of gerbers) {
      const data = await readFile(gerberPath, { encoding: 'utf8' })
      stackupData.push({ filename: path.basename(gerberPath), gerber: data })
      zip.file(path.join(folderName, path.basename(gerberPath)), data)
    }

    zip
      .generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      })
      .then(content => writeFile(path.join(outputDir, zipPath), content))
      .then(() => eventEmitter.emit('done', zipPath))
      .catch(e => eventEmitter.emit('failed', zipPath, e))

    const stackup = await boardBuilder(stackupData, color)

    if (stackup == null) {
      return
    }

    writeFile(path.join(outputDir, bottomSvgPath), stackup.bottom.svg)
      .then(() => {
        eventEmitter.emit('done', bottomSvgPath)
      })
      .catch(e => eventEmitter.emit('failed', bottomSvgPath, e))

    const zipInfo = {
      zipPath: path.basename(zipPath),
      folder: path.relative('build/', path.dirname(zipPath)),
      width: Math.max(stackup.top.width, stackup.bottom.width),
      height: Math.max(stackup.top.height, stackup.bottom.height),
      // copper layers - tcu, bcu, icu
      layers: stackup.layers.filter(layer => layer.type.includes('cu')).length,
    }
    if (stackup.top.units === 'in') {
      if (stackup.bottom.units !== 'in') {
        throw new Error(`We got a weird board with disparate units: ${inputDir}`)
      }
      zipInfo.width *= 25.4
      zipInfo.height *= 25.4
    }
    zipInfo.width = Math.ceil(zipInfo.width)
    zipInfo.height = Math.ceil(zipInfo.height)

    writeFile(path.join(outputDir, zipInfoPath), JSON.stringify(zipInfo))
      .then(() => eventEmitter.emit('done', zipInfoPath))
      .catch(e => eventEmitter.emit('failed', zipInfoPath, e))

    await writeFile(path.join(outputDir, topSvgPath), stackup.top.svg)
      .then(() => eventEmitter.emit('done', topSvgPath))
      .catch(e => eventEmitter.emit('failed', topSvgPath, e))

    let cmd = `inkscape --without-gui '${path.join(outputDir, topSvgPath)}'`
    cmd += ` --export-png='${path.join(outputDir, topPngPath)}'`
    if (stackup.top.width > stackup.top.height + 0.05) {
      cmd += ' --export-width=240'
    } else {
      cmd += ' --export-height=180'
    }
    exec(cmd)
      .then(() => eventEmitter.emit('done', topPngPath))
      .catch(e => eventEmitter.emit('failed', topPngPath, e))

    let cmd_large = `inkscape --without-gui '${path.join(outputDir, topSvgPath)}'`
    cmd_large += ` --export-png='${path.join(outputDir, topLargePngPath)}'`
    if (stackup.top.width > stackup.top.height + 0.05) {
      cmd_large += ` --export-width=${240 * 3 - 128}`
    } else {
      cmd_large += ` --export-height=${180 * 3 - 128}`
    }
    exec(cmd_large)
      .then(() => eventEmitter.emit('done', topLargePngPath))
      .catch(e => eventEmitter.emit('failed', topLargePngPath, e))

    let cmd_meta = `inkscape --without-gui '${path.join(outputDir, topSvgPath)}'`
    cmd_meta += ` --export-png='${path.join(outputDir, topMetaPngPath)}'`
    const width = 900
    let height = 400
    const ratioW = width / stackup.top.width
    if (ratioW * stackup.top.height > height) {
      let ratioH = height / stackup.top.height
      while (ratioH * stackup.top.width > width) {
        height -= 1
        ratioH = height / stackup.top.height
      }
      cmd_meta += ` --export-height=${height}`
    } else {
      cmd_meta += ` --export-width=${width}`
    }

    await exec(cmd_meta)
      .then(() => eventEmitter.emit('done', topMetaPngPath))
      .catch(e => eventEmitter.emit('failed', topMetaPngPath, e))

    cmd = `convert -background '#373737' -gravity center '${path.join(
      outputDir,
      topMetaPngPath,
    )}' -extent 1000x524 '${path.join(outputDir, topWithBgndPath)}'`
    exec(cmd)
      .then(() => eventEmitter.emit('done', topWithBgndPath))
      .catch(e => eventEmitter.emit('failed', topWithBgndPath, e))
  } catch (e) {
    failAll(e)
  }
}

async function plotKicad(inputDir, files, kitspaceYaml) {
  let kicadPcbFile
  if (
    kitspaceYaml.eda &&
    kitspaceYaml.eda.type === 'kicad' &&
    kitspaceYaml.eda.pcb
  ) {
    kicadPcbFile = path.join(inputDir, kitspaceYaml.eda.pcb)
  } else {
    kicadPcbFile = files.find(file => file.endsWith('.kicad_pcb'))
  }
  if (kicadPcbFile == null) {
    throw Error('No PCB files found')
  }
  const gerberFolder = path.join('/tmp/kitspace', inputDir, 'gerbers')
  await exec(`rm -rf ${gerberFolder} && mkdir -p ${gerberFolder}`)
  const plot_kicad_gerbers = path.join(__dirname, 'plot_kicad_gerbers')
  const cmd_plot = `${plot_kicad_gerbers} ${kicadPcbFile} ${gerberFolder}`
  await exec(cmd_plot)
  return globule.find(path.join(gerberFolder, '*'))
}

module.exports = processGerbers
