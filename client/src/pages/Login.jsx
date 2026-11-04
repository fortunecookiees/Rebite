import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [error, setError] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password) {
            setError('Please enter your email and password.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.')
            return
        }

        setError('The login interface is ready. Authentication will be connected to the backend next.')
    }

    return (
        <AuthLayout variant="login">
            <div className="auth-heading">
                <span className="auth-step">YOUR ACCOUNT</span>
                <h1>Welcome back!</h1>
                <p>Enter your details to access your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                    <label htmlFor="login-email">Email address</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>

                <div className="auth-field">
                    <div className="auth-label-row">
                        <label htmlFor="login-password">Password</label>
                        <button type="button" className="auth-text-button">
                            Forgot password?
                        </button>
                    </div>

                    <div className="auth-password-wrap">
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        <button
                            type="button"
                            className="auth-show-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <label className="auth-checkbox">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>Remember me</span>
                </label>

                {error && <p className="auth-message">{error}</p>}

                <button type="submit" className="auth-submit">
                    Sign In <span>→</span>
                </button>
            </form>

            <div className="auth-divider">
                <span>NEW TO REBITE?</span>
            </div>

            <p className="auth-switch">
                Don't have an account?{' '}
                <Link to="/register">Create an account</Link>
            </p>
        </AuthLayout>
    )
}