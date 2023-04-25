const mysql = require('mysql');
const dotenv = require('dotenv');
const cron = require('node-cron');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
});

const INSERT_QUERY = 'INSERT INTO playerlist(id,PlayerName,Match1, Match2,Match3,Match4,Match5,Match6,Match7,Match8,Match9,timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?) ON DUPLICATE KEY UPDATE PlayerName = VALUES(PlayerName), Match1 = VALUES(Match1), Match2= VALUES(Match2) , Match3= VALUES(Match3) ,Match4= VALUES(Match4),Match5= VALUES(Match5),Match6= VALUES(Match6),Match7= VALUES(Match7),Match8= VALUES(Match8),Match9= VALUES(Match9),timestamp= VALUES(timestamp)';

cron.schedule('*/1 * * * *', () => {
    DoCronJob();
})
    function DoCronJob()
    {
        function MakeConnection(send) {
        send?.forEach(data => {
            connection.query(INSERT_QUERY, [data.id, data['Player Name'], data['Match 1'], data['Match 2'], data['Match 3'],
            data['Match 4'], data['Match 5'], data['Match 6'], data['Match 7'], data['Match 8'], data['Match 9'], data['timestamp']], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`Data Synced Successfully`);
                }
            });
        })
    }

    console.log('Syncing Data to MySQl Daily');
    GettingDataFromExcel();
    function GettingDataFromExcel() {
        
        let send = [];
        fetch('https://sheets.googleapis.com/v4/spreadsheets/1KsjUgH8XtOzNmTvlwHs78B0TV-VBrcUWgx_uQdSTPx0/values/Sheet1?key=AIzaSyARf7Xk9E_Pp6zwdD1kJu5x_mC3HAxGPgE')
        .then(response => response.json())
        .then(data => {
            let values = data.values;
            let keys = data.values[0];
            let send = []
            for (let i = 1; i < values.length; i++) {
                let temp = {}
                temp['id'] = i;
                values[i].forEach((val, index) => {
                    temp[keys[index]] = (index === 0 ? val : parseInt(val));
                })
                temp['timestamp'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
                send.push(temp)
            }
            MakeConnection(send);
        })
        .catch(error => {
            console.log(error);
        });
        return send;
    }
}



class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getLast5Average() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT PlayerName,(Match9+Match8+Match7+Match6+Match5)/5 AS AVGSCORE FROM playerlist;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getFullDetails()
    {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT id,PlayerName,Match1,Match2,Match3,Match4,Match5,Match6,Match7,Match8,Match9,timestamp FROM playerlist;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async PutPlayersData()
    {
        try {
            const response = await new Promise((resolve, reject) => {
                    DoCronJob();
                })
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;