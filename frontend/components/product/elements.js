import React from 'react'
import { Button, Image, Input } from 'semantic-ui-react'

import { formatPrice } from './utils'
import styles from './style.module.scss'

export const ProductImage = ({ src }) => {
  return (
    <div className={styles.product__img}>
      <Image
        style={{
          maxHeight: '400px',
          width: 'auto',
          margin: 'auto',
          backgroundColor: '#525252',
        }}
        src={src}
        fluid
      />
    </div>
  )
}

export const Total = ({ val }) => {
  return (
    <div className={styles.total}>
      <b>Total: </b>
      <b>{val}</b>
    </div>
  )
}

export const Quantity = ({ state, dispatch }) => {
  return (
    <div className={styles.quantity}>
      <span className={styles.quantity__label}>Quantity:</span>
      <div className={styles.quantity__controllers}>
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
          onChange={e => dispatch({ type: 'setQuantity', payload: e.target.value })}
        />
        <Button
          basic
          className="increment-btn"
          onClick={() => dispatch({ type: 'increment' })}
        >
          +
        </Button>
      </div>
      <span className={styles.quantity__total}>
        {formatPrice({
          amount: state.basePrice,
          currency: state.currency,
          quantity: state.quantity,
        })}
      </span>
    </div>
  )
}
