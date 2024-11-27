var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
const path = require('path');


// Import the database configuration
var database = require('./config/database');  // Adjust the path if needed

var app = express();

app.engine('handlebars', exphbs.engine({
    extname: '.hbs'  // Specify the file extension as '.hbs'
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


console.log("Views path:", app.get('views')); 

// Setup middleware for parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB using the connection string from database.js
mongoose.connect(database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

// Import Movie model
var Movie = require('./models/movie');

// ROUTES

// Show all movies
app.get('/movies', async function (req, res) {
    try {
        const movies = await Movie.find();  // Await the result of Movie.find()
        res.render('movies/index.hbs', { movies: movies });
    } catch (err) {
        return res.status(500).send({ error: 'Failed to retrieve movies' });
    }
});

// Render the form to add a new movie
app.get('/movies/new', function (req, res) {
    res.render('movies/new.hbs');
});


// Insert new movie form submission
app.post('/movies', async function (req, res) {
    const { Movie_ID, Title, Released, Genre, Rating } = req.body;

    const newMovie = new Movie({
        Movie_ID: Movie_ID,
        Title: Title,
        Released: Released || '',
        Genre: Genre || '',
        Rating: Rating || 0
    });

    try {
        const movie = await newMovie.save(); // Use async/await to handle the Promise
        res.redirect(`/movies/${movie.Movie_ID}`);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to insert new movie' });
    }
});


// Show specific movie
app.get('/movies/:identifier', async function (req, res) {
    const identifier = req.params.identifier;
    const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { Movie_ID: parseInt(identifier) };

    try {
        const movie = await Movie.findOne(query);  // Await the result of Movie.findOne()
        if (!movie) {
            return res.status(404).send({ error: 'Movie not found' });
        }
        res.render('movies/show.hbs', { movie: movie });
    } catch (err) {
        return res.status(500).send({ error: 'Failed to retrieve movie' });
    }
});

// Update movie form
app.get('/movies/edit/:identifier', async function (req, res) {
    const identifier = req.params.identifier;
    const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { Movie_ID: parseInt(identifier) };

    try {
        const movie = await Movie.findOne(query);  // Await the result of Movie.findOne()
        if (!movie) {
            return res.status(404).send({ error: 'Movie not found' });
        }
        res.render('movies/edit.hbs', { movie: movie });
    } catch (err) {
        return res.status(500).send({ error: 'Failed to retrieve movie for editing' });
    }
});



// Handle the update form submission
app.post('/movies/:identifier', async function (req, res) {
    const identifier = req.params.identifier;
    const { movie_title, released } = req.body;

    const updates = {};
    if (movie_title) updates.Title = movie_title;
    if (released) updates.Released = released;

    const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { Movie_ID: parseInt(identifier) };

    try {
        const movie = await Movie.findOneAndUpdate(query, updates, { new: true });  // Await the result of Movie.findOneAndUpdate()
        if (!movie) {
            return res.status(500).send({ error: 'Failed to update the movie' });
        }
        res.redirect(`/movies/${movie.Movie_ID}`);
    } catch (err) {
        return res.status(500).send({ error: 'Failed to update the movie' });
    }
});

// Delete movie confirmation
app.get('/movies/delete/:identifier', async function (req, res) {
    const identifier = req.params.identifier;
    const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { Movie_ID: parseInt(identifier) };

    try {
        const movie = await Movie.findOne(query);
        if (!movie) {
            return res.status(404).send({ error: 'Movie not found' });
        }
        res.render('movies/delete.hbs', { movie: movie });
    } catch (err) {
        return res.status(500).send({ error: 'Failed to retrieve movie for deletion' });
    }
});

// Delete movie
app.post('/movies/:identifier/delete', async function (req, res) {
    const identifier = req.params.identifier;
    const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: mongoose.Types.ObjectId(identifier) }
        : { Movie_ID: parseInt(identifier) };

    try {
        const movie = await Movie.findOneAndDelete(query);
        if (!movie) {
            return res.status(404).send({ error: 'Movie not found' });
        }
        res.redirect('/movies');
    } catch (err) {
        return res.status(500).send({ error: 'Failed to delete the movie' });
    }
});

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
