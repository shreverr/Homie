#include <Arduino.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>
#include <Hash.h>

#include "wifi.h"

SocketIOclient socketIO;

#define SERIAL_BAUD 115200
#define USER_SERIAL Serial
#define LED_PIN D4
#define RELAY_PIN 5
#define RANDOM_PIN 4
#define SWITCH_PIN 15

const char* WIFI_SSID = "lIllIllI";
const char* WIFI_PASSWORD = "12345677";
// const char* SERVER_IP = "homie-server.onrender.com";
// const int PORT = 443;
const char* SERVER_IP = "homie-server.onrender.com";
const int PORT = 443;

bool relayState = false;
bool switchState = false;
void switchOverRide(){
  if(digitalRead(SWITCH_PIN) != switchState){
    changeRelayState(!relayState);
    switchState = digitalRead(SWITCH_PIN);
  }
}

void socketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case sIOtype_DISCONNECT:
      USER_SERIAL.printf("[IOc] Disconnected!\n");
      digitalWrite(D4, HIGH);
      delay(50);
      digitalWrite(D4, LOW);
      delay(50);
      break;
    case sIOtype_CONNECT:
      USER_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

      // join default namespace (no auto join in Socket.IO V3)
      socketIO.send(sIOtype_CONNECT, "/");
      break;
    case sIOtype_EVENT: {
      USER_SERIAL.printf("[IOc] get event: %s\n", payload);

      // Parse the JSON payload
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        const char* eventName = doc[0];
        const char* stateStr = doc[1];

        if (strcmp(eventName, "SwitchStateChange") == 0) {
          bool state = strToBool(stateStr);
          changeRelayState(state);
        }
      } else {
        USER_SERIAL.printf("JSON parse error: %s\n", error.c_str());
      }
      break;
    }
    case sIOtype_ACK:
      USER_SERIAL.printf("[IOc] get ack: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_ERROR:
      USER_SERIAL.printf("[IOc] get error: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_BINARY_EVENT:
      USER_SERIAL.printf("[IOc] get binary: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_BINARY_ACK:
      USER_SERIAL.printf("[IOc] get binary ack: %u\n", length);
      hexdump(payload, length);
      break;
  }
}

bool strToBool(const String& str) {
  String lowerStr = str;
  lowerStr.toLowerCase();

  if (lowerStr == "true" || lowerStr == "1") {
    return true;
  } else if (lowerStr == "false" || lowerStr == "0") {
    return false;
  } else {
    // You can choose to handle the invalid input differently, such as returning a default value
    // For this example, we will return false for invalid inputs
    return false;
  }
}

void blinkLED(uint timeDelay) {
  digitalWrite(LED_PIN, HIGH);
  delay(timeDelay);
  digitalWrite(LED_PIN, LOW);
  delay(timeDelay);
}

void changeRelayState(bool state) {
  if (state) {
    USER_SERIAL.printf("changing to true\n");
    relayState = true;
    digitalWrite(RELAY_PIN, HIGH);
  } else {
    USER_SERIAL.printf("changing to false\n");
    relayState = false;
    digitalWrite(RELAY_PIN, LOW);
  }
}

void setup() {
  // Start serial connection (No Animesh, I have added these comments... This is not ChatGPTed)
  USER_SERIAL.begin(SERIAL_BAUD);

  pinMode(LED_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(RANDOM_PIN, OUTPUT);  // sets the digital pin 13 as output
  pinMode(SWITCH_PIN, INPUT);
  //reading state of the switch
  switchState = digitalRead(SWITCH_PIN);
  // Connect to wifi
  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  //socket conn
  socketIO.beginSSL(SERVER_IP, 443, "/socket.io/?EIO=4");
  // socketIO.begin(SERVER_IP, PORT, "/socket.io/?EIO=4");

  // event handler
  socketIO.onEvent(socketIOEvent);
}
int val = 0;
void loop() {
  // blinkLED(1000);
  val = digitalRead(SWITCH_PIN);  
  // USER_SERIAL.printf("val\n %d", val);
  digitalWrite(RANDOM_PIN, val);
  reconnectToWifiIfDisconnected(WIFI_SSID, WIFI_PASSWORD);
  switchOverRide();
  reconnectToWifiIfDisconnected("POCO M6 Pro 5G", "connect6");
  switchOverRide();
  reconnectToWifiIfDisconnected("pookie", "");
  switchOverRide();
  socketIO.loop();
}
