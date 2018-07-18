package main

import (
	"github.com/gorilla/websocket"
	"log"
)

func broadcastMessages(room *Room) {
	for {
		// Grab next message from our message broadcast channel queue
		msg := <-room.MessageBroadcast
		// Now send it to every connected client
		for client := range room.Clients {
			// Here we are sending the struct as well as adding a field specifiying data type
			err := client.WriteJSON(struct {
				DataType string
				Message
			}{
				DataType: "message",
				Message:  msg,
			})
			if err != nil {
				log.Printf("error writing to client: %v", err)
				client.Close()
				delete(room.Clients, client)
			}
		}
	}
}

func broadcastPlayPause(room *Room) {
	for {
		// Grab next playpause change from our play pause broadcast
		pp := <-room.PlayPauseBroadcast
		// Now send it to every connected client
		for client := range room.Clients {
			// Here we are sending the struct as well as adding a field specifiying data type
			err := client.WriteJSON(struct {
				DataType string
				PlayPause
			}{
				DataType:  "playPause",
				PlayPause: pp,
			})
			if err != nil {
				log.Printf("error writing to client: %v", err)
				client.Close()
				delete(room.Clients, client)
			}
		}
	}
}

func broadcastTimeline(room *Room) {
	for {
		// Grab next Timeline change from our play pause broadcast
		tl := <-room.TimelineBroadcast
		// Now send it to every connected client
		for client := range room.Clients {
			// Here we are sending the struct as well as adding a field specifiying data type
			err := client.WriteJSON(struct {
				DataType string
				Timeline
			}{
				DataType: "timeline",
				Timeline: tl,
			})
			if err != nil {
				log.Printf("error writing to client: %v", err)
				client.Close()
				delete(room.Clients, client)
			}
		}
	}
}

func broadcastUrl(room *Room) {
	for {
		// Grab next Url change from our play pause broadcast
		url := <-room.UrlBroadcast
		// Now send it to every connected client
		for client := range room.Clients {
			// Here we are sending the struct as well as adding a field specifiying data type
			err := client.WriteJSON(struct {
				DataType string
				Url
			}{
				DataType: "url",
				Url:      url,
			})
			if err != nil {
				log.Printf("error writing to client: %v", err)
				client.Close()
				delete(room.Clients, client)
			}
			log.Printf("broadcastUrl to client")
		}
	}
}

func receiveMessage(dataUnmarshalled map[string]interface{}, room *Room) {
	// Use unmarshalled json map to create new Message
	newMessage := Message{
		UserName: dataUnmarshalled["userName"].(string),
		RoomName: dataUnmarshalled["roomName"].(string),
		Message:  dataUnmarshalled["message"].(string),
	}
	// Send the newly received message to message broadcast
	room.MessageBroadcast <- newMessage
}

func receivePlayPause(dataUnmarshalled map[string]interface{}, room *Room) {
	// Use unmarshalled json map to create new PlayPause
	newPlayPause := PlayPause{
		UserName:  dataUnmarshalled["userName"].(string),
		RoomName:  dataUnmarshalled["roomName"].(string),
		PlayPause: dataUnmarshalled["playPause"].(bool),
	}
	// Send the newly received playpause to message broadcast
	room.PlayPauseBroadcast <- newPlayPause
}

func receiveTimeline(dataUnmarshalled map[string]interface{}, room *Room) {
	// Use unmarshalled json map to create new Timeline
	newTimeline := Timeline{
		UserName: dataUnmarshalled["userName"].(string),
		RoomName: dataUnmarshalled["roomName"].(string),
		Timeline: dataUnmarshalled["timeline"].(float64),
	}
	// Send the newly received timeline to message broadcast
	room.TimelineBroadcast <- newTimeline
}

func receiveSync(dataUnmarshalled map[string]interface{}, room *Room) {
	// use unmarshalled json map to create new Sync struct
	newTimeline := Timeline{
		UserName: dataUnmarshalled["userName"].(string),
		RoomName: dataUnmarshalled["roomName"].(string),
		Timeline: dataUnmarshalled["timeline"].(float64),
	}
	newPlayPause := PlayPause{
		UserName:  dataUnmarshalled["userName"].(string),
		RoomName:  dataUnmarshalled["roomName"].(string),
		PlayPause: dataUnmarshalled["playPause"].(bool),
	}
	newUrl := Url{
		UserName: dataUnmarshalled["userName"].(string),
		RoomName: dataUnmarshalled["roomName"].(string),
		Url:      dataUnmarshalled["url"].(string),
	}

	newSync := Sync{
		SyncPlayPause: newPlayPause,
		SyncTimeline:  newTimeline,
		SyncUrl:       newUrl,
	}

	room.SyncBroadcast <- newSync
}

func receiveUrl(dataUnmarshalled map[string]interface{}, room *Room) {
	log.Printf("received URL from client")
	// Use unmarshalled json map to create new Timeline
	newUrl := Url{
		UserName: dataUnmarshalled["userName"].(string),
		RoomName: dataUnmarshalled["roomName"].(string),
		Url:      dataUnmarshalled["url"].(string),
	}
	// Send the newly received url to message broadcast
	room.UrlBroadcast <- newUrl

}

func getSync(client *websocket.Conn, room *Room) {
	err := client.WriteJSON(struct {
		DataType string
	}{
		DataType: "requestSync",
	})

	if err != nil {
		log.Printf("error writing to client: %v", err)
		client.Close()
		delete(room.Clients, client)
	}
}

func syncNewClient(room *Room, client *websocket.Conn) {
	if len(room.Clients) == 0 {
		log.Printf("no clients in room yet")
		return
	}
	var prevClient *websocket.Conn
	for conn := range room.Clients {
		prevClient = conn
		break
	}

	// Get sync from already existing client
	getSync(prevClient, room)
	syncData := <-room.SyncBroadcast
	// Now send it to every connected client
	err := client.WriteJSON(struct {
		DataType string
		Sync
	}{
		DataType: "applySync",
		Sync:     syncData,
	})
	if err != nil {
		log.Printf("error writing to client : %v", err)
		client.Close()
		delete(room.Clients, client)
	}
	return
}
