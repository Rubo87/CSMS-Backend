const pool = require('../client.js');

const getData = (req, res, dataQuery) => {     
    pool.query(dataQuery, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

module.exports = {
    getData: getData
};