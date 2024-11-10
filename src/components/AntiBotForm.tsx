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

    const response = await fetch('/api/submit-form', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.isSuccess) {
      alert("Form submitted successfully!")
    } else {
      alert("Failed to submit form. Please try again.")
    }
  }

  return (
    <form className="flex flex-col max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-gray-800 text-center">Anti-Bot Verification</h2>
      
      {/* Hidden CSRF Token */}
      <input name="csrfToken" type="hidden" value={csrfToken} />
      
      {/* Username Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          name="username" 
          type="text" 
          placeholder="Enter your username" 
          required 
          className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          name="email" 
          type="email" 
          placeholder="Enter your email" 
          required 
          className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>

      {/* Submit Button */}
      <button 
        className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-opacity-50"
        type="submit"
      >
        Submit
      </button>
    </form>
  )
}
