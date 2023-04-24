const chai = require("chai");
const chaiHttp = require("chai-http");
const serverPromise = require("../app")
const users = require("../models/users")

chai.use(chaiHttp)

const { request, expect } = require("chai")
const {requiredString, requiredLink, requiredId, required} = require("../models/types");
const TEST_USER = {
  email: "test@user.com",
  name: "Test user",
  password: 'Passw0rd_'
}

const TEST_MOVIE = {
  year: '2012',
  image: 'http://fdsfsd.com/erwer',
  owner: "64369be6e94aded9b99895d6",
  nameRU: "a",
  nameEN: "fd",
  movieId: "64369be6e94aded9b99895d6",
  country: "USA",
  director: "Greg",
  duration: 120,
  thumbnail: "http://dfddfwr.com/ewr",
  description: "ererew",
  trailerLink: "http://sdfsdf.com/ewrwer",
}

describe("App", () => {
  let app
  let r
  let id
  let token

  before(async () => {
    app = await serverPromise
    r = request(app)
    const createResponse = await r.post("/signup").send(TEST_USER)
    id = createResponse.body._id
    r = request(app)
    const resp = await r.post("/signin").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    token = resp.body.token
  })

  after(async () => {
    request(app).keepOpen()
    await users.findByIdAndDelete(id)
    app.close()
  })

  beforeEach(() => {
    r = request(app)
  })

  describe("Movies", () => {
    describe("GET /movies", () => {
      it("успех", async () => {
        const { statusCode, body } = await r
          .get("/movies")
          .set( "authorization", 'Bearer ' + token)
          .send()
        expect(statusCode).to.equal(200)
        expect(body).to.be.instanceof(Array)
      })

      it("не авторизован", async () => {
        const resp = await r
          .get("/movies")
          .send()
        expect(resp.statusCode).to.equal(401)
      })
    })

    describe('POST /movies', () => {
      it("успех", async () => {
        const resp = await r
          .post("/movies")
          .set( "authorization", 'Bearer ' + token)
          .send(TEST_MOVIE)
        expect(resp.statusCode).to.equal(200)
      })

      it ("не авторизован", async () => {
        const resp = await r
          .post("/movies")
          .send({ test: "test" })
        expect(resp.statusCode).to.equal(401)
      })
    })

    describe("DELETE /movies/:movieId", () => {
      it("успех", async () => {
        const resp = await r
          .delete("/movies/64369be6e94aded9b99895d6")
          .set( "authorization", 'Bearer ' + token)
          .send({ test: "test" })
        expect(resp.statusCode).to.equal(200)
      })

      it("не авторизован", async () => {
        const resp = await r
          .delete("/movies/4")
          .send({ test: "test" })
        expect(resp.statusCode).to.equal(401)
      })
    })
  })

  describe("User", () => {
    describe("GET /users/me", () => {
      it("успех", async () => {
        const { statusCode, body } = await r
          .get("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send()
        expect(statusCode).to.equal(200)
        expect(body.name).to.equal(TEST_USER.name)
        expect(body.email).to.equal(TEST_USER.email)
        expect(body.password).to.be.undefined
      })

      it("не авторизован", async () => {
        const resp = await r
          .get("/users/me")
          .send()
        expect(resp.statusCode).to.equal(401)
      })
    })

    describe("PATCH /users/me", () => {
      it("упех", async () => {
        const { statusCode, body } = await r
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: TEST_USER.email,
            name: "Новое имя"
          })
        expect(statusCode).to.equal(200)
        expect(body.email).to.equal(TEST_USER.email)
        expect(body.name).to.equal("Новое имя")
        expect(body.password).to.be.undefined
      })

      it("не авторизован", async () => {
        const resp = await r
          .patch("/users/me")
          .send()
        expect(resp.statusCode).to.equal(401)
      })

      it("email не валиден", async () => {
        const resp = await r
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: "@fer.er",
            name: "Имя"
          })
        expect(resp.statusCode).to.equal(400)
      })

      it("имя короче 2 символов не допустимо", async () => {
        const resp = await r
          .patch("/users/me")
          .set("authorization", 'Bearer ' + token)
          .send({
            email: "email@email.com",
            name: "A"
          })
        expect(resp.statusCode).to.equal(400)
      })

      it("имя длиннее 30 символов не допустимо", async () => {
        const resp = await r
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
      const resp = await r.post("/signin").send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      })
      expect(resp.statusCode).to.equal(200)
    })

    it("не правильный логин или пароль", async () => {
      const resp = await r.post("/signin").send({
        email: TEST_USER.email,
        password: "1234"
      })
      expect(resp.statusCode).to.equal(401)
    })

    it("email не может быть пустым", async () => {
      const resp = await r.post("/signin").send({
        email: "",
        password: "1234"
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("пароль не может быть пустым", async () => {
      const resp = await r.post("/signin").send({
        email: TEST_USER.email,
        password: ""
      })
      expect(resp.statusCode).to.equal(400)
    })
  })

  describe("/signup", () => {

    it("Успех", async () => {
      const resp = await r.post("/signup").send({
        email: "another-test@user.com",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(201)
      try {
        await users.findByIdAndDelete(resp.body._id)
      } catch (e) {
        // Ignore
      }
    })

    it("Пустой email не возможен", async () => {
      const resp = await r.post("/signup").send({
        email: "",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Неправильный email не возможен", async () => {
      const resp = await r.post("/signup").send({
        email: "",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("пустой паролем не возможен", async () => {
      const resp = await r.post("/signup").send({
        email: "test@mail.com",
        password: "",
        name: 'Имя'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Имя не может быть пустым", async () => {
      const resp = await r.post("/signup").send({
        email: "test@mail.com",
        password: "1234567",
        name: ''
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Имя меньше 2 символов невозможно", async () => {
      const resp = await r.post("/signup").send({
        email: "test@mail.com",
        password: "1234567",
        name: 'А'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Имя больше 30 символов невозможно", async () => {
      const resp = await r.post("/signup").send({
        email: "test@mail.com",
        password: "1234567",
        name: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      })
      expect(resp.statusCode).to.equal(400)
    })

    it("Пользователь с существующим email невозможен", async () => {
      const resp1 = await r.post("/signup").send({
        email: "another-test@gmail.com",
        password: "1234567",
        name: 'Имя'
      })
      r = request(app)
      const resp2 = await r.post("/signup").send({
        email: "another-test@gmail.com",
        password: "1234567",
        name: 'Имя'
      })
      expect(resp2.statusCode).to.equal(409)
      try {
        await users.findByIdAndDelete(resp1.body._id)
      } catch (e) {
        // Ignore
      }
    })
  })
})
