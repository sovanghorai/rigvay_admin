const STORAGE_KEY = 'mockDealers_v1'

const initial = [
  { _id: '1', rigvay_id: '1000000001', firstName: 'Alice', lastName: 'Khan', phone: '9991112222', email: 'alice@example.com', companyName: 'Alice Autos', state: 'Karnataka', adminApproved: true },
  { _id: '2', rigvay_id: '1000000002', firstName: 'Bob', lastName: 'Roy', phone: '9993334444', email: 'bob@example.com', companyName: 'Roy Motors', state: 'Maharashtra', adminApproved: false },
  { _id: '3', rigvay_id: '1000000003', firstName: 'Clara', lastName: 'Das', phone: '9995556666', email: 'clara@example.com', companyName: 'Clara Cars', state: 'Tamil Nadu', adminApproved: false },
]

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial.slice()
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error(e)
    return initial.slice()
  }
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function getAllDealers() {
  return read()
}

export async function getUnapprovedDealers() {
  return read().filter(d => !d.adminApproved)
}

export async function approveDealer(rigvay_id) {
  const list = read()
  const idx = list.findIndex(d => d.rigvay_id === rigvay_id)
  if (idx !== -1) {
    list[idx].adminApproved = true
    write(list)
    return true
  }
  return false
}
