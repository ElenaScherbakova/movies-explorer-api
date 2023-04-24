const { Schema, model } = require("mongoose");
const {
  requiredString, requiredId, required, requiredLink,
} = require("./types");

/**
 * year         — год выпуска фильма. Обязательное поле-строка.
 * image        — ссылка на постер к фильму. Обязательное поле-строка. Запишите её URL-адресом.
 * owner        — _id пользователя, который сохранил фильм. Обязательное поле.
 * nameRU       — название фильма на русском языке. Обязательное поле-строка.
 * nameEN       — название фильма на английском языке. Обязательное поле-строка.
 * movieId      — id фильма, который содержится в ответе сервиса MoviesExplorer. Обязательное поле.
 * country      — страна создания фильма. Обязательное поле-строка.
 * director     — режиссёр фильма. Обязательное поле-строка.
 * duration     — длительность фильма. Обязательное поле-число.
 * thumbnail    — миниатюрное изображение постера к фильму.
 *                Обязательное поле-строка. Запишите её URL-адресом.
 * description  — описание фильма. Обязательное поле-строка.
 * trailerLink  — ссылка на трейлер фильма. Обязательное поле-строка. Запишите её URL-адресом.
 * */

const userSchema = new Schema({
  year: requiredString(),
  image: requiredLink(),
  owner: requiredId(),
  nameRU: requiredString(),
  nameEN: requiredString(),
  country: requiredString(),
  director: requiredString(),
  duration: required({ type: Number }),
  thumbnail: requiredLink(),
  description: requiredString(),
  trailerLink: requiredString(),
})

module.exports = model("movie ", userSchema)
