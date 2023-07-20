const books = [
  {
    ISBN: "12345Book",
    title: "Tesla",
    pubDate: "2023-05-31",
    language: "en",
    numPage: 250,
    author: [1,2],
    publication: [1],
    category: ["tech","science"]
  }
]

const author = [
  {
    id: 1,
    name: "Harshal",
    books: ["12345Book","genesis"]
  },
  {
    id: 2,
    name: "Elon Musk",
    books: ["12345Book"]
  }
]

const publication = [
  {
    id: 1,
    name: "phoenix",
    books: ["12345Book"]
  },
  {
    id: 2,
    name: "writex",
    books: []
  }
]

module.exports = {books , author , publication};
