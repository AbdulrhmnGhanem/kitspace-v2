import slugify from 'slugify'
import path from 'path'

/**
 * Look in project files and choose a file name for the project from it.
 * First it looks for known PCB CAD generate files,
 * if none is found returns the first uploaded file.
 * @param files{[]}
 * @returns {string}
 * @example
 * // returns 'my-cool-project'
 * slugifiedNameFromFiles([{name: 'f1.png', size: 1024, last_modified: {DATE}},
 *                         {name: 'f2.md', size: 1024, last_modified: {DATE}},
 *                         {name: 'my cool project.pro', size: 1024, last_modified: {DATE}}])
 */
export const slugifiedNameFromFiles = files => {
  const FilesNames = files.map(f => f.name)
  // TODO: make this look for all PCB software generated files not just KiCad projects
  const kicadProject = FilesNames.find(f => f.endsWith('.pro'))
  const projectWithExt = kicadProject || FilesNames[0]
  return slugify(projectWithExt.split('.')[0])
}

/**
 * Get the content of A DataURL as a blob
 * @param base64{string}
 * @returns {Promise<Promise<Blob>>}
 */
export const b64toBlob = base64 => fetch(base64).then(res => res.blob())

/**
 * Get the repo name from its url
 * @param url
 * @returns {string}
 * @example
 * // returns 'ulx3s'
 * urlToName('https://github.com/emard/ulx3s/')
 */
export const urlToName = url => {
  url = new URL(url)
  return path.basename(url.pathname, path.extname(url.pathname))
}

/**
 * Get the project name from the `path` object in `next.router`.
 * @param path
 * @returns {string}
 * @example
 * // returns 'testUser/cool-project"
 * projectNameFromPath('/projects/update/testUser/cool-project')
 * @example
 * // returns 'testUser/cool-project"
 * projectNameFromPath('/projects/update/testUser/cool-project?create=true')
 */
export const projectNameFromPath = path => {
  const pathWithQuery = path.split('/').slice(3).join('/')
  // In case if there's a query string remove it
  return pathWithQuery.split('?')[0]
}
