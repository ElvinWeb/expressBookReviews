const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const userExists = async (username) => {
            return users.some(user => user.username === username);
        };

        if (await userExists(username)) {
            return res.status(409).json({ message: "Username already exists" });
        }

        users.push({ username, password });
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error during registration", error: error.message });
    }
});



// Get the book list available in the shop
public_users.get('/', async (req, res) => {

    const getBooks = () => {
        return new Promise((resolve, reject) => {
            if (books) {
                resolve(books);
            } else {
                reject("No books found");
            }
        });
    };

    try {
        const results = await getBooks();
        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbnParam = req.params.isbn;

    const getBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        });
    };

    try {
        const results = await getBookByISBN(isbnParam);
        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const authorParam = req.params.author.toLowerCase();
    const getBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
            const results = Object.values(books).filter((book) => {
                const bookAuthor = book.author?.toLowerCase().replace(/\s+/g, '');
                return bookAuthor === author;
            });

            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found for this author");
            }
        });
    };

    try {
        const results = await getBooksByAuthor(authorParam);
        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const titleParam = req.params.title.toLowerCase().replace(/\s+/g, '');
    const getBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
            const results = Object.values(books).filter((book) => {
                const formattedTitle = book.title.toLowerCase().replace(/\s+/g, '');
                return formattedTitle === title;
            });

            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found with this title");
            }
        });
    };

    try {
        const results = await getBooksByTitle(titleParam);
        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const isbnParam = req.params.isbn;
        const getReviews = async (isbn) => {
            return books[isbn] ? books[isbn].reviews : null;
        };

        const reviews = await getReviews(isbnParam);
        if (reviews) {
            return res.status(200).json(reviews);
        } else {
            return res.status(404).json({ message: "No reviews found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving reviews", error: error.message });
    }
});

module.exports.general = public_users;
