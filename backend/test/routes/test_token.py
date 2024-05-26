def test_token_valid(unauthenticated_client, user, user_password):
    response = unauthenticated_client.post(
        "/token", json={"username": user.email, "password": user_password}
    )
    assert response.status_code == 200, response.text
    assert "access_token" in response.json()


def test_token_invalid_password(unauthenticated_client, user):
    response = unauthenticated_client.post(
        "/token", json={"username": user.email, "password": "invalid"}
    )
    assert response.status_code == 401, response.text
