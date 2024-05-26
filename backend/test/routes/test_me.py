def test_me(client, user):
    response = client.get("/me")
    assert response.status_code == 200, response.text
    assert response.json()["email"] == user.email


def test_me_unauthed(unauthenticated_client):
    response = unauthenticated_client.get("/me")
    assert response.status_code == 401
