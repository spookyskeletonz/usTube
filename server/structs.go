package main

import "github.com/gorilla/websocket"

type Message struct {
	UserName string `json:userName`
	RoomName string `json:roomName`
	Message  string `json:message`
}

type PlayPause struct {
	UserName  string `json:userName`
	RoomName  string `json:roomName`
	PlayPause bool   `json:playPause`
}

type Timeline struct {
	UserName string  `json:userName`
	RoomName string  `json:roomName`
	Timeline float32 `json:timeline`
}

type Room struct {
	RoomName           string
	Clients            map[*websocket.Conn]bool
	MessageBroadcast   chan Message
	PlayPauseBroadcast chan PlayPause
	TimelineBroadcast  chan Timeline
}

func newRoom(roomname string) Room {
	clientsMap := make(map[*websocket.Conn]bool)
	messageBroadcast := make(chan Message)
	playPauseBroadcast := make(chan PlayPause)
	timelineBroadcast := make(chan Timeline)

	return Room{
		RoomName:           roomname,
		Clients:            clientsMap,
		MessageBroadcast:   broadcastQueue,
		PlayPauseBroadcast: playPauseBroadcast,
		timelineBroadcast:  timelineBroadcast,
	}
}