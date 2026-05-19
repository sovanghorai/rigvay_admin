import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import auth from '../api/auth.js'
import '../styles/adminLogin.css'

export default function AdminLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const sendOtp = async () => {
    if (!phone) {
      setErrorMessage('Please enter your phone number')
      return
    }
    setLoading(true)
    setErrorMessage('')
    try {
      await auth.sendLoginOtp(phone)
      console.log('OTP sent to +91' + phone)
      setStep('otp')
    } catch (e) {
      const msg = e.payload?.message || e.message || 'Failed to send OTP'
      console.error(msg)
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    if (!otp) {
      setErrorMessage('Please enter the OTP')
      return
    }
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await auth.verifyLoginOtp(phone, otp)
      
      // Extract token
      const token = res?.data?.token || res?.token || res?.accessToken || res?.access_token
      if (!token) throw new Error('No token returned from server')

      // Extract or construct admin object
      const adminData = res?.data?.admin || res?.admin || {
        id: res?.data?.id || res?.id || 'unknown',
        phone: phone,
        permissions: res?.data?.permissions || res?.permissions || ['dealer', 'cars'],
      }

      // Ensure permissions is an array
      if (!Array.isArray(adminData.permissions)) {
        adminData.permissions = ['dealer', 'cars']
      }

      // Use AuthContext to persist login
      login(token, adminData)
      
      console.log('Logged in successfully!')
      navigate('/', { replace: true })
    } catch (e) {
      const msg = e.payload?.message || e.message || 'Invalid OTP'
      console.error(msg)
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setOtp('')
    await sendOtp()
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Sign In</h2>
        <p className="hint">Sign in with your approved admin mobile number. No password required.</p>

        {errorMessage && (
          <div className="login-error">
            {errorMessage}
          </div>
        )}

        {step === 'phone' && (
          <div>
            <div className="login-field">
              <label>Mobile number</label>
              <div className="phone-input">
                <span className="phone-prefix">+91</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 9991112222"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="login-actions">
              <button className="btn-primary" onClick={sendOtp} disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <button className="btn-secondary" onClick={() => { setPhone(''); setOtp(''); setErrorMessage('') }} disabled={loading}>
                Clear
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <div className="login-field">
              <label>OTP (sent to +91 {phone})</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter OTP"
                disabled={loading}
              />
            </div>
            <div className="login-actions">
              <button className="btn-primary" onClick={verify} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button className="btn-secondary" onClick={resend} disabled={loading}>
                Resend OTP
              </button>
              <button className="btn-secondary" onClick={() => { setStep('phone'); setOtp(''); setErrorMessage('') }} disabled={loading}>
                Change Number
              </button>
            </div>
            <div className="login-foot">Didn't receive OTP? Try resending after a few seconds.</div>
          </div>
        )}

      </div>
    </div>
  )
}
