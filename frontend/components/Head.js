import React from 'react'
import NextHead from 'next/head'
import { string } from 'prop-types'

const defaultDescription = 'A site for sharing electronics projects.'
const defaultOGURL = 'https://kitspace.org'
const defaultOGImage = 'https://kitspace.org/images/logo_meta.png'

const Head = props => (
  <NextHead>
    <meta charSet="UTF-8" />
    <title>{props.title || ''}</title>
    <meta name="description" content={props.description || defaultDescription} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="/static/favicon.png" />
    <meta property="og:url" content={props.url || defaultOGURL} />
    <meta property="og:title" content={props.title || ''} />
    <meta
      property="og:description"
      content={props.description || defaultDescription}
    />
    <meta name="twitter:site" content={props.url || defaultOGURL} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image" content={props.ogImage || defaultOGImage} />
    <meta property="og:image:width" content={props.ogImageWidth || '1200'} />
    <meta property="og:image:height" content={props.ogImageHeight || '630'} />
  </NextHead>
)

Head.propTypes = {
  title: string,
  description: string,
  url: string,
  ogImage: string,
}

export default Head
