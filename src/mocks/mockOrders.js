export const mockOrders = [
  {
    id: 1,
    customerName: 'John Doe',
    phoneNumber: '555-1234',
    address: '123 Elm St, Springfield',
    items: [
      { itemName: 'Widget', quantity: 2, price: '$25.00' },
      { itemName: 'Gadget', quantity: 1, price: '$50.00' }
    ],
    totalAmount: '$100.00',
    status: 'Pending',
    start: new Date().toISOString().split('T')[0] + 'T10:00:00',
    end: new Date().toISOString().split('T')[0] + 'T10:30:00'
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    phoneNumber: '555-5678',
    address: '456 Oak St, Metropolis',
    items: [
      { itemName: 'Thingamajig', quantity: 3, price: '$30.00' },
      { itemName: 'Doohickey', quantity: 2, price: '$45.00' }
    ],
    totalAmount: '$150.00',
    status: 'Shipped',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T11:00:00',
    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T11:30:00'
  }
]; 