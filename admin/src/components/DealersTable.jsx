import React from 'react'
import '../styles/admin.css'
import '../styles/dealersTable.css'

export default function DealersTable({ dealers, onApprove }) {
  return (
    <div className="dealers-table-wrap">
      <table className="dealers-table">
        <thead>
          <tr>
            <th>Dealer</th>
            <th>Contact</th>
            <th>Company</th>
            <th>Location</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dealers && dealers.length ? dealers.map(d => (
            <tr key={d._id || d.rigvay_id} className="dealers-row">
              <td>
                <div className="dealer-info">
                  {d.profileImageUrl ? (
                    <img src={d.profileImageUrl} alt="avatar" className="dealer-avatar" />
                  ) : (
                    <div className="dealer-avatar" style={{background:'#ddd',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#334'}}>
                      {((d.firstName||'')[0]||'') + ((d.lastName||'')[0]||'')}
                    </div>
                  )}
                  <div>
                    <div style={{fontWeight:600}}>{d.firstName} {d.lastName}</div>
                    <div style={{fontSize:'0.85rem',color:'#556'}}>{d.rigvay_id}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style={{fontWeight:600}}>{d.phone}</div>
                <div style={{fontSize:'0.85rem',color:'#556'}}>{d.email}</div>
              </td>
              <td>
                <div style={{fontWeight:600}}>{d.companyName}</div>
                <div style={{fontSize:'0.85rem',color:'#556'}}>{d.website}</div>
              </td>
              <td>
                {d.district}, {d.state}
                <div style={{fontSize:'0.82rem',color:'#889'}}>{d.pincode}</div>
              </td>
              <td>
                {d.adminApproved ? (
                  <span className="badge approved">Approved</span>
                ) : (
                  <span className="badge unapproved">Unapproved</span>
                )}
              </td>
              <td>
                {!d.adminApproved && (
                  <button className="btn-approve" onClick={() => onApprove(d._id)}>Approve</button>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan={6} className="empty">No dealers found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
