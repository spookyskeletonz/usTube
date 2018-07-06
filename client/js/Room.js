import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playPause: false,
      timeline: 0.0,
      messages: [],
      input: ''
    }
    this.socket = new WebSocket('ws://' + window.location.host + '/ws?roomName='+this.props.roomName);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
  }

  onSocketMessage(message) {
    let data = JSON.parse(message.data);
    if(data.DataType === "message"){
      console.log("received message");
      this.state.messages.push(data);
    } else if(data.DataType === "playPause"){
      console.log("received playpause");
      this.state.playPause = data.PlayPause;
    } else if(data.DataType === "timeline") {
      console.log("received timeline");
      this.state.timeline = data.Timeline;
    } else if(data.DataType === "requestSync"){
      console.log("received sync request");
      this.socket.send(JSON.stringify({
        dataType: 'sync',
        userName: this.props.userName,
        roomName: this.props.roomName,
        timeline: this.state.timeline,
        playPause: this.state.playPause
      }));
    } else if (data.DataType === "applySync"){
      console.log("received apply sync");
      this.state.timeline = data.SyncTimeline.Timeline;
      this.state.playPause = data.SyncPlayPause.PlayPause;
      this.forceUpdate();
    } else {
      console.log(data["DataType"]);
      return;
    }
    this.forceUpdate();
  }

  componentDidMount() {
    this.socket.onmessage = (m) => this.onSocketMessage(m);
  }

  handleInputChange(event) {
    this.setState(
    {
      [event.target.name]: event.target.value
    });
  }

  handleMessageSubmit(event){
    this.socket.send(JSON.stringify({
      dataType: 'message',
      userName: this.props.userName,
      roomName: this.props.roomName,
      message: this.state.input
    }));
    this.setState(
    {
      input: ''
    });
  }

  handlePlayPauseClick(event){
    this.socket.send(JSON.stringify({
      dataType: 'playPause',
      userName: this.props.userName,
      roomName: this.props.roomName,
      playPause: !this.state.playPause
    }));
  }

  render() {
    console.log(this.state.playPause);
    return (
      <div className='Room'>
        <Form onSubmit={this.handleMessageSubmit}>
          <Form.Group>
            <Form.Field width={12}>
              <input required placeholder='Write a message' name='input' value={this.state.input} onChange={this.handleInputChange}/>
            </Form.Field>
            <Form.Button width={4} color='green' type='submit'>Send</Form.Button>
          </Form.Group>
        </Form>
        <Button onClick={this.handlePlayPauseClick}>{this.state.playPause ? 'pause' : 'play'}</Button>
      </div>
    );
  }
}

export default Room;
