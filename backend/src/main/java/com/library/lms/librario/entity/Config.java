package com.library.lms.librario.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "config")
public class Config {
    @Id
    private String key;   // e.g., "finePerDay"

    private String value; // e.g., "10"

    // ✅ Default constructor
    public Config() {}

    // ✅ Constructor
    public Config(String key, String value) {
        this.key = key;
        this.value = value;
    }

    // ✅ Getters and setters
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
