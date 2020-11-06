import React, { useState, useCallback } from 'react'
import {
  Grid,
  Divider,
  Input,
  Button,
  Modal,
  Segment,
  Form,
  TextArea,
} from 'semantic-ui-react'
import path from 'path'
import { useDropzone } from 'react-dropzone'

import styles from './new.module.scss'
import { Page } from '../../components/Page'
import useForm from '../../hooks/useForm'
import { ProjectUploadForm } from '../../models/ProjectUploadForm'

const gitea_public_url = `${process.env.KITSPACE_GITEA_URL}/api/v1`

const New = () => {
  return (
    <Page title="new">
      <div
        className={`${styles.projectsNew} ui two column stackable center aligned grid`}
      >
        <Grid.Row>
          <Sync />
          <Divider className={styles.divider} vertical>
            Or
          </Divider>
          <UploadModal />
        </Grid.Row>
      </div>
    </Page>
  )
}

const UploadModal = () => {
  const [open, setOpen] = useState(false)
  const [form, onChange, isValid, errors, formatErrorPrompt] = useForm(
    ProjectUploadForm,
  )

  const submit = async e => {
    e.preventDefault()

    const endpoint = `${process.env.KITSPACE_GITEA_URL}/repo/create`
    const giteaOptions = {
      _csrf: form._csrf,
      uid: window.session?.user.id,
      repo_name: form.name,
      description: form.description,
      repo_template: '',
      issue_labels: '',
      gitignores: '',
      license: 'MIT',
      readme: 'Default',
      auto_init: true,
      default_branch: 'master',
    }

    const request = new XMLHttpRequest()
    request.withCredentials = true

    let params = ''
    for (const option in giteaOptions) {
      if (params === '') {
        params = `${option}=${giteaOptions[option]}`
      } else {
        params = `${params}&${option}=${giteaOptions[option]}`
      }
    }
    request.open('POST', endpoint, true)
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    request.onreadystatechange =  ()  => {
      if (request.readyState === 4 && request.status === 200) {
        console.log(request)
      }
    }
    request.send(params)
    console.log(giteaOptions)
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Grid.Column className={styles.optionColumn}>
          <div>
            <p>Upload design files</p>
            <Button content="Upload" color="green" name="upload" />
          </div>
        </Grid.Column>
      }
    >
      <Modal.Header>Upload design files</Modal.Header>
      <Modal.Content>
        <Form>
          <Segment>
            <Form.Field
              fluid
              required
              control={Input}
              label="Project name"
              placeholder="Project name"
              name="name"
              value={form.name || ''}
              onChange={onChange}
              error={formatErrorPrompt('name')}
            />
            <Form.Field
              required
              control={TextArea}
              label="Project description"
              placeholder="Project description"
              name="description"
              value={form.description || ''}
              onChange={onChange}
              error={formatErrorPrompt('description')}
            />
            <Form.Field
              fluid
              control={Input}
              label="External link"
              placeholder="e.g., www.myblog.com/awesome-project"
              name="link"
              value={form.link || ''}
              onChange={onChange}
              error={formatErrorPrompt('link')}
            />
          </Segment>
          <Segment>
            <DropZone />
          </Segment>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button disabled={!isValid} onClick={submit} positive>
          Submit
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

const DropZone = () => {
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles)
  }, [])

  const { acceptedFiles, getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  })

  const files = acceptedFiles.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ))

  return (
    <section style={{}}>
      <div
        {...getRootProps({ className: 'dropzone' })}
        style={{ margin: '2rem 0' }}
      >
        <input {...getInputProps()} />
        <p>Drop files here, or click to select files</p>
        <Button content="Open file dialog" onClick={open} />
      </div>
      <aside
        style={
          acceptedFiles.length === 0 ? { display: 'none' } : { display: 'initial' }
        }
      >
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  )
}

const Sync = () => {
  const [loading, setLoading] = useState(false)

  const remoteRepoPlaceHolder = 'https://github.com/emard/ulx3s'
  const [remoteRepo, setRemoteRepo] = useState('')

  // TODO: the auth context should return the user not only the current authentication state.
  const uid = window.session?.user?.id || null
  const _csrf = window.session._csrf

  const handleClick = async () => {
    setLoading(true)

    const clone_addr = remoteRepo || remoteRepoPlaceHolder
    const repo_name = urlToName(clone_addr)
    const endpoint = `${gitea_public_url}/repos/migrate?_csrf= ${_csrf}`
    const giteaOptions = {
      clone_addr,
      uid,
      repo_name,
      mirror: false,
      wiki: false,
      private: false,
      pull_requests: false,
      releases: true,
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(giteaOptions),
    })

    if (res.ok) {
      const body = await res.json()
      console.log(body)
      setLoading(false)
    } else {
      console.log(res)
      setLoading(false)
    }
  }

  return (
    <Grid.Column className={styles.optionColumn}>
      <div>
        <p>Sync an existing Git repository</p>
        <div className={styles.syncSide}>
          <Input
            className={styles.urlInput}
            style={{ maxHeight: 37 }}
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
    </Grid.Column>
  )
}

function urlToName(url) {
  url = new URL(url)
  return path.basename(url.pathname, path.extname(url.pathname))
}

export default New
