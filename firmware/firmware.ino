#include <Arduino.h>
#include "wifi.h"

#define LED_PIN D4
#define SERIAL_BAUD 9600

const char* WIFI_SSID = "Gunnukanet";
const char* WIFI_PASSWORD = "Gunnu@123";

void blinkLED(uint delay) {
  digitalWrite(LED_PIN, HIGH);
  delay(delay);
  digitalWrite(LED_PIN, LOW);
  delay(delay);
}

void setup() {
  // Start serial connection (No Animesh, I have added these comments... This is not ChatGPTed)
  Serial.begin(SERIAL_BAUD); 

  pinMode(LED_PIN, OUTPUT);
  // Connect to wifi
  connectWifi(WIFI_SSID, WIFI_PASSWORD);
}

void loop() {
  blinkLED(1000);
  reconnectToWifiIfDisconnected(WIFI_SSID, WIFI_PASSWORD);
  
}
