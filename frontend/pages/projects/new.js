import React, { useState, useContext } from 'react'
import { Grid, Divider, Input, Button } from 'semantic-ui-react'

import styles from './new.module.scss'
import { Page } from '@/components/Page'
import DropZone from '@/components/DropZone'
import { AuthContext } from '@/contexts/AuthContext'
import { UploadContext } from '@/contexts/UploadContext'
import { createRepo, migrateRepo, urlToName } from '@utils/giteaApi'
import { useRouter } from 'next/router'
import { slugifiedNameFromFiles } from '@utils/index'

const New = () => {
  const { csrf, user } = useContext(AuthContext)
  return (
    <Page title="new" reqSignIn>
      <div
        className={`${styles.projectsNew} ui two column stackable center aligned grid`}
      >
        <Grid.Row>
          <Grid.Column className={styles.optionColumn}>
            <Sync csrf={csrf} user={user} />
          </Grid.Column>
          <Divider className={styles.divider} vertical>
            Or
          </Divider>
          <Grid.Column className={styles.optionColumn}>
            <Upload csrf={csrf} user={user} />
          </Grid.Column>
        </Grid.Row>
      </div>
    </Page>
  )
}

const Upload = ({ user, csrf }) => {
  const { push } = useRouter()
  const { loadFiles } = useContext(UploadContext)

  const onDrop = async files => {
    const tempProjectName = slugifiedNameFromFiles(files)
    const repo = await createRepo(tempProjectName, '', csrf)

    if (repo === '') {
      // In the case of failing to create the repo, i.e., it already exits.

      // It should display a modal asking for overwriting the existing project
      console.error('Repo already exists!')
    } else {
      loadFiles(files, tempProjectName)
      await push(`/projects/update/${user.login}/${tempProjectName}?create=true`)
    }
  }

  return <DropZone onDrop={onDrop} />
}

const Sync = ({ user, csrf }) => {
  const { push } = useRouter()
  const [loading, setLoading] = useState(false)

  const remoteRepoPlaceHolder = 'https://github.com/emard/ulx3s'
  const [remoteRepo, setRemoteRepo] = useState('')

  const uid = user.id
  const username = user.login

  const handleClick = async () => {
    setLoading(true)
    const repo = remoteRepo || remoteRepoPlaceHolder
    const migrateSuccessfully = await migrateRepo(repo, uid, csrf)

    if (migrateSuccessfully) {
      const repoName = urlToName(repo)
      setLoading(false)
      await push(`/projects/update/${username}/${repoName}`)
    }
  }

  return (
    <div>
      <p>Sync an existing Git repository</p>
      <div className={styles.syncSide}>
        <Input
          className={styles.urlInput}
          fluid
          onChange={e => setRemoteRepo(e.target.value)}
          placeholder={remoteRepoPlaceHolder}
          value={remoteRepo}
        />
        <div className={styles.syncButton}>
          <Button
            color="green"
            onClick={handleClick}
            loading={loading}
            disabled={loading}
          >
            Sync
          </Button>
        </div>
      </div>
    </div>
  )
}

export default New
