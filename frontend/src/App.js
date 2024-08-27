import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importing the CSS file

function App() {
    const [currencies, setCurrencies] = useState([]);
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [amount, setAmount] = useState(1);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history')) || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch available currencies on mount
        axios.get('http://localhost:5000/api/currencies')
            .then(response => setCurrencies(Object.keys(response.data)))
            .catch(error => console.error('Error fetching currencies:', error));
    }, []);

    const handleConvert = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/convert', {
                base_currency: baseCurrency,
                target_currency: targetCurrency,
                amount: amount
            });
            const result = response.data.convertedAmount;
            setConvertedAmount(result);

            // Save to history
            const newEntry = {
                baseCurrency,
                targetCurrency,
                amount,
                convertedAmount: result,
                date: new Date().toLocaleString(),
            };
            const updatedHistory = [newEntry, ...history];
            setHistory(updatedHistory);
            localStorage.setItem('history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error during conversion:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="converter-card">
                <h1 className="text-center mb-4"  >Currency Converter</h1>
                <div className="card-body">
                    <div className="row">
                        <div className="col-12 col-md-5 mb-3">
                            <label htmlFor="baseCurrency">From:</label>
                            <select className="form-control" value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)}>
                                {currencies.map(currency => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-5 mb-3">
                            <label htmlFor="targetCurrency">To:</label>
                            <select className="form-control" value={targetCurrency} onChange={e => setTargetCurrency(e.target.value)}>
                                {currencies.map(currency => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-2 mb-3">
                            <label htmlFor="amount">Amount:</label>
                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="text-center">
                        <button className="btn btn-primary" onClick={handleConvert} disabled={loading}>
                            {loading ? 'Converting...' : 'Convert'}
                        </button>
                    </div>
                    {convertedAmount && (
                        <div className="text-center mt-4">
                            <h4>{`${amount} ${baseCurrency} = ${convertedAmount} ${targetCurrency}`}</h4>
                        </div>
                    )}
                </div>
            </div>
            <div className="history-card">
                <h2 className="text-center mb-4">Conversion History</h2>
                <ul className="list-group">
                    {history.map((entry, index) => (
                        <li key={index} className="list-group-item">
                            {`${entry.amount} ${entry.baseCurrency} to