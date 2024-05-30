#ifndef WIFI_H
#define WIFI_H

void connectWifi(const char* ssid, const char* password);
void reconnectToWifiIfDisconnected(const char* ssid, const char* password);

#endif
