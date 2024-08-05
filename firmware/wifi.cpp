#include <ESP8266WiFi.h>
#include "wifi.h"



void connectWifi(const char* ssid,const char* password) {

  // Start WiFi connection
  Serial.println();
  Serial.println("Connecting to Wi-Fi...");

  WiFi.begin(ssid, password);

  int tries =0;
  // Wait for the connection to establish
  while (WiFi.status() != WL_CONNECTED)
  {
    if(tries>10)return;
    tries++;
    digitalWrite(D4, HIGH);
    delay(250);
    digitalWrite(D4, LOW);
    delay(250);
    Serial.print(".");
  }

  // Print the IP address once connected
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectToWifiIfDisconnected(const char* ssid,const char* password) {
    if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    connectWifi(ssid, password);
  }
}