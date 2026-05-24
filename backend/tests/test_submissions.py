import pytest

from tests.conftest import TEST_ADMIN_EMAIL


@pytest.mark.asyncio
async def test_public_can_submit_without_auth_or_csrf(client):
    """Unauthenticated POST to /api/submissions succeeds — exempt from
    CSRF (no session to abuse), no login required."""
    response = await client.post(
        "/api/submissions",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "message": "Great product, one suggestion...",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["reviewer_notes"] is None


@pytest.mark.asyncio
async def test_public_submit_is_rate_limited(client):
    """Public endpoint is 3/minute; 4th attempt 429s."""
    payload = {"name": "x", "email": "x@example.com", "message": "x"}
    for _ in range(3):
        await client.post("/api/submissions", json=payload)
    response = await client.post("/api/submissions", json=payload)
    assert response.status_code == 429


@pytest.mark.asyncio
async def test_admin_list_requires_auth(client):
    response = await client.get("/api/admin/submissions")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_can_list_and_review(client):
    # Public submission
    create = await client.post(
        "/api/submissions",
        json={"name": "Bob", "email": "bob@example.com", "message": "Help"},
    )
    submission_id = create.json()["id"]

    # Login as admin
    login = await client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": "testpass"},
    )
    csrf = login.cookies["csrf_token"]

    # List pending
    list_resp = await client.get("/api/admin/submissions?status=pending")
    assert list_resp.status_code == 200
    assert any(s["id"] == submission_id for s in list_resp.json())

    # Approve with reviewer notes
    review = await client.patch(
        f"/api/admin/submissions/{submission_id}",
        json={"status": "approved", "reviewer_notes": "Logged ticket"},
        headers={"X-CSRF-Token": csrf},
    )
    assert review.status_code == 200
    body = review.json()
    assert body["status"] == "approved"
    assert body["reviewer_notes"] == "Logged ticket"


@pytest.mark.asyncio
async def test_review_requires_csrf(client):
    """Status PATCH requires CSRF — it's an authenticated write."""
    create = await client.post(
        "/api/submissions",
        json={"name": "x", "email": "x@example.com", "message": "x"},
    )
    submission_id = create.json()["id"]

    await client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": "testpass"},
    )

    response = await client.patch(
        f"/api/admin/submissions/{submission_id}",
        json={"status": "approved"},
    )
    assert response.status_code == 403
