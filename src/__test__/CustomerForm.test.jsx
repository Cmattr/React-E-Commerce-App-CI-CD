import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';

const mock = new MockAdapter(axios);

const renderWithRouter = (component) => {
    return render(<Router>{component}</Router>);
};

describe('CustomerForm', () => {
    afterEach(() => {
        mock.reset();
    });

    test('renders form with empty fields', () => {
        renderWithRouter(<CustomerForm />);

        expect(screen.getByLabelText(/Name:/i)).toHaveValue('');
        expect(screen.getByLabelText(/Phone:/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email:/i)).toHaveValue('');
    });

    test('shows validation errors on empty form submission', async () => {
        renderWithRouter(<CustomerForm />);

        fireEvent.click(screen.getByText(/Submit/i));

        expect(await screen.findByText(/Customer name is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Phone is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Customer email is required/i)).toBeInTheDocument();
    });

    test('submits form successfully when fields are filled', async () => {
        mock.onPost('http://127.0.0.1:5000/customers').reply(200);

        renderWithRouter(<CustomerForm />);

        fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Phone:/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john@example.com' } });
        
        fireEvent.click(screen.getByText(/Submit/i));

        await waitFor(() => {
            expect(screen.getByText(/Customer has been successfully Added/i)).toBeInTheDocument();
        });
    });

    test('shows error message on submission failure', async () => {
        mock.onPost('http://127.0.0.1:5000/customers').reply(500);

        renderWithRouter(<CustomerForm />);

        fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Phone:/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'john@example.com' } });

        fireEvent.click(screen.getByText(/Submit/i));

        await waitFor(() => {
            expect(screen.getByText(/Request failed with status code 500/i)).toBeInTheDocument();
        });
    });

    test('loads and displays customer data when editing', async () => {
        const customer = { id: 1, name: 'Jane Doe', email: 'jane@example.com', phone: '0987654321' };
        mock.onGet('http://127.0.0.1:5000/customer/1').reply(200, customer);

        renderWithRouter(<CustomerForm selectedcustomer={customer} />);

        expect(screen.getByLabelText(/Name:/i)).toHaveValue('Jane Doe');
        expect(screen.getByLabelText(/Phone:/i)).toHaveValue('0987654321');
        expect(screen.getByLabelText(/Email:/i)).toHaveValue('jane@example.com');
    });
});
