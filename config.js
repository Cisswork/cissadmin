import mysql from 'mysql';

const pool = mysql.createPool({
  host: '82.112.238.22',
  user: 'root',
  password: 'Kil@123456',
  port: '3306',
  database: 'cissadmin',
  connectionLimit: 100,
  charset: 'utf8mb4'
});

const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, con) => {
      if (err) return reject(err);
      resolve(con);
    });
  });
};

export default connection;

