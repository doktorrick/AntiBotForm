// pages/form.tsx
'use client'
import { useEffect, useState, FormEvent } from 'react'

export default function AntiBotForm() {
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const res = await fetch('/api/auth/csrf-token')
      const data = await res.json()
      setCsrfToken(data.csrfToken)
    }
    fetchCsrfToken()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', e.currentTarget.username.value)
    formData.append('email', e.currentTarget.email.value)
    formData.append('csrfToken', e.currentTarget.csrfToken.value)

    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    const response = await fetch('/api/submit-form', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json();

    if(result.isSuccess) {
      alert("success")
    }

    if(!result.isSuccess) {
      alert("fail")
    }
  }

  return (
    <form className="flex flex-col gap-y-4 max-w-screen-lg mx-auto" onSubmit={handleSubmit}>
      <span className="text-white">csrfToken: {csrfToken}</span>
      <input name="csrfToken" type="hidden" value={csrfToken} />
      <input name="username" type="text" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <button className="btn border-teal-200 bg-emerald-600 py-4" type="submit">
        Submit
      </button>
    </form>
  )
}

