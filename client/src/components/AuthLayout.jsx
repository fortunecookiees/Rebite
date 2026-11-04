import { Link } from 'react-router-dom'
import '../styles/Auth.css'

export default function AuthLayout({ children, variant = 'login' }) {
    const isLogin = variant === 'login'

    return (
        <main className={`auth-page auth-${variant}`}>
            <section className="auth-form-section">
                <div className="auth-brand">
                    <Link to="/" className="auth-logo">
                        rebite<span>.</span>
                    </Link>
                    <span className="auth-brand-caption">GOOD FOOD, BETTER TOMORROW.</span>
                </div>

                <div className="auth-form-wrapper">
                    {children}
                </div>

                <div className="auth-bottom">
                    © 2026 Rebite. Save food, make a difference.
                </div>
            </section>

            <section className="auth-visual">
                <div className="auth-visual-overlay" />

                <div className="auth-visual-content">
                    <span className="auth-eyebrow">
                        {isLogin ? 'WELCOME TO REBITE' : 'JOIN THE MOVEMENT'}
                    </span>

                    <h2>
                        {isLogin
                            ? 'Good to see you again.'
                            : 'Small choices, meaningful changes.'}
                    </h2>

                    <p>
                        {isLogin
                            ? 'Discover good food, enjoy better deals, and make every bite count.'
                            : 'Be part of a community that believes good food should never go to waste.'}
                    </p>
                </div>

                <span className="auth-image-caption">
                    SAVE FOOD. SAVE MORE. MAKE AN IMPACT.
                </span>
            </section>
        </main>
    )
}