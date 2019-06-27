GOPATH=${GOPATH}:$(cd $(dirname $0); pwd)
echo '$' export GOPATH=${GOPATH}

echo "getting gorilla websocket"
go get github.com/gorilla/websocket
echo "building application"
go build -o ./server/webserver ./server/main.go ./server/structs.go ./server/websocketHandlers.go
