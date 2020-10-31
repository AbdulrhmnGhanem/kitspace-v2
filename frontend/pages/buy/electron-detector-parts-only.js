import React, { useReducer } from 'react'
import Link from 'next/link'
import superagent from 'superagent'
import {
  Container,
  Card,
  Grid,
  Divider,
  Input,
  Button,
  Image,
  Segment,
  Table,
} from 'semantic-ui-react'
import { Elements, CardElement } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import path from 'path'

import Head from '../../components/Head'
import TitleBar from '../../components/TitleBar'

import styles from './index.module.scss'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_live_jYJD5bwTmzCMJuIKwK9rIIpk')

const gitea_public_url = `${process.env.KITSPACE_GITEA_URL}/api/v1`

const gitea_internal_url = 'http://gitea:3000/api/v1'

const formatTotalPrice = ({ amount, currency, quantity, shipping }) => {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  })
  let parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100
  parts = numberFormat.formatToParts(shipping)
  let zeroDecimalCurrencyShipping = true
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  shipping = shipping / 100
  const total = (quantity * amount + shipping).toFixed(2)
  return numberFormat.format(total)
}

const formatPrice = ({ amount, currency, quantity }) => {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  })
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100
  const total = (quantity * amount).toFixed(2)
  return numberFormat.format(total)
}

function reducer(state, action) {
  switch (action.type) {
    case 'setQuantity':
      const n = parseInt(action.payload)
      if (isNaN(n) || n < 1) {
        return state
      }
      return {
        ...state,
        quantity: n,
        price: formatTotalPrice({
          amount: state.basePrice,
          currency: state.currency,
          quantity: n,
          shipping: state.shippingPrice,
        }),
      }
    case 'increment':
      return {
        ...state,
        quantity: state.quantity + 1,
        price: formatTotalPrice({
          amount: state.basePrice,
          currency: state.currency,
          quantity: state.quantity + 1,
          shipping: state.shippingPrice,
        }),
      }
    case 'decrement':
      if (state.quantity - 1 < 1) {
        return state
      }
      return {
        ...state,
        quantity: state.quantity - 1,
        price: formatTotalPrice({
          amount: state.basePrice,
          currency: state.currency,
          quantity: state.quantity - 1,
          shipping: state.shippingPrice,
        }),
      }
    case 'setLoading':
      return { ...state, loading: action.payload.loading }
    case 'setError':
      return { ...state, error: action.payload.error }
    default:
      throw new Error()
  }
}

