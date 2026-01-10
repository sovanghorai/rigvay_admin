import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import auth from '../api/auth.js'
import '../styles/adminLogin.css'

export default function AdminLogin({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const sendOtp = async () => {
    if (!phone) {
      console.error('Enter phone number')
      return
    }
    setLoading(true)
    try {
      await auth.sendLoginOtp(phone)
      console.log('OTP sent to ' + phone)
      setStep('otp')
    } catch (e) {
      const msg = e.payload?.message || e.message || 'Failed to send OTP'
      console.error(msg)
    } finally { setLoading(false) }
  }

  const verify = async () => {
    if (!otp) {
      console.error('Enter OTP')
      return
    }
    setLoading(true)
    try {
      const res = await auth.verifyLoginOtp(phone, otp)
      const token = res?.data?.token || res?.token || res?.accessToken || res?.access_token
      if (!token) throw new Error('No token returned')
      localStorage.setItem('admin_access_token', token)
      console.log('Logged in successfully!')
      onLogin && onLogin(token)
      navigate('/', { replace: true })
    } catch (e) {
      const msg = e.payload?.message || e.message || 'Invalid OTP'
      console.error(msg)
    } finally { setLoading(false) }
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

        {step === 'phone' && (
          <div>
            <div className="login-field">
              <label>Mobile number</label>
              <div className="phone-input">
                <span className="phone-prefix">+91</span>
                <input inputMode="numeric" pattern="[0-9]*" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g,''))} placeholder="e.g. 9991112222" />
              </div>
            </div>
            <div className="login-actions">
              <button className="btn-primary" onClick={sendOtp} disabled={loading}>Send OTP</button>
              <button className="btn-secondary" onClick={() => { setPhone(''); setOtp('') }} disabled={loading}>Clear</button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <div className="login-field">
              <label>OTP (sent to +91 {phone})</label>
              <input inputMode="numeric" pattern="[0-9]*" value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g,''))} placeholder="Enter OTP" />
            </div>
            <div className="login-actions">
              <button className="btn-primary" onClick={verify} disabled={loading}>Verify & Login</button>
              <button className="btn-secondary" onClick={resend} disabled={loading}>Resend OTP</button>
              <button className="btn-secondary" onClick={() => setStep('phone')} disabled={loading}>Change Number</button>
            </div>
            <div className="login-foot">Didn't receive OTP? Try resending after a few seconds.</div>
          </div>
        )}

      </div>
    </div>
  )
}
