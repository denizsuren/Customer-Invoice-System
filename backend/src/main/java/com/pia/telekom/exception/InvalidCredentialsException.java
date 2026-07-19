package com.pia.telekom.exception;

/*
  E-posta bulunamadığında da yanlış şifrede de AYNI mesajla fırlatılır;
  böylece hangi e-postaların kayıtlı olduğu dışarıdan keşfedilemez.
*/
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("E-posta veya şifre hatalı");
    }
}
