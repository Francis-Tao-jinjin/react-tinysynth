import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { TinySynth } from './tinySynth';
import { WebaudioKeyboard } from './webaudioKeyboard';

function App() {

  const synth = useRef<TinySynth>();
  (window as any).tinySynth = synth.current;
  const midiPort = useRef<any>([]);
  const [currentPort, setMidiPort] = useState(-1);
  const [currentMidiChannel, setMidiChannel] = useState(0);
  const [midiInput, updateMidiInput] = useState<string[]>([]);

  useEffect(() => {
    synth.current = new TinySynth();
    Init();
    document.addEventListener('change', (ev) => {
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

  function MidiIn(e:any) {
    console.log('e', e);
    if (synth.current) {
      synth.current.send(e.data, 0);
    }
  }

  function SelectMidi(n:number) {
    console.log(midiPort.current);
    // midiPort.current
    if (currentPort >= 0) {
      midiPort.current[currentPort].onmidimessage = null;
    }
    setMidiPort(n);
    console.log('currentPort,', currentPort);
    if (currentPort >= 0) {
      midiPort.current[currentPort].onmidimessage = MidiIn;
    }
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
    }
  }

  return (
    <div className="App">
      <div className='synthApp'>
        <div className='portSelector'>
          MIDI Keyboard:
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
        <div className='webaudioKeyboard'>
          <WebaudioKeyboard
            keys={73}
            min={35}
            width={800}
          ></WebaudioKeyboard>
        </div>
        <div>
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
      </div>
    </div>
  );
}

export default App;
