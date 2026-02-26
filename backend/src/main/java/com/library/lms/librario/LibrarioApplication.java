package com.library.lms.librario;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class LibrarioApplication {

	public static void main(String[] args) {
		SpringApplication.run(LibrarioApplication.class, args);
	}

}
