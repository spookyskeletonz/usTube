import  React, { Component } from 'react';
import { Comment, Container } from 'semantic-ui-react';

class ChatMessages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: []
    }
  }

  componentDidUpdate() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  onNewMessage(messageData) {
    this.state.messages.push(messageData);
    console.log(messageData);
    this.forceUpdate();
  }

  render() {
    return (
      <div className="ChatMessages" id="messages">
        <Container>
            {
              this.state.messages.map((m, i) => { 
                if(m.UserName === this.props.myName) {
                  return (
                    <div key={i} style={{textAlign: 'left'}}>
                      <Comment>
                        <Comment.Content>
                          <Comment.Author><b>{m.UserName}</b></Comment.Author>
                          <Comment.Text>{m.Message}</Comment.Text>
                        </Comment.Content>
                      </Comment>
                    </div>
                  );
                } else {
                  return (
                    <div key={i} style={{textAlign: 'right'}}>
                      <Comment>
                        <Comment.Content>
                          <Comment.Author><b>{m.UserName}</b></Comment.Author>
                          <Comment.Text>{m.Message}</Comment.Text>
                        </Comment.Content>
                      </Comment>
                    </div>
                  );
                }
              }
              )
            } 
        </Container>
      </div>
    );
  }
}

export default ChatMessages;
