const router = require("express").Router();
const { getMovies, createMovie, deleteMovie } = require("../controllers/movies-controller")
const { createMovieCheck, deleteMovieCheck } = require("../celebrate/movies-checks");

router.get("/", getMovies)
router.post("/", createMovieCheck, createMovie)
router.delete("/:movieId", deleteMovieCheck, deleteMovie)

module.exports = router
