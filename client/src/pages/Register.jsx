
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
    const [showPassword, setShowPassword] = useState(false)

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'konsumen',
    })

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    function handleChange(e) {
        const { name, value } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))

        setError('')
        setSuccess('')
    }

    function handleSubmit(e) {
        e.preventDefault()

        setError('')
        setSuccess('')

        // Validasi input
        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError('Please complete all required fields.')
            return
        }

        // Validasi format email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailPattern.test(form.email)) {
            setError('Please enter a valid email address.')
            return
        }

        // Validasi panjang password
        if (form.password.length < 8) {
            setError('Password must contain at least 8 characters.')
            return
        }

        // Validasi konfirmasi password
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        // Validasi berhasil (backend belum terhubung)
        setSuccess(
            'Your information is valid! Account registration will be connected to the server soon.'
        )

        console.log('Registration data:', {
            name: form.name,
            email: form.email,
            role: form.role,
        })
    }

    return (
        <AuthLayout variant="register">
            <div className="auth-heading">
                <span className="auth-step">CREATE YOUR ACCOUNT</span>

                <h1>Join Rebite.</h1>

                <p>
                    Create an account and start making a difference.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">

                {/* Full Name */}
                <div className="auth-field">
                    <label htmlFor="register-name">
                        Full Name
                    </label>

                    <input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                </div>

                {/* Email */}
                <div className="auth-field">
                    <label htmlFor="register-email">
                        Email Address
                    </label>

                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />
                </div>

                {/* Password */}
                <div className="auth-field">
                    <label htmlFor="register-password">
                        Password
                    </label>

                    <div className="auth-password-wrap">
                        <input
                            id="register-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimum 8 characters"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                    <div className="auth-label-row">
                        <label htmlFor="register-confirm">
                            Confirm Password
                        </label>

                        <button
                            type="button"
                            className="auth-text-button"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? 'Hide password' : 'Show password'}
                        </button>
                    </div>

                    <input
                        id="register-confirm"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                </div>

                {/* Account Role */}
                <div className="auth-field">
                    <label htmlFor="register-role">
                        Account Type
                    </label>

                    <select
                        id="register-role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="konsumen">
                            Consumer
                        </option>

                        <option value="merchant">
                            Merchant
                        </option>
                    </select>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="auth-message" role="alert">
                        {error}
                    </p>
                )}

                {/* Success Message */}
                {success && (
                    <p
                        className="auth-message"
                        role="status"
                    >
                        {success}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="auth-submit"
                >
                    Create Account
                    <span>→</span>
                </button>

            </form>

            <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    )
}
