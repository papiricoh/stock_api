const request = require("supertest");
const app = require("../app"); // Importa tu aplicación Express

describe("GET /api/users", () => {
  it("debería devolver una confirmacion de usuario", async () => {
    const res = await request(app).get("/api/users/steam:20000");

    expect(res.statusCode).toEqual(200);
  });
});