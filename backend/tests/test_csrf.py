"""Explicit coverage of the CSRF middleware contract.

These tests pin down the failure modes and exemptions so the contract
is visible. The "happy path" is also exercised implicitly by every
authenticated write test in test_submissions.py.
"""

import pytest

from tests.conftest import TEST_ADMIN_EMAIL


async def _login(client) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": "testpass"},
    )
    assert resp.status_code == 200
    return resp.cookies["csrf_token"]


@pytest.mark.asyncio
async def test_write_without_csrf_header_is_forbidden(client):
    """After login the csrf cookie is present, but a POST without the
    matching X-CSRF-Token header is the classic CSRF attack shape — 403."""
    await _login(client)
    # /api/auth/logout is a non-exempt authenticated POST — a clean
    # CSRF test target that doesn't require setting up a resource first.
    response = await client.post("/api/auth/logout")
    assert response.status_code == 403
    assert "CSRF" in response.json()["detail"]


@pytest.mark.asyncio
async def test_write_with_mismatched_csrf_token_is_forbidden(client):
    await _login(client)
    response = await client.post(
        "/api/auth/logout",
        headers={"X-CSRF-Token": "not-the-real-token"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_write_with_matching_csrf_token_succeeds(client):
    csrf = await _login(client)
    response = await client.post(
        "/api/auth/logout",
        headers={"X-CSRF-Token": csrf},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_safe_methods_dont_require_csrf(client):
    """GET / HEAD / OPTIONS are always allowed regardless of csrf state."""
    await _login(client)
    response = await client.get("/api/admin/submissions")  # no header attached
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_login_is_exempt(client):
    """Login can't have a prior csrf token; it issues one."""
    response = await client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": "testpass"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_csrf_endpoint_returns_token_and_sets_cookie(client):
    response = await client.get("/api/auth/csrf")
    assert response.status_code == 200
    body = response.json()
    assert "token" in body
    assert len(body["token"]) >= 32
    assert response.cookies["csrf_token"] == body["token"]


@pytest.mark.asyncio
async def test_anonymous_write_is_forbidden(client):
    """No login, no cookie, no header — middleware 403s before the
    endpoint runs. /api/auth/logout doesn't itself require auth, but
    CSRF still gates it for the consistent contract."""
    response = await client.post("/api/auth/logout")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_public_submissions_path_is_exempt(client):
    """Unauthenticated POST to /api/submissions should NOT be blocked
    by CSRF — it's an explicit exemption (no session identity to abuse)."""
    response = await client.post(
        "/api/submissions",
        json={
            "name": "Anon",
            "email": "anon@example.com",
            "message": "Just trying the endpoint.",
        },
    )
    # 201 if CSRF lets it through. Would be 403 if not exempt.
    assert response.status_code == 201