const Checkout = () => {
  const [state, dispatch] = useReducer(reducer, {
    priceId: 'price_1HhgkEI6rpeFFqzwmi8mVgg9',
    basePrice: 2800,
    currency: 'eur',
    quantity: 1,
    shippingPriceId: 'price_1Hhh8TI6rpeFFqzwLrDvjaML',
    shippingPrice: 1000,
    price: formatTotalPrice({
      amount: 2800,
      currency: 'eur',
      quantity: 1,
      shipping: 1000,
    }),
    loading: false,
    error: null,
  })

  const handleClick = async event => {
    // Call your backend to create the Checkout session.
    dispatch({ type: 'setLoading', payload: { loading: true } })
    // When the customer clicks on the button, redirect them to Checkout.
    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [
        { price: state.priceId, quantity: state.quantity },
        { price: state.shippingPriceId, quantity: 1 },
      ],
      successUrl: `${window.location.origin}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/buy/cancelled`,
      shippingAddressCollection: {
        allowedCountries: [
          'AL',
          'AT',
          'BA',
          'BE',
          'BG',
          'CH',
          'CY',
          'DE',
          'DK',
          'EE',
          'ES',
          'FI',
          'FR',
          'GB',
          'GR',
          'HR',
          'HU',
          'IE',
          'IS',
          'IT',
          'LT',
          'LV',
          'MK',
          'MT',
          'NL',
          'NO',
          'PL',
          'PT',
          'RO',
          'RS',
          'SE',
          'SI',
        ],
      },
    })
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (error) {
      dispatch({ type: 'setError', payload: { error } })
      dispatch({ type: 'setLoading', payload: { loading: false } })
    }
  }

  return (
    <div className="sr-root">
      <div className="sr-main">
        <header className="sr-header">
          <div className="sr-header__logo"></div>
        </header>
        <section
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>
            <h1>Electron Detector Kit (parts only)</h1>
            <Image
              alt="Photo of the electron detector kit"
              src="https://files.stripe.com/links/fl_test_dPLbmgEZs94lABQLQm53IXBF"
              className={styles.productImage}
            />
          </div>
          <div style={{ padding: 20, maxWidth: 600 }}>
            <p>
              All the parts to make your own{' '}
              <a href="https://kitspace.org/boards/github.com/ozel/diy_particle_detector/electron-detector/">
                electron-detector
              </a>
              . The circuit board, battery and metal enclosure are not included in this kit.
            </p>
          </div>

          <div
            style={{
              maxWidth: 580,
              flexDirection: 'column',
              display: 'flex',
              marginBottom: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Table basic="very">
              <tbody>
                <Table.Row>
                  <Table.Cell style={{ width: '75%' }}>
                    Electron Detector Kit
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex' }}>
                      <Button
                        basic
                        className="increment-btn"
                        onClick={() => dispatch({ type: 'decrement' })}
                      >
                        -
                      </Button>
                      <Input
                        style={{ width: 100, marginLeft: 10, marginRight: 10 }}
                        size="mini"
                        type="number"
                        id="quantity-input"
                        min="1"
                        value={state.quantity}
                        onChange={e =>
                          dispatch({
                            type: 'setQuantity',
                            payload: e.target.value,
                          })
                        }
                      />
                      <Button
                        basic
                        className="increment-btn"
                        onClick={() => dispatch({ type: 'increment' })}
                      >
                        +
                      </Button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {formatPrice({
                      amount: state.basePrice,
                      currency: state.currency,
                      quantity: state.quantity,
                    })}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell colspan="2">
                    <div>Shipping (Europe)</div>
                    <div style={{ textEmphasis: 'italic', color: 'grey' }}>
                      <div>shipping to EU, EEA, GB or Switzerland </div>
                      <div>
                        delivered by {new Date(
                          new Date().getTime() + 14 * 86400000,
                        ).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {formatPrice({
                      amount: state.shippingPrice,
                      currency: state.currency,
                      quantity: 1,
                    })}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Total:</b>
                  </Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <b>{state.price}</b>
                  </Table.Cell>
                </Table.Row>
              </tbody>
            </Table>
            <div style={{ width: '100%' }}>
              <Button
                primary
                role="link"
                onClick={handleClick}
                disabled={state.loading}
                style={{ width: '100%' }}
              >
                {state.loading || !state.price ? 'Loading...' : 'Order'}
              </Button>
            </div>
            <div className="sr-field-error">{state.error?.message}</div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function BuyPage({ user, _csrf }) {
  const [remoteRepo, setRemoteRepo] = React.useState('')
  const uid = user?.id
  return (
    <>
      <Head
        title="Electron Detector Kit"
        description="All the parts to make your own electron-detector."
        ogImage="https://files.stripe.com/links/fl_test_dPLbmgEZs94lABQLQm53IXBF"
        ogImageWidth="1024"
        ogImageHeight="768"
      />
      <TitleBar route="/buy" />
      <Container style={{ marginTop: 50 }}>
        <Checkout />
      </Container>
    </>
  )
}

function getSession(req) {
  let session = {}
  if (req != null && req.session) {
    session = req.session
  } else if (typeof window !== 'undefined' && window.session) {
    session = window.session
  }
  return session
}

BuyPage.getInitialProps = async ({ req, query }) => {
  const session = getSession(req)
  const cookie = req?.headers?.cookie
  const _csrf = session._csrf

  return {
    user: session.user,
    _csrf,
  }
}
