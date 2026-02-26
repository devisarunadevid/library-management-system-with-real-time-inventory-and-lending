package com.library.lms.librario.exception;

public class MailSendException extends RuntimeException {
    public MailSendException(String message, Throwable cause) {
        super(message, cause);
    }
}