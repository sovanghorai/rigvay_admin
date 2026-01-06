import { useState } from 'react'
import './App.css'
import './styles/admin.css'
import AdminNavbar from './components/AdminNavbar'
import DealerPage from './pages/DealerPage'

function App() {
  const [section, setSection] = useState('Dealer')

  return (
    <div className="admin-root">
      <AdminNavbar current={section} onNavigate={setSection} />
      <main className="admin-main">
        {section === 'Dealer' && <DealerPage />}
        {section === 'Cars' && (
          <div className="placeholder">
            <h2>Cars Management (Under Development . . . .)</h2>
           
          </div>
        )}
      </main>
    </div>
  )
}

export default App
