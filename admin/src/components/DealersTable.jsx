import React from 'react'
import '../styles/admin.css'

export default function DealersTable({ dealers, onApprove }) {
  return (
    <div className="dealers-table-wrap">
      <table className="dealers-table">
        <thead>
          <tr>
            <th>rigvay_id</th>
            <th>First</th>
            <th>Last</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Company</th>
            <th>State</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dealers && dealers.length ? dealers.map(d => (
            <tr key={d._id || d.rigvay_id}>
              <td>{d.rigvay_id}</td>
              <td>{d.firstName}</td>
              <td>{d.lastName}</td>
              <td>{d.phone}</td>
              <td>{d.email}</td>
              <td>{d.companyName}</td>
              <td>{d.state}</td>
              <td>
                {!d.adminApproved && (
                  <button className="btn-approve" onClick={() => onApprove(d.rigvay_id)}>Approve</button>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan={8} className="empty">No dealers found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
