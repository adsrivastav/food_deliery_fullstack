import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // const [staffList, setStaffList] = useState([]);
  // const [newStaff, setNewStaff] = useState({ name: '', availability: true, workingHours: [] });
  // const [editingStaff, setEditingStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', availability: true, workingHours: [] });
  const [editingStaff, setEditingStaff] = useState(null);
  const [newOrder, setNewOrder] = useState({ items: [], customerName: '', deliveryAddress: '' });

  useEffect(() => {
    async function fetchData() {
      const staffResponse = await axios.get('http://localhost:5000/api/staff');
      setStaffList(staffResponse.data);

      const orderResponse = await axios.get('http://localhost:5000/api/order');
      console.log(orderResponse.data);
      setOrderList(orderResponse.data);
    }

    fetchData();

    // fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/staff', newStaff);
      setStaffList([...staffList, response.data]);
      setNewStaff({ name: '', availability: true, workingHours: [] });
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleEditStaff = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/staff/${editingStaff._id}`, editingStaff);
      const updatedStaffList = staffList.map((staff) => (staff._id === response.data._id ? response.data : staff));
      setStaffList(updatedStaffList);
      setEditingStaff(null);
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleToggleAvailability = (staff) => {
    const updatedStaff = { ...staff, availability: !staff.availability };
    setEditingStaff(updatedStaff);
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await axios.delete(`http://localhost:5000/api/staff/${staffId}`);
      const updatedStaffList = staffList.filter((staff) => staff._id !== staffId);
      setStaffList(updatedStaffList);
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };


  const handleAddOrder = async () => {
    try {
      console.log("new Order", newOrder);
      const response = await axios.post('http://localhost:5000/api/order', newOrder);
      setOrderList([...orderList, response.data]);
      setNewOrder({ items: [], customerName: '', deliveryAddress: '' });
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };


  const handleCancelEdit = () => {
    setEditingStaff(null);
  };

  return (
    <div>
      <h1>Food Delivery System</h1>



      <div>
        <h2>Add Staff</h2>
        <label>Name:</label>
        <input
          type="text"
          value={newStaff.name}
          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
        />
        <label>Availability:</label>
        <input
          type="checkbox"
          checked={newStaff.availability}
          onChange={(e) => setNewStaff({ ...newStaff, availability: e.target.checked })}
        />
        <button onClick={handleAddStaff}>Add Staff</button>
      </div>

      <div>
        <h2>Staff List</h2>
        <ul>
          {staffList.map((staff) => (
            <li key={staff._id}>
              {staff.name} - {staff.availability ? 'Available' : 'Not Available'}{' '}
              <button onClick={() => handleToggleAvailability(staff)}>Toggle Availability</button>{' '}
              <button onClick={() => setEditingStaff(staff)}>Edit</button>
              <button onClick={() => handleDeleteStaff(staff._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Add Order</h2>

        <label>Items:</label>
        <input
          placeholder='dish name , quantity'
          type="text"
          value={newOrder.items.join(',')}
          onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value.split(',') })}
        />
        <label>Customer Name:</label>
        <input
          placeholder='your name'
          type="text"
          value={newOrder.customerName}
          onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
        />
        <label>Delivery Address:</label>
        <input
          placeholder='address'
          type="text"
          value={newOrder.deliveryAddress}
          onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
        />
        <button onClick={handleAddOrder}>Add Order</button>
      </div>

      <div>
        <h2>Order List</h2>
        <ul>
          {orderList.map((order) => (
            <li key={order._id}>
              <strong>Items:</strong> {order.items.name} x {order.items.quantity}<br />
              <strong>Customer Name:</strong> {order.customerName}<br />
              <strong>Delivery Address:</strong> {order.deliveryAddress}<br />
              <strong>Assigned Staff:</strong> {order.deliveryPartner ? order.deliveryPartner.name : 'Not Assigned'}<br />
              <strong>Order Time:</strong> {new Date(order.orderTime).toLocaleString()}<br />
              <strong>Estimated Delivery Time:</strong> {new Date(order.estimatedDeliveryTime).toLocaleString()}<br />
            </li>
          ))}
        </ul>
      </div>


      {editingStaff && (
        <div>
          <h2>Edit Staff</h2>
          <label>Name:</label>
          <input
            type="text"
            value={editingStaff.name}
            onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
          />
          <label>Availability:</label>
          <input
            type="checkbox"
            checked={editingStaff.availability}
            onChange={() => handleToggleAvailability(editingStaff)}
          />
          <button onClick={handleEditStaff}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
          <button onClick={() => handleDeleteStaff(editingStaff._id)}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default App;
