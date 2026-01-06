import React, { useEffect, useState } from 'react'
import DealersTable from '../components/DealersTable'
import { getAllDealers, getUnapprovedDealers, approveDealer } from '../api/dealers'
import '../styles/admin.css'

export default function DealerPage() {
  const [tab, setTab] = useState('all')
  const [dealers, setDealers] = useState([])

  const load = async () => {
    if (tab === 'all') setDealers(await getAllDealers())
    else setDealers(await getUnapprovedDealers())
  }

  useEffect(() => { load() }, [tab])

  const handleApprove = async (rigvay_id) => {
    await approveDealer(rigvay_id)
    load()
  }

  return (
    <div className="dealer-page">
      <h2>Dealers</h2>
      <div className="tabs">
        <button className={tab === 'all' ? 'tab active' : 'tab'} onClick={() => setTab('all')}>All Dealers</button>
        <button className={tab === 'unapproved' ? 'tab active' : 'tab'} onClick={() => setTab('unapproved')}>Unapproved Dealers</button>
      </div>

      <div className="tab-panel">
        <DealersTable dealers={dealers} onApprove={handleApprove} />
      </div>
    </div>
  )
}
