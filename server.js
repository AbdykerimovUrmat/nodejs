let express = require('express'),
    app = express(),
    PORT = 3000,
    Datastore = require('nedb'),
    store = new Datastore({ filename: 'store', autoload: true }),
    bodyParser = require('body-parser'),
    storeKeys = [];
store.loadDatabase();

store.find({}, (err, docs) => {
    docs.forEach(element => {
        storeKeys.push(element.key);
    });
    console.log(storeKeys);
});
console.log(storeKeys);
app.set('view engine', 'jade');

app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.url);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.route('/new')
    .get((req, res) => {
        res.render('new', {
            page: 'Add New',
            links: storeKeys
        });
    })
    .post((req, res) => {
        let data = req.body;
        if (data.pageurl && data.pagename && data.pagecontent) {
            store.insert({
                page: data.pagename,
                content: data.pagecontent,
                key: data.pageurl                
            });
            storeKeys.push(data.pageurl);
        }
        res.redirect('/');
    });

app.get('/about', (req, res) => {
    res.render('about', { links: storeKeys });
});

app.get('/:page?', (req, res) => {
    let page = req.params.page, data;
    if (!page) page = 'home';
    store.find({key:page}, (err, docs) => {
        data = docs[0];
        if (!data) return res.redirect('/');
        data.links = storeKeys;
        res.render('main', data);    
    });

    
});

app.use(express.static(__dirname + '/public'));
let server = app.listen(PORT, () => {
    console.log("listening on port: " + PORT);
});