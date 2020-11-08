import React, { useState, useCallback, useContext, useEffect } from 'react'
import {
  Grid,
  Divider,
  Input,
  Button,
  Modal,
  Segment,
  Form,
  TextArea,
  List,
  Message,
} from 'semantic-ui-react'
import { useDropzone } from 'react-dropzone'

import styles from './new.module.scss'
import { Page } from '../../components/Page'
import useForm from '../../hooks/useForm'
import { ProjectUploadForm } from '../../models/ProjectUploadForm'
import UploadContextProvider, { UploadContext } from '../../contexts/UploadContext'
import { createRepo, migrateRepo } from '../../utils/giteaApi'

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
          <UploadContextProvider>
            <UploadModal />
          </UploadContextProvider>
        </Grid.Row>
      </div>
    </Page>
  )
}

const UploadModal = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, onChange, isValid, errors, formatErrorPrompt] = useForm(
    ProjectUploadForm,
  )
  const { loadedFiles, uploadFile } = useContext(UploadContext)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)

    const repo = await createRepo(form.name, form.description, form._csrf)

    // there's a race condition happens on gitea when making several request to the upload endpoint
    // a hacky/awful solution to get around it is simulating a scheduler with setTimeout
    const delay = 1000
    await Promise.all(
      loadedFiles.map(async (file, idx) => {
        const reader = new FileReader()
        reader.onload = async () => {
          const path = file.name
          const content = reader.result
          setTimeout(async () => {
            return await uploadFile(repo, path, content, form._csrf)
          }, delay * idx)
        }
        reader.readAsBinaryString(file)
      }),
    )
    // TODO break this if some errors occurred during the upload process
    setLoading(false)
    setDone(true)
  }

  return (
    <Modal
      size="small"
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
        <Message
          positive
          style={{
            display: done ? 'block' : 'none',
          }}
        >
          <Message.Header>Success!</Message.Header>
          All files have been uploaded successfully.
        </Message>
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
          </Segment>
          <Segment>
            <DropZone />
          </Segment>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          disabled={!isValid || loading || loadedFiles.length === 0}
          onClick={submit}
          positive
          loading={loading}
        >
          Submit
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

const DropZone = () => {
  const { loadFiles, loadedFiles } = useContext(UploadContext)

  useEffect(() => {
    console.log(loadedFiles)
  }, [loadedFiles])

  const onDrop = useCallback(acceptedFiles => loadFiles(acceptedFiles), [])

  const { acceptedFiles, getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  })

  const files = acceptedFiles.map(file => (
    <List.Item>
      <List.Icon name="file" />
      <List.Content>
        <List.Header>{file.name}</List.Header>
        <List.Description>{file.size} bytes</List.Description>
      </List.Content>
    </List.Item>
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
        <List relaxed>{files}</List>
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
    const repo = remoteRepo || remoteRepoPlaceHolder
    const migrateSuccessfully = await migrateRepo(repo, uid, _csrf)

    if (migrateSuccessfully) {
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

export default New
