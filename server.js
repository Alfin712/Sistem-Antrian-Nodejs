const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//koneksi db
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "antrian"
})

// request login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/authentic', 'AuLogin.jsx'));
});

app.post('/', (req, res) => {
    const sql = "SELECT * FROM user WHERE `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            console.error("Error:", err);
            return res.json("Error");
        }
        console.log("Query Result:", data);
        if (data.length > 0) {
            const role = data[0].role; // Ambil peran dari data pertama (jika ada)
            return res.json({ status: "Success", role });
        } else {
            console.log("No matching data found");
            return res.json("Failed");
        }
    })
});

// register
app.get('/Register', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/authentic', 'AuRegister.jsx'));
});

app.post('/Register', (req, res) => {
    const userSql = "INSERT INTO user (role, email, password) VALUES (?, ?, ?)";
    const userParams = ["pelanggan", req.body.email, req.body.password];

    db.beginTransaction(function (err) {
        if (err) {
            console.error("Transaction begin error:", err);
            return res.status(500).json("Error");
        }

        db.query(userSql, userParams, (err, userData) => {
            if (err) {
                console.error("User query error:", err);
                db.rollback(function () {
                    return res.status(500).json("Error");
                });
            } else {
                const id_users = userData.insertId; // Mendapatkan ID pengguna yang baru saja dimasukkan

                const pelangganSql = "INSERT INTO pelanggan (nama_pelanggan, id_users) VALUES (?, ?)";
                const pelangganParams = [req.body.nama_pelanggan, id_users];

                db.query(pelangganSql, pelangganParams, (err, pelangganData) => {
                    if (err) {
                        db.rollback(function () {
                            return res.status(500).json("Error");
                        });
                    }

                    db.commit(function (err) {
                        if (err) {
                            db.rollback(function () {
                                return res.status(500).json("Error");
                            });
                        }

                        return res.status(200).json("Data inserted successfully");
                    });
                });
            }
        });
    });
});


// Menambahkan rute
app.get('/dashboard/history-teller', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'TellerHistory.jsx'));
});

app.get('/dashboard/teller', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'TellerIndex.jsx'));
});

app.get('/dashboard/cs', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'CsIndex.jsx'));
});

app.get('/dashboard/history-cs', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'CsHistory.jsx'));
});

app.get('/dashboard/teller-ticket', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'TicketTeller.jsx'));
});

app.get('/dashboard/cs-ticket', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'TicketCs.jsx'));
});

app.get('/dashboard/pelanggan', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistem-antrian-online/src/pages/content', 'user.jsx'));
});

//api endpoint
app.get('/api/hello', (req, res) => {
    res.json({ message: 'hai' })
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});