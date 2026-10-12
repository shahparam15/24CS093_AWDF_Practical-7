process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import app from "../src/server.js";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";

let server;
let baseUrl;

const user1Data = {
  email: `test_user1_${Date.now()}@charusat.edu.in`,
  password: "password123",
};

const user2Data = {
  email: `test_user2_${Date.now()}@charusat.edu.in`,
  password: "password456",
};

let user1Token = "";
let user2Token = "";
let user1TaskId = "";

before(async () => {
  // Start server on an ephemeral port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  // Cleanup test documents
  await User.deleteMany({ email: { $in: [user1Data.email, user2Data.email] } });
  if (user1TaskId) {
    await Task.findByIdAndDelete(user1TaskId);
  }
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});

describe("Practical 7: Authentication & Middleware API Tests", () => {
  // 1. Registration
  test("POST /auth/register - Successfully register User 1", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user1Data),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.user.email, user1Data.email.toLowerCase());
    assert.equal(data.user.password, undefined); // Password must not be returned
    assert.ok(data.user.id);
  });

  test("POST /auth/register - Reject duplicate email registration", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user1Data),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /already registered/i);
  });

  test("POST /auth/register - Reject invalid email format", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-string", password: "password123" }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  test("POST /auth/register - Reject password shorter than 6 characters", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "valid@test.com", password: "123" }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  // 2. Login
  test("POST /auth/login - Fail login with incorrect password", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user1Data.email, password: "wrong_password" }),
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  test("POST /auth/login - Successfully login User 1 and receive JWT", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user1Data),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, user1Data.email.toLowerCase());
    user1Token = data.token;
  });

  // Register & login User 2 for ownership testing
  test("POST /auth/register & login - Prepare User 2", async () => {
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user2Data),
    });
    assert.equal(regRes.status, 201);

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user2Data),
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    user2Token = loginData.token;
  });

  // 3. Current User Endpoint (GET /auth/me)
  test("GET /auth/me - Reject request without token (401)", async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  test("GET /auth/me - Reject request with invalid token (401)", async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: "Bearer bad_invalid_token_123" },
    });
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  test("GET /auth/me - Return profile with valid token", async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.email, user1Data.email.toLowerCase());
    assert.equal(data.user.password, undefined);
  });

  // 4. Protected Task Routes
  test("GET /tasks - Reject unauthenticated access (401)", async () => {
    const res = await fetch(`${baseUrl}/tasks`);
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
  });

  test("POST /tasks - Create task with User 1 token", async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify({
        title: "User 1 Secret Task",
        description: "Protected task belonging to User 1",
        priority: "high",
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.title, "User 1 Secret Task");
    assert.equal(data.data.priority, "high");
    user1TaskId = data.data._id;
  });

  test("POST /tasks - Reject task creation with empty title (400)", async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify({ title: "   " }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  test("GET /tasks - User 1 can see their created task", async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.data.some((t) => t._id === user1TaskId));
  });

  // 5. Ownership Isolation
  test("GET /tasks - User 2 CANNOT see User 1's task (Ownership isolation)", async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${user2Token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(!data.data.some((t) => t._id === user1TaskId));
  });

  test("GET /tasks/:id - User 2 CANNOT access User 1's task by ID (404)", async () => {
    const res = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      headers: { Authorization: `Bearer ${user2Token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 404);
    assert.equal(data.success, false);
  });

  test("PUT /tasks/:id - User 2 CANNOT modify User 1's task (404)", async () => {
    const res = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user2Token}`,
      },
      body: JSON.stringify({ title: "Hacked by User 2" }),
    });

    const data = await res.json();
    assert.equal(res.status, 404);
  });

  test("DELETE /tasks/:id - User 2 CANNOT delete User 1's task (404)", async () => {
    const res = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user2Token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 404);
  });

  // 6. User 1 updates and deletes their own task
  test("PUT /tasks/:id - User 1 can update their task", async () => {
    const res = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user1Token}`,
      },
      body: JSON.stringify({ completed: true }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.completed, true);
  });

  test("DELETE /tasks/:id - User 1 can delete their task", async () => {
    const res = await fetch(`${baseUrl}/tasks/${user1TaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    user1TaskId = null; // Cleared
  });
});
