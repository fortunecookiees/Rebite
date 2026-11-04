import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

export default function Profile() {
    const navigate = useNavigate()

    const [editing, setEditing] = useState(false)
    const [profile, setProfile] = useState({
        name: 'Della Rebite',
        email: 'della@example.com',
        phone: '',
        role: 'Consumer',
        businessName: '',
    })

    function handleChange(e) {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        })
    }

    function handleLogout() {
        navigate('/login')
    }

    return (
        <main className="profile-page">
            <div className="profile-container">
                <div className="profile-heading">
                    <Link to="/" className="auth-logo">
                        rebite<span>.</span>
                    </Link>
                    <h1>My Profile</h1>
                    <p>Manage your personal information and account details.</p>
                </div>

                <section className="profile-card">
                    <div className="profile-avatar">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>

                    <h2 className="text-2xl font-bold">
                        {profile.name}
                    </h2>

                    <p className="text-sm text-coffee mt-1">
                        {profile.role}
                    </p>

                    <div className="profile-info">
                        <div>
                            <span>Full Name</span>
                            {editing ? (
                                <input
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="w-full rounded border border-latte bg-white p-2 text-sm"
                                />
                            ) : (
                                <strong>{profile.name}</strong>
                            )}
                        </div>

                        <div>
                            <span>Email Address</span>
                            <strong>{profile.email}</strong>
                        </div>

                        <div>
                            <span>Phone Number</span>
                            {editing ? (
                                <input
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    className="w-full rounded border border-latte bg-white p-2 text-sm"
                                />
                            ) : (
                                <strong>{profile.phone || 'Not provided'}</strong>
                            )}
                        </div>

                        <div>
                            <span>Account Type</span>
                            <strong>{profile.role}</strong>
                        </div>

                        {profile.role === 'Merchant' && (
                            <div>
                                <span>Business Name</span>
                                <strong>{profile.businessName || 'Not provided'}</strong>
                            </div>
                        )}
                    </div>

                    <div className="profile-actions">
                        {editing ? (
                            <button onClick={() => setEditing(false)}>
                                Save Changes
                            </button>
                        ) : (
                            <button onClick={() => setEditing(true)}>
                                Edit Profile
                            </button>
                        )}

                        <button
                            className="profile-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </section>
            </div>
        </main>
    )
}