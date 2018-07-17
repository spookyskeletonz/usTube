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

  componentWillReceiveProps(nextProps){
    if(nextProps.timeline !== this.state.played){
      this.refs.player.seekTo(nextProps.timeline);
    }
    this.setState({
      playing: nextProps.playPause,
      played: nextProps.timeline
    });
  }

  onPlay(){
    if(!this.state.playing){
      this.setState({
        playing: true
      });
      this.props.handlePlayPauseClick();
    } else {
      this.setState({
        playing: true
      });
    }
  }

  onPause(){
    if(this.state.playing){
      this.setState({
        playing: false 
      });
      this.props.handlePlayPauseClick();
    } else {
      this.setState({
        playing: false 
      });
    }   
  }

  onProgress(state){
    if(!this.state.seeking){
      // Ignore initial render state to avoid rerender to played: 0
      if(state.played !== 0)
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
    this.props.handlePlayPauseClick();
  }

  render() {
    let playPauseRender;
    if(this.state.playing) {
      playPauseRender = (
        <Button size="huge" icon onClick={this.handlePlayPauseClick}><Icon name="pause" /></Button>
      );
    } else {
      playPauseRender = (
        <Button size="huge" icon onClick={this.handlePlayPauseClick}><Icon name="play" /></Button>
      );
    }

    let durationFormatted;
    let durationMinutes = Math.floor(this.state.duration / 60);
    let durationSeconds = this.state.duration % 60;
    if(durationSeconds > 9){
      durationFormatted = durationMinutes.toString() + ":" + durationSeconds.toString();
    } else {
      durationFormatted = durationMinutes.toString() + ":0" + durationSeconds.toString();
    }

    let playedFormatted;
    let playedMinutes = Math.floor((this.state.played * this.state.duration) / 60);
    let playedSeconds = Math.floor((this.state.played * this.state.duration) % 60);
    if(playedSeconds > 9){
      playedFormatted = playedMinutes.toString() + ":" + playedSeconds.toString();
    } else {
      playedFormatted = playedMinutes.toString() + ":0" + playedSeconds.toString();
    }

    return (
      <div className='VideoPlayer'>
          <div className='Video'>
            <ReactPlayer
              ref="player"
              className='react-player'
              width='900px'
              url={this.state.url}
              playing={this.state.playing}
              loop={this.state.loop}
              playbackRate={this.state.playbackRate}
              muted={this.state.muted}
              onPlay={this.onPlay}
              onPause={this.onPause}
              onProgress={this.onProgress}
              onDuration={this.onDuration}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    origin: window.location.host,
                    rel: 0,
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    color: 'white'
                  }
                }
              }}
            />
          </div>
          <Grid.Row centered>
            <Grid.Column>
              {playPauseRender}
              {playedFormatted}
              <input
                name="timeline"
                style={{width: "500px"}}
                type='range' min={0} max={1} step='any'
                value={this.state.played}
                onMouseDown={this.onSeekMouseDown}
                onChange={this.onSeekChange}
                onMouseUp={this.onSeekMouseUp}
              />
              {durationFormatted}
            </Grid.Column>
          </Grid.Row>
      </div>
    );
  }
}

export default VideoPlayer;
