package main

import (
	"encoding/json"
)

func broadcastMessages(room *Room) {
	for {
		// Grab next message from our message broadcast channel queue
		msg := <-room.MessageBroadcast
		// Now send it to every connected client
		for client := range room.Clients {
			// Here we are marshalling the struct as well as adding a field specifiying data type
			jsonMsg, err := json.Marshal(struct {
				DataType string
				Message
			}{
				DataType: "message",
				Message:  msg,
			})
			if err != nil {
				log.Printf("error creating json data type: %v", err)
				return
			}

			// Now send it
			err = client.WriteJSON(jsonMsg)
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
			// Here we are marshalling the struct as well as adding a field specifiying data type
			jsonPp, err := json.Marshal(struct {
				DataType string
				PlayPause
			}{
				DataType:  "playPause",
				PlayPause: pp,
			})
			if err != nil {
				log.Printf("error creating json data type: %v", err)
				return
			}

			err = client.WriteJSON(jsonPp)
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
			// Here we are marshalling the struct as well as adding a field specifiying data type
			jsonTl, err := json.Marshal(struct {
				DataType string
				Timeline
			}{
				DataType: "playPause",
				Timeline: tl,
			})
			if err != nil {
				log.Printf("error creating json data type: %v", err)
				return
			}

			err = client.WriteJSON(jsonTl)
			if err != nil {
				log.Printf("error writing to client: %v", err)
				client.Close()
				delete(room.Clients, client)
			}
		}
	}
}

func receiveMessage(dataUnmarshalled map[string]interface{}, room *Room) {

}

func receivePlayPause(dataUnmarshalled map[string]interface{}, room *Room) {

}

func receiveTimeline(dataUnmarshalled map[string]interface{}, room *Room) {

}
