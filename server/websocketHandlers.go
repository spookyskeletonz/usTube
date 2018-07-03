package main

import (
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
	// Send the newly received message to message broadcast
	room.PlayPauseBroadcast <- newPlayPause
}

func receiveTimeline(dataUnmarshalled map[string]interface{}, room *Room) {
	// Use unmarshalled json map to create new Timeline
	newTimeline := Timeline{
		UserName: dataUnmarshalled["userName"].(string),
		RoomName: dataUnmarshalled["roomName"].(string),
		Timeline: dataUnmarshalled["timeline"].(float32),
	}
	// Send the newly received message to message broadcast
	room.TimelineBroadcast <- newTimeline
}
