const express = require('express');
const router = express.Router();

let employees = [
    { id: 1, name: 'Kumar', role: 'Manager', salary: 50000, status: 'Active' },
    { id: 2, name: 'Priya', role: 'Developer', salary: 40000, status: 'Active' }
];

router.get('/', (req, res) => res.json(employees));

router.post('/', (req, res) => {
    const newEmp = { id: employees.length + 1, ...req.body };
    employees.push(newEmp);
    res.status(201).json(newEmp);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    employees = employees.map(emp => emp.id == id ? { ...emp, ...req.body } : emp);
    res.json({ message: 'Employee updated successfully' });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    employees = employees.filter(emp => emp.id != id);
    res.json({ message: 'Employee deleted' });
});

module.exports = router;