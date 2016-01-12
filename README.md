##Expense Bot for Slack

![alt text](https://raw.githubusercontent.com/gb1/ExpenseBot/master/demo.gif "demo")

###Installation
* Create a "db" directory in the root and run db.sh to start MongoDB.
* Make a file `slack_token.txt` in the root and place your Slack API token in it.
* `npm install`
* `npm start`


###Usage
* DM expense bot an image putting the expense amount in the comment field. 
* DM expense bot with one of the following commands:
* `help` - show help
* `list` - list all receipts for the current month
* `total` - total amount for the current month
* `pdf` - generate a monthly PDF report