import React, { Component } from 'react';
import { Grid, Button, Icon } from 'semantic-ui-react';
import ReactPlayer from 'react-player';

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      played: this.props.timeline,
      seeking: false,
      url: "https://www.youtube.com/watch?v=4BSJAAo1uNY",
      playing: this.props.playPause,
      volume: 0.8,
      muted: false,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false
    }

    this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
    this.onSeekMouseDown = this.onSeekMouseDown.bind(this);
    this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
    this.onSeekChange = this.onSeekChange.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onDuration = this.onDuration.bind(this);
  }

  componentWillUpdate(nextProps, nextState){
    console.log(nextProps);
    console.log(nextState);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.timeline !== this.state.played)
      this.setState({
        played: nextProps.timeline
      });
      this.refs.player.seekTo(nextProps.timeline);
    if(nextProps.playPause !== this.state.playing)
      this.setState({
        playing: nextProps.playPause
      });
  }

  onPlay(){
    this.setState({
      playing: true
    });
  }

  onPause(){
    this.setState({
      playing: false
    });
  }

  onProgress(state){
    if(!this.state.seeking){
      this.setState(state);
    }
    this.props.updateTimeline(state.played);
  }

  onDuration(newDuration){
    this.setState({
      duration: newDuration
    })
  }

  onSeekMouseDown(event){
    this.setState({
      seeking: true
    });
  }

  onSeekMouseUp(event){
    this.setState({
      seeking: false
    });
    this.refs.player.seekTo(parseFloat(event.target.value));
    this.props.handleTimelineChange(event);
  }

  onSeekChange(event){
    this.setState({
      played: parseFloat(event.target.value)
    });
  }
  
  handlePlayPauseClick(event){
    this.setState({
      playing: !this.state.playing
    })
    this.props.handlePlayPauseClick(event);
  }

  render() {
    let playPauseRender;
    if(this.props.playPause) {
      playPauseRender = (
        <Button icon onClick={this.handlePlayPauseClick}><Icon name="pause" /></Button>
      );
    } else {
      playPauseRender = (
        <Button icon onClick={this.handlePlayPauseClick}><Icon name="play" /></Button>
      );
    }

    return (
      <div className='VideoPlayer'>
        <Grid.Row centered>
          <ReactPlayer
              ref="player"
              className='react-player'
              width='100%'
              height='100%'
              url={this.state.url}
              playing={this.state.playing}
              loop={this.state.loop}
              playbackRate={this.state.playbackRate}
              muted={this.state.muted}
              onPlay={this.onPlay}
              onPause={this.onPause}
              onProgress={this.onProgress}
              onDuration={this.onDuration}
          />
        </Grid.Row>
        <Grid.Row centered>
          {playPauseRender}
          <input
            type='range' min={0} max={1} step='any'
            value={this.state.played}
            onMouseDown={this.onSeekMouseDown}
            onChange={this.onSeekChange}
            onMouseUp={this.onSeekMouseUp}
          />
        </Grid.Row>
      </div>
    );
  }
}

export default VideoPlayer;
