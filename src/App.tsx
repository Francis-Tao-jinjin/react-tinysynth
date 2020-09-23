import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Knob } from './knob';
import { TinySynth } from './tinySynth';
import { TinySynthPlayControl } from './tinySynthPlayCtrl';
import { WebaudioKeyboard } from './webaudioKeyboard';

function App() {
  const synth = useRef<TinySynth>();
  (window as any).tinySynth = synth.current;
  const kbRef = useRef<null|WebaudioKeyboard>(null);
  const midiPort = useRef<any>([]);
  const [synthReady, updateSynthState] = useState(false);
  const [currentPort, setMidiPort] = useState(-1);
  const [currentMidiChannel, setMidiChannel] = useState(0);
  const [midiInput, updateMidiInput] = useState<string[]>([]);
  const [curentInstrument, changeInstrument] = useState(0);
  const [instrumentList, setInstrumentList] = useState<{name:string}[]>([]);

  useEffect(() => {
    synth.current = new TinySynth();
    updateSynthState(synth.current.isReady);
    setInstrumentList(synth.current.programNameList);
    Init();
    document.addEventListener('webaudio-keyboard-change', (ev) => {
      KeyIn(ev);
    });
  }, []);

  function Init() {
    InitMidi();
    ProgChange(0);
  }

  function InitMidi() {
    if (typeof (navigator as any).requestMIDIAccess !== 'undefined') {
      (navigator as any).requestMIDIAccess().then((access:any) => {
        console.log('MIDI is ready');
        setTimeout(() => {
          midiPort.current = [];
          const nameList:string[] = [];
          const it = access.inputs.values();
          for (let i = it.next(); !i.done; i = it.next()) {
            midiPort.current.push(i.value);
            nameList.push(i.value.name);
            console.log(i);
          }
          updateMidiInput(nameList);
          console.log(nameList);
        }, 10);
      },
      function(){
        console.log("MIDI is not available.");
      });
    }
  }

  function loadMidi(e:React.ChangeEvent<HTMLInputElement>) {
    const fileInput = e.target as HTMLInputElement;
    if (!fileInput.files) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(reader.result);
      const midiData = (reader.result as ArrayBuffer);
      if (midiData && synth.current) {
        synth.current.loadMIDI(midiData);
      }
    }
    reader.readAsArrayBuffer(fileInput.files[0]);
  }

  function MidiIn(e:any) {
    if (synth.current) {
      synth.current.send(e.data, 0);
      if (kbRef.current) {
        switch(e.data[0]&0xf0) {
          case 0x90:
            kbRef.current.setNote(e.data[2] ? 1 : 0, e.data[1]);
            break;
          case 0x80:
            kbRef.current.setNote(0,e.data[1]);
            break;
        }
      }
    }
  }

  function SelectMidi(n:number) {
    // midiPort.current
    if (currentPort >= 0) {
      midiPort.current[currentPort].onmidimessage = null;
    }
    setMidiPort(n);
    console.log('currentPort,', currentPort);
    if (n >= 0) {
      midiPort.current[n].onmidimessage = MidiIn;
    }
    console.log(midiPort.current);
  }

  function KeyIn(ev:any) {
    const curNote = ev.note[1];
    console.log('curNote', curNote);
    if (ev.note[0]) {
      synth.current?.send([0x90 + currentMidiChannel , curNote, 100]);
    } else {
      synth.current?.send([0x80 + currentMidiChannel , curNote, 0]);
    }
  }

  function ChChange(ch:number) {
    setMidiChannel(ch);
  }

  function ProgChange(p:number) {
    if (synth.current) {
      synth.current.send([0xc0, p]);
      changeInstrument(p);
    }
  }

  return (
    <div className="App">
      <div className='synthApp'>
        <div className='row'> 
          <div className='col synthCtrl'>
            {
              (synthReady && synth.current) ?
              <TinySynthPlayControl
                tinySynth={synth.current as TinySynth}
              >
              </TinySynthPlayControl> : null
            }
          </div>
          <div className='col knobWrapper'>
            <Knob
              size={40}
              numTicks={25}
              degrees={260}
              min={0}
              max={1}
              value={0.5}
              color={true}
              precision={2}
              label={'Volume'}
              onChange={(value) => {
                console.log('knob:', value);
                synth.current?.setMasterVol(value);
              }}
              >
            </Knob>
          </div>
          <div className='col knobWrapper'>
            <Knob
              size={40}
              numTicks={25}
              degrees={260}
              min={0}
              max={1}
              value={0.3}
              color={true}
              precision={2}
              label={'Reverb'}
              onChange={(value) => {
                console.log('knob:', value);
                synth.current?.setReverbLev(value);
              }}
              >
            </Knob>
          </div>
        </div>
        <div className='row'>
          <input type='file'
            accept='.midi,.mid'
            onChange={loadMidi}></input>
        </div>
        <div className='row'>
          <div className='portSelector'>
            MIDI Keyboard : 
            <select
              value={currentPort}
              onChange={(ev) => SelectMidi(parseInt(ev.target.value))}>
              <option value={-1}>--</option>
              {
                midiInput.map((value:any, idx) => {
                  return <option
                      key={idx}
                      value={idx}
                    >{value}</option>
                })
              }
            </select>
          </div>
        </div>
        <div className='webaudioKeyboard'>
          <WebaudioKeyboard
            ref={kbRef}
            keys={73}
            min={35}
            width={800}
          ></WebaudioKeyboard>
        </div>
        <div className='row'>
          <div className='channelSelector'>
            Ch : 
            <select
              value={currentMidiChannel}
              onChange={(e) => ChChange(parseInt(e.target.value))}>
              <option value={0}>Ch1</option>
              <option value={1}>Ch2</option>
              <option value={2}>Ch3</option>
              <option value={3}>Ch4</option>
              <option value={4}>Ch5</option>
              <option value={5}>Ch6</option>
              <option value={6}>Ch7</option>
              <option value={7}>Ch8</option>
              <option value={8}>Ch9</option>
              <option value={9}>Drum (Ch10)</option>
            </select>
          </div>
          <div className='programSelector'>
            Prog : 
            <select
              value={curentInstrument}
              onChange={(e) => ProgChange(parseInt(e.target.value))}
              >
            {
              instrumentList.map((value, idx) => {
                return <option
                  key={idx}
                  value={idx}
                >
                  {value.name}
                </option>
              })
            }
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
