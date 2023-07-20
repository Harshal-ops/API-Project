const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");

//Database
const database = require("./database/database");

//Models
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

//Initialize
const booky = express();


booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL,
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}
).then(() => console.log("Connection Established"));






/*
Route                   /
Description             Get all the books
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/
booky.get("/", async (req,res) => {
const getAllBooks = await BookModel.find();

return res.json(getAllBooks);
});

/*
Route                   /is
Description             Get specific book based on ISBN
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/

booky.get("/is/:isbn", async (req,res) => {
  const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn});


  if(!getSpecificBook.length) {
    return res.json({error: `No book found for the ISBN no ${req.params.isbn}`});
  }

  return res.json({book: getSpecificBook});
});

/*
Route                   /c
Description             Get specific book based on category
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/

booky.get("/c/:category", async (req,res) => {
  const getSpecificBook = await BookModel.findOne({category: req.params.category});


  if(!getSpecificBook.length) {
    return res.json({error: `No book found for the category ${req.params.category}`});
  }

  return res.json({book: getSpecificBook});
});

/*
Route                   /l
Description             Get specific book based on language
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/
booky.get("/l/:language",(req,res) => {
  const getSpecificBook = database.books.filter(
    (book) => book.language.includes(req.params.language)
  )

  if(getSpecificBook.length === 0) {
    return res.json({error: `No book found for the language ${req.params.language}`});
  }

  return res.json({book: getSpecificBook});
});


/*
Route                   /author
Description             Get all the books for the author
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/

booky.get("/author", async (req,res) => {
  const getAllAuthors = await AuthorModel.find();
  return res.json(getAllAuthors);
});

/*
Route                   /author/book
Description             Get specific book based on author
Access                  PUBLIC
Parameter               isbn
Methods                 GET
*/

booky.get("/author/book/:isbn", (req,res) => {
  const getSpecificAuthor = database.author.filter(
    (author) => author.books.includes(req.params.isbn)
  );

  if(getSpecificAuthor.length === 0){
    return res.json({
      error: `No author found for the book of ${req.params.isbn}`
    });
  }
  return res.json({authors: getSpecificAuthor});
});

/*
Route                   /publications
Description             List all the books for the publication
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/

booky.get("/publications", async (req,res) => {
  const getAllPublications = await PublicationModel.find();
  return res.json(getAllPublications);
});

/*
Route                   /publications
Description             List all the books for the publication
Access                  PUBLIC
Parameter               NONE
Methods                 GET
*/
booky.get("/publications/:id",(req,res) => {
  const getSpecificPublication = database.publication.filter(
    (publication) => publication.books.includes(req.params.id)
  )

  if(getSpecificPublication.length === 0) {
    return res.json({error:`No book found for the publication ${req.params.id}`});
  }

  return res.json({publications: getSpecificPublication});

});

/*
Route                   /book/new
Description             Add new books
Access                  PUBLIC
Parameter               NONE
Methods                 POST
*/
booky.post("/book/new",async (req,res) => {
  const { newBook } = req.body;
  const addNewBook = BookModel.create(newBook);
  return res.json({
    books: addNewBook,
    message: "Book was added!!"
  });
});

/*
Route                   /author/new
Description             Add new authors
Access                  PUBLIC
Parameter               NONE
Methods                 POST
*/
booky.post("/author/new",async(req,res) => {
  const { newAuthor } = req.body;
  const addNewAuthor = AuthorModel.create(newAuthor);
  return res.json({
    author: addNewAuthor,
    message: "Author was added!!"
  });
  });

  /*
  Route                   /publication/new
  Description             Add new publications
  Access                  PUBLIC
  Parameter               NONE
  Methods                 POST
  */
booky.post("/publication/new",async(req,res) => {
  const { newPublication } = req.body;
  const addNewPublication = PublicationModel.create(newPublication);
  return res.json({
    publication: addNewPublication,
    message: "Publication was added!!"

  });
});

/*
Route                   /book/author/update
Description             Add new authors
Access                  PUBLIC
Parameter               isbn
Methods                 PUT
*/
booky.put("/book/author/update/:isbn", async (req,res) => {
  //Update the book database
  const updatedBook = await BookModel.findOneAndUpdate(
    {
      ISBN: req.params.isbn
    },
    {
      $addToSet : {
        authors: req.body.newAuthor
      }
    },
    {
      new: true
    }
  );

  //Update the author database
  const updatedAuthor = await AuthorModel.findOneAndUpdate(
    {
      id: req.body.newAuthor
    },
    {
      $addToSet: {
        books: req.params.isbn
      }
     },
   {
     new: true
   }
 );

return res.json({
  books: updatedBook,
  authors: updatedAuthor,
  message: "New author was added!!!"

});

});



/*
Route                   /publication/update/book
Description             update/add new publication
Access                  PUBLIC
Parameter               isbn
Methods                 PUT
*/
booky.put("/publication/update/book/:isbn", (req,res) => {
  //Update the publication database
  database.publication.forEach((pub) => {
    if(pub.id === req.body.pubId) {
      return pub.books.push(req.params.isbn);
    }

    });
  //Update the book database
   database.books.forEach((book) => {
     if(book.ISBN === req.params.isbn) {
      book.publications === req.body.pubId;
      return;
     }

    });
    return res.json(
      {
        books: database.books,
        publicatons: database.publication,
        message: "Successfully updated publicatons"
      }
    );
  });

  /*
  Route                   /book/update
  Description             update/add new book
  Access                  PUBLIC
  Parameter               isbn
  Methods                 PUT
  */
  booky.put("/book/update/:isbn",async (req,res) => {
    const updatedBook = await BookModel.findOneAndUpdate(
      {
       ISBN: req.params.isbn
     },
     {
       title: req.body.bookTitle
     },
     {
       new: true
     }
   );
   return res.json({
     books: updatedBook
   });
 });




  /*
  Route                   /book/delete
  Description             Delete a book
  Access                  PUBLIC
  Parameter               isbn
  Methods                 DELETE
  */
  booky.delete("/book/delete/:isbn", async (req,res) => {
    const updatedBookDatabase = await BookModel.findOneAndDelete(
      {
      ISBN: req.params.isbn
      }
  );

  return res.json({
    books: updatedBookDatabase
  });
});

  /*
  Route                   /book/delete/author
  Description             Delete author and related book from author
  Access                  PUBLIC
  Parameter               isbn,authorId
  Methods                 DELETE
  */
booky.delete("/book/delete/author/:isbn/:authorId", (req,res) => {
  //Update the book database
  database.books.forEach((book) => {
    if(book.ISBN === req.params.isbn) {
      const newAuthorList = book.author.filter(
        (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
      );

    book.author = newAuthorList;
    return;
  }

  });

//Update the author database
database.author.forEach((eachAuthor) => {
  if(eachAuthor.id === parseInt(req.params.authorId)) {
    const newBookList = eachAuthor.books.filter(
      (book) =>  book !== req.params.isbn
    );
      eachAuthor.books = newBookList;
      return;
  }

});
 return res.json({
   book: database.books,
   author: database.author,
   message: "Author deleted Successfully"
 });

});






booky.listen(3000, () => {
  console.log("Server is up and running");
});
