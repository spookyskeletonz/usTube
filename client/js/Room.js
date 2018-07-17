import React, { Component } from 'react';
import { Grid, Form } from 'semantic-ui-react';
import VideoPlayer from './VideoPlayer.js';
import ChatBox from './ChatBox.js';

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playPause: false,
      timeline: 0.0,
      input: ''
    }
    this.socket = new WebSocket('ws://' + window.location.host + '/ws?roomName='+this.props.roomName);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
    this.handleTimelineChange = this.handleTimelineChange.bind(this);
    this.updateTimeline = this.updateTimeline.bind(this);
  }

  updateTimeline(newTime) {
    this.state.timeline = newTime;
  }

  onSocketMessage(message) {
    let data = JSON.parse(message.data);
    if(data.DataType === "message"){
      this.refs.chatBox.onNewMessage(data);
    } else if(data.DataType === "playPause"){
      console.log("received playpause");
      this.state.playPause = data.PlayPause;
      this.forceUpdate();
    } else if(data.DataType === "timeline") {
      console.log("received timeline");
      this.state.timeline = data.Timeline;
      this.forceUpdate();
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

  handlePlayPauseClick(event){
    this.socket.send(JSON.stringify({
      dataType: 'playPause',
      userName: this.props.userName,
      roomName: this.props.roomName,
      playPause: !this.state.playPause
    }));
  }

  handleTimelineChange(event){
    this.socket.send(JSON.stringify({
      dataType: 'timeline',
      userName: this.props.userName,
      roomName: this.props.roomName,
      timeline: parseFloat(event.target.value)
    })) 
  }

  render() {
    return (
      <div className='Room'>
        <Grid textAlign='center' verticalAlign='middle' style={{ height: '100%' }}>
          <Grid.Row columns={1}>
            <Grid.Column>
              <header className='Title'><p>UsTube</p></header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column width={11}>
              <Grid>
                <VideoPlayer updateTimeline={this.updateTimeline} handleTimelineChange={this.handleTimelineChange} handlePlayPauseClick={this.handlePlayPauseClick} playPause={this.state.playPause} timeline={this.state.timeline} />
              </Grid>
            </Grid.Column>
            <Grid.Column width={4}>
              <ChatBox ref="chatBox" roomName={this.props.roomName} userName={this.props.userName} socket={this.socket} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default Room;
