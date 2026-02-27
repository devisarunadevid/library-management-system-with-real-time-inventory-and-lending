package com.library.lms.librario.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "config")
public class Config {

    @Id
    @Column(name = "config_key")   // ✅ change column name
    private String key;

    @Column(name = "config_value") // optional but recommended
    private String value;

    public Config() {}

    public Config(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}