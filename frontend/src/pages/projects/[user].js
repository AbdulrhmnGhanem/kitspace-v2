import React, { useEffect, useContext } from 'react'
import useSWR from 'swr'
import { List } from 'semantic-ui-react'

import { Page } from '@components/Page'
import { AuthContext } from '@contexts/AuthContext'
import { getAllRepos, getUserRepos } from '@utils/giteaApi'
import styles from './mine.module.scss'
import { useRouter } from 'next/router'

export const getStaticPaths = async () => {
  const allRepos = await getAllRepos()
  const paths = allRepos.map(p => ({ params: { user: p.owner.login } }))

  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const userRepos = await getUserRepos(params.user)

  return {
    props: {
      userRepos,
      username: params.user,
    },
  }
}

const User = ({ userRepos, username }) => {
  const { user } = useContext(AuthContext)
  const { replace } = useRouter()

  useEffect(() => {
    // Redirect the user to `projects/mine` on accessing `project/{their username}` page.
    if (username === user.login) {
      replace('/projects/mine')
    }
  }, [])

  const { data: projects } = useSWR(username, getUserRepos, {
    initialData: userRepos,
  })

  const projectsList = projects.map(p => {
    const lastUpdateDate = new Date(p.updated_at)

    return (
      <List.Item key={p.name}>
        <List.Icon name="folder" size="large" verticalAlign="middle" />
        <List.Content>
          <List.Header as="a" className={styles.projectHeader}>
            {p.name}
          </List.Header>
          <List.Description>
            Updated at {lastUpdateDate.toDateString()}
          </List.Description>
        </List.Content>
      </List.Item>
    )
  })

  return (
    <Page>
      <h1>Projects by {username}</h1>
      <div className={styles.projectsList}>
        <List divided relaxed>
          {projectsList}
        </List>
      </div>
    </Page>
  )
}

export default User
