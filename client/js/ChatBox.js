import React, { Component } from 'react';
import { Divider, Segment, Header } from 'semantic-ui-react';
import ChatMessages from './ChatMessages.js'; 
import ChatInput from './ChatInput.js';

class ChatBox extends Component{

  constructor(props){
    super(props);
  }

  onNewMessage(message) {
    this.refs.chatMessages.onNewMessage(message);
  }

  render() {
    return (
      <div id="ChatBox">
        <Header as='h3' attached='top'>{this.props.roomName}</Header>
        <Segment raised attached>
          <Segment raised>
            <ChatMessages myName={this.props.userName} ref="chatMessages" />
          </Segment>
          <ChatInput userName={this.props.userName} roomName={this.props.roomName} socket={this.props.socket} />
        </Segment>
      </div>
    );
  }

}

export default ChatBox;
