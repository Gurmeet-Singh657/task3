const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/get/v1/get_player_average/', (request, response) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getLast5Average();
    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
})

// app.post('/put/v1/put_player_data/', (request, response) => {
//     const db = dbService.getDbServiceInstance();

//     const result = db.PutPlayersData();
//     result
//         .then(data => response.json({ data: data }))
//         .catch(err => console.log(err));
// })

app.listen(process.env.PORT, () => console.log('app is running'));