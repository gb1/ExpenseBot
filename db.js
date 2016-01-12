var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/expenses');

var db = mongoose.connection;

db.on('error', console.log.bind(console, 'connection error'));
db.once('open', function(callback){
   console.log('connected to db');
});

var expenseScheme = mongoose.Schema({
    user: String,
    date: Date,
    url: String,
    amount: Number
});

exports.Expense =  mongoose.model('Expense', expenseScheme);

