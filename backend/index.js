import express from 'express';
import Freecurrencyapi from '@everapi/freecurrencyapi-js';
import cors from 'cors';

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin:'*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']

}));

app.use(express.json());

// Initialize the currency API client
const currencyClient = new Freecurrencyapi("4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2");

// Route to get the list of currencies
app.get('https://localhost:5000/api/currencies', async (req, res) => {
  try {
    const response = await currencyClient.currencies();
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).send('Error fetching currencies');
  }
});

// Route to convert currency
app.post('https://localhost:5000/api/convert', async (req, res) => {
    const { base_currency, target_currency, amount } = req.body;


    // Validate input
    if (!base_currency || !target_currency || !amount) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        // Call the external API
        const response = await currencyClient.latest({
            base_currency,
            currencies: target_currency,
        });


        const rate = response.data[target_currency];

        if (rate) {
            const convertedAmount = amount * rate;
            res.json({ convertedAmount });
        } else {
            console.error('Invalid currency pair or rate not found');
            res.status(400).send('Invalid currency pair');
        }
    } catch (error) {
        console.error('Error fetching conversion rate:', error.message || error);
        res.status(500).send('Error converting currency');
    }
});


app.listen(port, () => {
  console.log('Server running on port ${port}');
});
