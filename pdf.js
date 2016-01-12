var pdfkit = require('pdfkit');
var https = require('https');
var fs = require('fs');
var async = require('async');

module.exports = {

    doc : null,

    options: {
        hostname: 'files.slack.com',
        port: 443,
        path: '',
        method: 'GET',
        headers: {
            'Authorization' : 'Bearer ' + fs.readFileSync('./slack_token.txt', 'utf8').trim()
        }
    },

    generate: function(files, callback){
        this.doc = new pdfkit();
        this.noFiles = files.length;
        async.map(files, (file, cb) =>{
            this.addFile(file, cb);
        }, (err, results) => {
            //this.doc.pipe(fs.createWriteStream('./out.pdf'));
            this.doc.end();
            callback(this.doc);
        });
    },

    addFile: function(path, cb){
        this.options.path = path;
        https.get(this.options, (res) => {
            var data = [];
            res.on('data', (chunk) => {
                data.push(chunk);
            }).on('end', () => {
                var buffer = Buffer.concat(data);
                this.doc.image(buffer, 0, 0, {fit: [600, 600]});
                this.doc.addPage();
                cb();
            })
        });
    }
}

