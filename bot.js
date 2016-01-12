var Botkit = require('botkit');
var Expense = require('./db').Expense;
var fs = require('fs');
var moment = require('moment');
var pdf = require('./pdf.js');
var url = require('url');

var token = fs.readFileSync('./slack_token.txt', 'utf8');

var controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: token
}).startRTM();

controller.hears('help','direct_message',function(bot,message) {

    bot.reply(message, 'Hi, I\'m Expense Bot!');
    bot.reply(message, 'Try sending me a file with an amount in the description to upload a receipt.');
    bot.reply(message, 'I\'ll respond to the following commands:');
    bot.reply(message, '*list* - I\'ll send you back a list of all your receipts for this month');
    bot.reply(message, '*total* - I\'ll send you back the total amount of your receipts for this month');
    bot.reply(message, '*pdf* - I\'ll create a PDF file of your receipts for this month');

});

controller.on('file_share',function(bot,message) {


    if(message.text.includes('expense')){ //bot user?
        return;
    }

    var amount = 0;

    if(typeof message.file.initial_comment !== 'undefined'){
        amount = message.file.initial_comment.comment;
    }

    var expense = new Expense({
       user: message.file.user,
       date: new Date(message.file.created * 1000),
        url: message.file.url_private,
        amount: amount
    });

    expense.save(function(err){
        if(err){
            bot.reply(message, 'Catastrophic failure');
        }else{
            bot.reply(message, 'Expense created for £' + amount);
        }
    });
});

controller.hears('list','direct_message',function(bot,message) {

    var startOfMonth = moment([moment().year(), moment().month()]).toDate();

    Expense.find({user: message.user, date: { '$gte' : startOfMonth }}, function(err, expenses){
        expenses.forEach(function(expense){
            bot.reply(message, '' + expense.date + expense.url);
        });
    }.bind(this));

});

controller.hears('total','direct_message',function(bot,message) {

    var startOfMonth = moment([moment().year(), moment().month()]).toDate();

    var total = 0;

    Expense.find({user: message.user, date: { '$gte' : startOfMonth }}, function(err, expenses){
        expenses.forEach(function(expense){
            total += parseFloat(expense.amount);
        });
        bot.reply(message, 'Total for this month is £' + parseFloat(total).toFixed(2));
    }.bind(this));

});

controller.hears('pdf','direct_message',function(bot,message) {

    var files = [];
    var startOfMonth = moment([moment().year(), moment().month()]).toDate();

    bot.reply(message, 'Generating report...');

    Expense.find({user: message.user, date: { '$gte' : startOfMonth }}, function(err, expenses){
        expenses.forEach(function(expense){
            if(expense.url) {
                files.push(url.parse(expense.url).path);
            }
        });

        pdf.generate(files, (pdfFile) =>{

            var Slack = require('node-slack-upload');
            var slack = new Slack(token);

            slack.uploadFile({
                file: pdfFile,
                filetype: 'application/pdf',
                title: 'Expense report',
                initialComment: 'Your report sir!',
                channels: message.user
            }, function(err) {
                if (err) {
                    console.error('error!' + err);
                }
                else {
                    console.log('sent the PDF');
                }
            });
        });

    }.bind(this));
});