import React from 'react'
import Error from 'next/error'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Head from '../components/Head'
import TitleBar from '../components/TitleBar'

const KitspaceError = ({ statusCode }) => {
  return (
    <>
      <Head />
      <TitleBar />
      <Error statusCode={statusCode} />
    </>
  )
}

KitspaceError.getInitialProps = ({ res, err, query }) => {
  const statusCode = query.staticStatusCode
    ? query.staticStatusCode
    : res
    ? res.statusCode
    : err
    ? err.statusCode
    : 404
  return { statusCode }
}

export default KitspaceError
