const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const MONGO_URL = 'mongodb+srv://adsrivastav179:Adarsh1234@cluster0.sdqffov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("mongoose connected");
        app.listen(PORT, () => {
            console.log("server is running");
        });
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));

const StaffModel = mongoose.model('Staff', {
    name: String,
    availability: Boolean,
    workingHourse: Array,
    dayOfOperation: Array,
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
});

const OrderModel = mongoose.model('Order', {
    items: [{ name: String, quantity: Number }],
    customerName: String,
    deliveryAddres: String,
    deliverPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    orderTime: { type: Date, default: Date.now },
    estimatedDeliveryTime: { type: Date },
});

app.post('/api/staff', async (req, res) => {
    try {
        const { name, availability, workingHourse, dayOfOperation } = req.body;
        const staff = new StaffModel({ name, availability, workingHourse, dayOfOperation });
        await staff.save();
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'internal server error' });
    }
});

app.get('/api/staff', async (req, res) => {
    try {
        const staffList = await StaffModel.find();
        res.json(staffList);
    } catch (error) {
        res.status(500).json({ error: 'internal server error' });
    }
});

app.put('/api/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, availability, workingHourse, dayOfOperation } = req.body;
        const updatedStaff = await StaffModel.findByIdAndUpdate(id, { name, availability, workingHourse, dayOfOperation }, { new: true });
        res.json(updatedStaff);
    } catch (error) {
        res.status(500).json({ error: 'internal server error' });
    }
});

app.delete('/api/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await StaffModel.findByIdAndDelete(id);
        res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post('/api/order', async (req, res) => {
    try {
        const { items, customerName, deliveryAddres } = req.body;
        const order = new OrderModel({
            items: { name: items[0], quantity: items[1] },
            customerName,
            deliveryAddres,
            estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000), // 20 mins
        });

        const availableStaff = await StaffModel.findOne({ availability: true });
        if (!availableStaff) {
            return res.status(400).json({ error: 'No availability of staff for delivery' });
        }

        order.deliverPartner = availableStaff.id;
        const id = availableStaff._id;
        const name = availableStaff.name;
        const availability = false;
        const workingHourse = [];

        availableStaff.orders.push(order._id);
        await StaffModel.findByIdAndUpdate(id, { name, availability, workingHourse }, { new: true });
        await Promise.all([order.save(), availableStaff.save()]);

        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/order', async (req, res) => {
    try {
        const orderList = await OrderModel.find().populate('deliverPartner', 'name');
        res.json(orderList);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});