const chai = require("chai");
const chaiHttp = require("chai-http");
const serverPromise = require("../app")
const User = require("../models/users")
const Movie = require("../models/movies")
const { randomInt } = require("crypto")

chai.use(chaiHttp)

const { request, expect } = require("chai")

const TEST_MOVIE = {
  year: '2012',
  image: 'http://fdsfsd.com/erwer',
  nameRU: "Тестовый фильм",
  nameEN: "fd",
  country: "USA",
  director: "Greg",
  duration: 120,
  thumbnail: "http://dfddfwr.com/ewr",
  description: "ererew",
  trailerLink: "http://sdfsdf.com/ewrwer",
}

const signUp = async (app) => {
  const createResponse = await request(app).post("/signup").send({
    email: "mail-" + (randomInt(999999) + "").padStart(6, '0') + "@gmail.com",
    password: "1",
    name: 'Тестовый пользователь'
  })
  return createResponse.body
}
const signIn = async (app, { email }) => {
  const createResponse = await request(app).post("/signin").send({ email, password: '1' })
  return createResponse.body.token
}

const createMovie = async (app , token, movie) => {
  const createResponse = await request(app)
    .post("/movies")
    .set( "authorization", 'Bearer ' + token)
    .send(movie)
  return createResponse.body
}

describe("App", () => {
  let app
  let token
  let user
  beforeEach(async () => {
    app = await serverPromise
    user = await signUp(app)
    token = await signIn(app, user)
  })

  afterEach(async () => {
    request(app).keepOpen()
    // await User.deleteMany({ name: 'Тестовый пользователь' })
    await User.deleteMany({ name: 'Новое имя' })
    await Movie.deleteMany({ nameRU: 'Тестовый фильм' })
    app.close()
  })

  describe("Movies", () => {
    describe("GET /movies", () => {
      it("успех", async () => {
        const { statusCode, body } = await request(app)
          .get("/movies")
          .set( "authorization", 'Bearer ' + token)
          .send()
        expect(statusCode).to.equal(200)
        expect(body).to.be.instanceof(Array)
      })

      it("не авторизован", async () => {
        const resp = await request(app)
          .get("/movies")
          .send()
        expect(resp.statusCode).to.equal(401)
      })
    })

    describe('POST /movies', () => {
      it("успех", async () => {
        const resp = await request(app)
          .post("/movies")
          .set( "authorization", 'Bearer ' + token)
          .send(TEST_MOVIE)
        expect(resp.statusCode).to.equal(201)
      })

      it("Неверный объект", async () => {
        const resp = await request(app)
          .post("/movies")
          .set( "authorization", 'Bearer ' + token)
          .send({ })
        expect(resp.statusCode).to.equal(400)
      })

      it ("не авторизован", async () => {
        const resp = await request(app)
          .post("/movies")
          .send({ test: "test" })
        expect(resp.statusCode).to.equal(401)
      })
    })

    describe("DELETE /movies/:movieId", () => {
      let user1 = {
        name: "имя 1",
        email: "email1@gmail.com",
        password: "123"
      }

      afterEach(async () => {
        Movie.deleteMany(TEST_MOVIE)
      })

      it("успех", async () => {
        const movie = await createMovie(app, token, TEST_MOVIE)
        const resp = await request(app)
          .delete("/movies/" + movie._id)
          .set( "authorization", 'Bearer ' + token)
          .send()
        expect(resp.statusCode).to.equal(200)
      })

      it("не авторизован", async () => {
        const resp = await request(app)
          .delete("/movies/4")
          .send({ test: "test" })
        expect(resp.statusCode).to.equal(401)
      })

      it("Удаление несуществующего фильма", async () => {
        const resp = await request(app)
          .delete("/movies/64369be6e94aded9b99895d6")
          .set( "authorization", 'Bearer ' + token)
          .send()
        expect(resp.statusCode).to.equal(404)
      })

      it("Удаление чужого фильма", async () => {
        const _user = await signUp(app)
        const _token = await signIn(app, _user)
        const _movie = await createMovie(app, _token, TEST_MOVIE)
        const resp = await request(app)
          .delete("/movies/" + _movie._id)
          .set( "authorization", 'Bearer ' + token)
          .send()
        expect(resp.statusCode).to.equal(403)
      })
    })
  })

  describe("User", () => {
    describe("GET /users/me", () => {
      it("успех", async () => {
        const { statusCode, body } = await request(app)
          .get("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send()
        expect(statusCode).to.equal(200)
        expect(body.name).to.equal(user.name)
        expect(body.email).to.equal(user.email)
        expect(body.password).to.be.undefined
      })

      it("не авторизован", async () => {
        const resp = await request(app)
          .get("/users/me")
          .send()
        expect(resp.statusCode).to.equal(401)
      })
    })

    describe("PATCH /users/me", () => {
      it("упех", async () => {
        const { statusCode, body } = await request(app)
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: 'new@email.com',
            name: "Новое имя"
          })
        expect(statusCode).to.equal(200)
        expect(body.email).to.equal("new@email.com")
        expect(body.name).to.equal("Новое имя")
        expect(body.password).to.be.undefined
      })

      it("не авторизован", async () => {
        const resp = await request(app)
          .patch("/users/me")
          .send()
        expect(resp.statusCode).to.equal(401)
      })

      it("email не валиден", async () => {
        const resp = await request(app)
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: "@fe.er",
            name: "Имя"
          })
        expect(resp.statusCode).to.equal(400)
      })

      it("имя короче 2 символов не допустимо", async () => {
        const resp = await request(app)
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: "email@email.com",
            name: "A"
          })
        expect(resp.statusCode).to.equal(400)
      })

      it("имя длиннее 30 символов не допустимо", async () => {
        const resp = await request(app)
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: "email@email.com",
            name: "ВВВВ.ВВВВ.ВВВВ.ВВВВ.ВВВВ.ВВВВ.1"
          })
        expect(resp.statusCode).to.equal(400)
      })

    })
  })

  describe("/signin", () => {
    it("Успех", async () => {
      const resp = await request(app)
        .post("/signin")
        .send({
          email: user.email,
          password: "1",
        })
      expect(resp.statusCode).to.equal(200)
    })

    it("не правильный логин или пароль", async () => {
      const resp = await request(app)
        .post("/signin")
        .send({
          email: user.email,
          password: "1234"
        })
      expect(resp.statusCode).to.equal(401)
    })

    it("email не может быть пустым", async () => {
      const resp = await request(app)
        .post("/signin")
        .send({
          email: "",
          password: "1234"
        })
      expect(resp.statusCode).to.equal(400)
    })

    it("пароль не может быть пустым", async () => {
      const resp = await request(app)
        .post("/signin")
        .send({
          email: user.email,
          password: ""
        })
      expect(resp.statusCode).to.equal(400)
    })
  })

  describe("/signup", () => {

    it("Успех", async () => {
      const resp = await request(app)
        .post("/signup")
        .send({
          email: "another-test@user.com",
          password: "1234567",
          name: 'Имя'
        })
      expect(resp.statusCode).to.equal(201)
      try {
        await User.findByIdAndDelete(resp.body._id)
      } catch (e) {
        // Ignore
      }
    })

    it("Пустой email не возможен", async () => {
      const resp = await request(app).post("/signup").send({
        email: "",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Неправильный email не возможен", async () => {
      const resp = await request(app).post("/signup").send({
        email: "",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("пустой паролем не возможен", async () => {
      const resp = await request(app).post("/signup").send({
        email: "test@mail.com",
        password: "",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Имя не может быть пустым", async () => {
      const resp = await request(app).post("/signup").send({
        email: "test@mail.com",
        password: "1234567",
        name: ''
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Имя меньше 2 символов невозможно", async () => {
      const resp = await request(app).post("/signup").send({
        email: "test@mail.com",
        password: "1234567",
        name: 'А'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Имя больше 30 символов невозможно", async () => {
      const resp = await request(app).post("/signup").send({
        email: "test@mail.com",
        password: "1234567",
        name: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Пользователь с существующим email невозможен", async () => {
      const resp1 = await request(app).post("/signup").send({
        email: "another-test@gmail.com",
        password: "1234567",
        name: 'Имя'
      })
      r = request(app)
      const resp2 = await request(app).post("/signup").send({
        email: "another-test@gmail.com",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp2.statusCode).to.equal(409)
      try {
        await User.findByIdAndDelete(resp1.body._id)
      } catch (e) {
        // Ignore
      }
    })
  })
})
