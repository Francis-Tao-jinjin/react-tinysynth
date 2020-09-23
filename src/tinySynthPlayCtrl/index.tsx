import React from 'react';
import { TinySynth, TinySynthEvent } from '../tinySynth';
import './style.css';

interface Props {
    tinySynth:TinySynth;
}

interface State {
    isPlaying:boolean;
    playTick:number;
    maxTick:number;
}

export class TinySynthPlayControl extends React.Component<Props,State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isPlaying: props.tinySynth.playing,
            playTick: 0,
            maxTick: 0,
        };
    }

    public updatePlayingInfo = (ev:any) => {
        if (this.state.playTick !== ev.playTick) {
            this.setState({
                playTick: ev.playTick,
            });
        }
        if (this.state.maxTick !== ev.maxTick) {
            this.setState({
                maxTick: ev.maxTick,
            });
        }
    }

    public componentDidMount() {
        this.props.tinySynth.addListener(TinySynthEvent.playingProgress, this.updatePlayingInfo);
    }

    public componentWillUnmount() {
        this.props.tinySynth.removeListener(TinySynthEvent.playingProgress, this.updatePlayingInfo);
    }

    public render() {
        return (
            <div className='tinySynthPlayControl'>
                <div className='row'>
                    <div className='col col-5-1'>
                        <div className='playBtn'>
                            <button
                                onClick={() => {
                                    this.props.tinySynth.playMIDI();
                                    this.setState({
                                        isPlaying: this.props.tinySynth.playing,
                                    });
                                }}>
                            {
                                this.state.isPlaying ? 'Stop' : 'Play'
                            }
                            </button>
                        </div>
                    </div>
                    <div className='col col-5-1'>
                        <div className='label up'>{this.props.tinySynth.formatTime(this.state.playTick)}</div>
                        <div className='label bottom'>{this.props.tinySynth.formatTime(this.state.maxTick)}</div>
                    </div>
                    <div className='col'>
                        <div className='row'>
                            <canvas className='noteViz'></canvas>
                        </div>
                        <div className='row'>
                            <input className='playbackSlider' type='range'
                                min={0}
                                max={this.state.maxTick}
                                onChange={(ev) => {
                                    this.props.tinySynth.locateMIDI(parseInt(ev.target.value));
                                }}
                                value={this.state.playTick}
                                ></input>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}