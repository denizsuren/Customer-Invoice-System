package com.pia.telekom.dto;

/*
  token: oturum boyunca frontend'in sakladığı opak değer.
  role: sistemde tek rol olduğundan her zaman "ADMIN" döner; ileride
  rol tablosu eklenirse frontend tarafında kırılma olmaz.
*/
public record LoginResponse(
        String token,
        String email,
        String fullName,
        String role
) {
}
