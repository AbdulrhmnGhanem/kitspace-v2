import React, { useState } from 'react'

export default function (schema) {
  const [form, setForm] = useState({})

  const onChange = e => {
    e.persist()
    setForm(form => ({
      _csrf: `${window.session._csrf}`,
      ...form,
      [e.target.name]:
        e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))
  }
  const { error } = schema.validate({ ...form })
  const isValid = error == null

  const errorDetails = error?.details[0]
  const errors = !isValid
    ? { field: errorDetails.context.key, msg: errorDetails.message }
    : {}

  const isErrorField = field => errors.field === field && form[field] != null

  const formatErrorPrompt = field => {
    return isErrorField(field) ? { content: errors.msg, pointing: 'below' } : null
  }

  return [form, onChange, isValid, errors, formatErrorPrompt]
}
