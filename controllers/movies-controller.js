const errorWrapper = require("./error-wrrapper")
const Movie = require("../models/movies")

/**
 *  Возвращает все сохранённые текущим  пользователем фильмы.
 *  Обработка ошибок выполнена в errorWrapper.
 */
const getMovies = errorWrapper(async (req, res) => {
  const result = await Movie.find({})
  res.status(200).send(result)
})

/**
 * Создаёт фильм с переданными в теле.
 * Пример body:
 *  {
 *    "year": "1985".
 *    "image": "https://films.com/image.png".
 *    "owner": "64369be6e94aded9b99895d6".
 *    "nameRU": "А один"
 *    "nameEN": "A one"
 *    "country": "USA".
 *    "director": "Джеймс Кемерон".
 *    "duration": "120". (минуты)
 *    "thumbnail": "https://films.com/image.png".
 *    "description": "Описание"
 *    "trailerLink": "https://youtube.com/fsadf
 *  }
 *
 * Обработка ошибок выполнена в errorWrapper.
 */
const createMovie = errorWrapper(async (req, res) => {
  const result = await Movie.create(req.body)
  res.status(200).send(result)
})

/**
 * Удаляет сохранённый фильм по id.
 *
 * Обработка ошибок выполнена в errorWrapper.
 */
const deleteMovie = errorWrapper(async (req, res) => {
  res.status(200).send()
})

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
}
