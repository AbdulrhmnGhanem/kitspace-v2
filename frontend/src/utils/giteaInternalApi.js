/*
* Committing multiple files to gitea is a two steps process:
*  1. Upload the files to gitea which it turn returns a UUID for that file
*  2. UUID returned from the previous step is used to make the actual commit request.
*/

/**
 * Upload a file to gitea server, just upload it doesn't commit the files
 * @param repo{string}
 * @param file
 * @param csrf{string}
 * @returns {Promise<Object>}
 */
export const uploadFileToGiteaServer = (repo, file, csrf) => {
  const formData = new FormData()
  const fileContent = sessionStorage.getItem(`loadedFile_${file.name}`)
  const blobFromFile = new Blob([fileContent], { type: file.type })
  formData.append('file', blobFromFile)

  return new Promise((resolve, reject) => {
    const endpoint = `${process.env.KITSPACE_GITEA_URL}/${repo}/upload-file?_csrf=${csrf}`
    const req = new XMLHttpRequest()
    req.withCredentials = true
    req.open('POST', endpoint)

    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        console.log(req.response)
        resolve(JSON.parse(req.response))
      } else {
        reject({
          status: req.status,
          statusText: req.statusText,
        })
      }
    }

    req.onerror = () => {
      reject({
        status: req.status,
        statusText: req.statusText,
      })
    }

    req.send(formData)
  })
}

/**
 * upload multiple files to gitea server, just upload it doesn't commit the files
 * @param repo{string}
 * @param files{[]}
 * @param csrf{string}
 * @returns {Promise<string[]>}
 */
const uploadFilesToGiteaServer = async (repo, files, csrf) => {
  const filesUUIDs = await Promise.all(
    files.map(async file => {
      return await uploadFileToGiteaServer(repo, file, csrf)
    }),
  )
  return filesUUIDs.map(res => res.uuid)
}

/**
 *
 * @param repo{string}
 * @param files{[]}
 * @param commitSummary{=string}
 * @param commitMessage{=string}
 * @param commitChoice{=string}
 * @param treePath{=string}
 * @param newBranchName{=string}
 * @param csrf{string}
 * @returns {Promise<boolean>}
 */
export const commitFiles = async ({
  repo,
  files,
  commitSummary,
  commitMessage,
  commitChoice,
  treePath,
  newBranchName,
  csrf,
}) => {
  const endpoint = `${process.env.KITSPACE_GITEA_URL}/${repo}/upload/master?_csrf=${csrf}`
  const filesUUIDs = await uploadFilesToGiteaServer(repo, files, csrf)

  // The body of the request must be url encoded
  const body = new URLSearchParams({
    _csrf: csrf,
    tree_path: treePath || '',
    commit_summary: commitSummary || 'commit files',
    commit_message: commitMessage || '',
    commit_choice: commitChoice || 'direct',
    new_branch_name: newBranchName || 'patch-1',
  })

  // Files UUIDs aren't passed as an array; each file is passed as `&files={uuid}` in the request body
  filesUUIDs.forEach(uuid => {
    body.append('files', uuid)
  })

  const res = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
  })

  console.log(res)
  return res.ok
}
