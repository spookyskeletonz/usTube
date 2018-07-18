package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

/* global map for rooms. for scalability use db instad */
var rooms = make(map[string]*Room)

/* upgrader to upgrade HTTP to websocket */
var upgrader = websocket.Upgrader{}

func main() {
	// create a simple file server to serve static files
	// note the realtive path is from root folder of source code, not server
	// this is because of aws eb stuff
	fs := http.FileServer(http.Dir("./client"))
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections)

	log.Println("http server starting on :5000")
	err := http.ListenAndServe(":5000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// take roomName from query param
	requestRoom := r.URL.Query().Get("roomName")
	if requestRoom == "" {
		log.Println("No room specified")
		return
	}

	log.Println("connection opening!")
	// upgrade GET request to websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("upgrade request: ", err)
	}

	// Make sure we close the connection when the function returns.
	// defers close to whenever the function is returned
	defer ws.Close()

	// either get room struct from map or create a new one
	room := rooms[requestRoom]
	if room == nil {
		// need to create a new room for this roomname
		newroom := newRoom(requestRoom)
		room = &newroom
		rooms[requestRoom] = room
		// start new goroutine for handling broadcast to clients
		go broadcastMessages(room)
		go broadcastPlayPause(room)
		go broadcastTimeline(room)
		go broadcastUrl(room)
	}

	// first sync up new client with other clients before adding to room
	syncNewClient(room, ws)

	// add client to room
	room.Clients[ws] = true

	for {
		// Read in a new data as JSON and determine what type it is
		_, data, err := ws.ReadMessage()
		if err != nil {
			log.Printf("error reading message: %v", err)
			delete(room.Clients, ws)
			break
		}

		var dataUnmarshalled map[string]interface{}
		json.Unmarshal(data, &dataUnmarshalled)
		dataType := dataUnmarshalled["dataType"].(string)

		// handle based on which type of data is being sent
		switch dataType {
		case "message":
			receiveMessage(dataUnmarshalled, room)
		case "playPause":
			receivePlayPause(dataUnmarshalled, room)
		case "timeline":
			receiveTimeline(dataUnmarshalled, room)
		case "url":
			receiveUrl(dataUnmarshalled, room)
		case "sync":
			receiveSync(dataUnmarshalled, room)
		}

	}
}
