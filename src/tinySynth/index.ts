type Note = {
    t:number,
    e:number,
    ch:number,
    n:number,
    o:(OscillatorNode|AudioBufferSourceNode)[],
    g:GainNode[],
    t2:number,
    v:number[],
    r:number[],
    f:number,
};

type ProgramSpec = {
    g:number,
    w:string,
    t:number,
    f:number,
    v:number,
    a:number,
    h:number,
    d:number,
    s:number,
    r:number,
    p:number,
    q:number,
    k:number,
};

type MIDIProgram = {
    name: string;
    p: ProgramSpec;
};

export class TinySynth {
    public masterVol:number = 0.5;
    public reverbLev:number = 0.3;
    public quality:number = 1;
    public debug:number = 0;
    public src:string|null = null;
    public loop:boolean = false;
    public internalcontext:boolean = true;
    public tsmode:boolean = false;
    public voices:number = 64;
    public useReverd:number = 1;

    public program:MIDIProgram[] = [];
    public drummap:MIDIProgram[] = [];

    public programNameList = [
        // 1-8 : Piano
        {name:"Acoustic Grand Piano"},    {name:"Bright Acoustic Piano"},
        {name:"Electric Grand Piano"},    {name:"Honky-tonk Piano"},
        {name:"Electric Piano 1"},        {name:"Electric Piano 2"},
        {name:"Harpsichord"},             {name:"Clavi"},
        /* 9-16 : Chromatic Perc*/
        {name:"Celesta"},                 {name:"Glockenspiel"},
        {name:"Music Box"},               {name:"Vibraphone"},
        {name:"Marimba"},                 {name:"Xylophone"},
        {name:"Tubular Bells"},           {name:"Dulcimer"},
        /* 17-24 : Organ */
        {name:"Drawbar Organ"},           {name:"Percussive Organ"},
        {name:"Rock Organ"},              {name:"Church Organ"},
        {name:"Reed Organ"},              {name:"Accordion"},
        {name:"Harmonica"},               {name:"Tango Accordion"},
        /* 25-32 : Guitar */
        {name:"Acoustic Guitar (nylon)"}, {name:"Acoustic Guitar (steel)"},
        {name:"Electric Guitar (jazz)"},  {name:"Electric Guitar (clean)"},
        {name:"Electric Guitar (muted)"}, {name:"Overdriven Guitar"},
        {name:"Distortion Guitar"},       {name:"Guitar harmonics"},
        /* 33-40 : Bass */
        {name:"Acoustic Bass"},           {name:"Electric Bass (finger)"},
        {name:"Electric Bass (pick)"},    {name:"Fretless Bass"},
        {name:"Slap Bass 1"},             {name:"Slap Bass 2"},
        {name:"Synth Bass 1"},            {name:"Synth Bass 2"},
        /* 41-48 : Strings */
        {name:"Violin"},                  {name:"Viola"},
        {name:"Cello"},                   {name:"Contrabass"},
        {name:"Tremolo Strings"},         {name:"Pizzicato Strings"},
        {name:"Orchestral Harp"},         {name:"Timpani"},
        /* 49-56 : Ensamble */
        {name:"String Ensemble 1"},       {name:"String Ensemble 2"},
        {name:"SynthStrings 1"},          {name:"SynthStrings 2"},
        {name:"Choir Aahs"},              {name:"Voice Oohs"},
        {name:"Synth Voice"},             {name:"Orchestra Hit"},
        /* 57-64 : Brass */
        {name:"Trumpet"},                 {name:"Trombone"},
        {name:"Tuba"},                    {name:"Muted Trumpet"},
        {name:"French Horn"},             {name:"Brass Section"},
        {name:"SynthBrass 1"},            {name:"SynthBrass 2"},
        /* 65-72 : Reed */
        {name:"Soprano Sax"},             {name:"Alto Sax"},
        {name:"Tenor Sax"},               {name:"Baritone Sax"},
        {name:"Oboe"},                    {name:"English Horn"},
        {name:"Bassoon"},                 {name:"Clarinet"},
        /* 73-80 : Pipe */
        {name:"Piccolo"},                 {name:"Flute"},
        {name:"Recorder"},                {name:"Pan Flute"},
        {name:"Blown Bottle"},            {name:"Shakuhachi"},
        {name:"Whistle"},                 {name:"Ocarina"},
        /* 81-88 : SynthLead */
        {name:"Lead 1 (square)"},         {name:"Lead 2 (sawtooth)"},
        {name:"Lead 3 (calliope)"},       {name:"Lead 4 (chiff)"},
        {name:"Lead 5 (charang)"},        {name:"Lead 6 (voice)"},
        {name:"Lead 7 (fifths)"},         {name:"Lead 8 (bass + lead)"},
        /* 89-96 : SynthPad */
        {name:"Pad 1 (new age)"},         {name:"Pad 2 (warm)"},
        {name:"Pad 3 (polysynth)"},       {name:"Pad 4 (choir)"},
        {name:"Pad 5 (bowed)"},           {name:"Pad 6 (metallic)"},
        {name:"Pad 7 (halo)"},            {name:"Pad 8 (sweep)"},
        /* 97-104 : FX */
        {name:"FX 1 (rain)"},             {name:"FX 2 (soundtrack)"},
        {name:"FX 3 (crystal)"},          {name:"FX 4 (atmosphere)"},
        {name:"FX 5 (brightness)"},       {name:"FX 6 (goblins)"},
        {name:"FX 7 (echoes)"},           {name:"FX 8 (sci-fi)"},
        /* 105-112 : Ethnic */
        {name:"Sitar"},                   {name:"Banjo"},
        {name:"Shamisen"},                {name:"Koto"},
        {name:"Kalimba"},                 {name:"Bag pipe"},
        {name:"Fiddle"},                  {name:"Shanai"},
        /* 113-120 : Percussive */
        {name:"Tinkle Bell"},             {name:"Agogo"},
        {name:"Steel Drums"},             {name:"Woodblock"},
        {name:"Taiko Drum"},              {name:"Melodic Tom"},
        {name:"Synth Drum"},              {name:"Reverse Cymbal"},
        /* 121-128 : SE */
        {name:"Guitar Fret Noise"},       {name:"Breath Noise"},
        {name:"Seashore"},                {name:"Bird Tweet"},
        {name:"Telephone Ring"},          {name:"Helicopter"},
        {name:"Applause"},                {name:"Gunshot"},
    ];

    public drummapNamelist = [
        // 35
        {name:"Acoustic Bass Drum"},  {name:"Bass Drum 1"},      {name:"Side Stick"},     {name:"Acoustic Snare"},
        {name:"Hand Clap"},           {name:"Electric Snare"},   {name:"Low Floor Tom"},  {name:"Closed Hi Hat"},
        {name:"High Floor Tom"},      {name:"Pedal Hi-Hat"},     {name:"Low Tom"},        {name:"Open Hi-Hat"},
        {name:"Low-Mid Tom"},         {name:"Hi-Mid Tom"},       {name:"Crash Cymbal 1"}, {name:"High Tom"},
        {name:"Ride Cymbal 1"},       {name:"Chinese Cymbal"},   {name:"Ride Bell"},      {name:"Tambourine"},
        {name:"Splash Cymbal"},       {name:"Cowbell"},          {name:"Crash Cymbal 2"}, {name:"Vibraslap"},
        {name:"Ride Cymbal 2"},       {name:"Hi Bongo"},         {name:"Low Bongo"},      {name:"Mute Hi Conga"},
        {name:"Open Hi Conga"},       {name:"Low Conga"},        {name:"High Timbale"},   {name:"Low Timbale"},
        {name:"High Agogo"},          {name:"Low Agogo"},        {name:"Cabasa"},         {name:"Maracas"},
        {name:"Short Whistle"},       {name:"Long Whistle"},     {name:"Short Guiro"},    {name:"Long Guiro"},
        {name:"Claves"},              {name:"Hi Wood Block"},    {name:"Low Wood Block"}, {name:"Mute Cuica"},
        {name:"Open Cuica"},          {name:"Mute Triangle"},    {name:"Open Triangle"},
    ];

    public program1 = [
        // 1-8 : Piano
        [{w:"sine",v:.4,d:0.7,r:0.1,},{w:"triangle",v:3,d:0.7,s:0.1,g:1,a:0.01,k:-1.2}],
        [{w:"triangle",v:0.4,d:0.7,r:0.1,},{w:"triangle",v:4,t:3,d:0.4,s:0.1,g:1,k:-1,a:0.01,}],
        [{w:"sine",d:0.7,r:0.1,},{w:"triangle",v:4,f:2,d:0.5,s:0.5,g:1,k:-1}],
        [{w:"sine",d:0.7,v:0.2,},{w:"triangle",v:4,t:3,f:2,d:0.3,g:1,k:-1,a:0.01,s:0.5,}],
        [{w:"sine",v:0.35,d:0.7,},{w:"sine",v:3,t:7,f:1,d:1,s:1,g:1,k:-.7}],
        [{w:"sine",v:0.35,d:0.7,},{w:"sine",v:8,t:7,f:1,d:0.5,s:1,g:1,k:-.7}],
        [{w:"sawtooth",v:0.34,d:2,},{w:"sine",v:8,f:0.1,d:2,s:1,r:2,g:1,}],
        [{w:"triangle",v:0.34,d:1.5,},{w:"square",v:6,f:0.1,d:1.5,s:0.5,r:2,g:1,}],
        /* 9-16 : Chromatic Perc*/
        [{w:"sine",d:0.3,r:0.3,},{w:"sine",v:7,t:11,d:0.03,g:1,}],
        [{w:"sine",d:0.3,r:0.3,},{w:"sine",v:11,t:6,d:0.2,s:0.4,g:1,}],
        [{w:"sine",v:0.2,d:0.3,r:0.3,},{w:"sine",v:11,t:5,d:0.1,s:0.4,g:1,}],
        [{w:"sine",v:0.2,d:0.6,r:0.6,},{w:"triangle",v:11,t:5,f:1,s:0.5,g:1,}],
        [{w:"sine",v:0.3,d:0.2,r:0.2,},{w:"sine",v:6,t:5,d:0.02,g:1,}],
        [{w:"sine",v:0.3,d:0.2,r:0.2,},{w:"sine",v:7,t:11,d:0.03,g:1,}],
        [{w:"sine",v:0.2,d:1,r:1,},{w:"sine",v:11,t:3.5,d:1,r:1,g:1,}],
        [{w:"triangle",v:0.2,d:0.5,r:0.2,},{w:"sine",v:6,t:2.5,d:0.2,s:0.1,r:0.2,g:1,}],
        /* 17-24 : Organ */
        [{w:"w9999",v:0.22,s:0.9,},{w:"w9999",v:0.22,t:2,f:2,s:0.9,}],
        [{w:"w9999",v:0.2,s:1,},{w:"sine",v:11,t:6,f:2,s:0.1,g:1,h:0.006,r:0.002,d:0.002,},{w:"w9999",v:0.2,t:2,f:1,h:0,s:1,}],
        [{w:"w9999",v:0.2,d:0.1,s:0.9,},{w:"w9999",v:0.25,t:4,f:2,s:0.5,}],
        [{w:"w9999",v:0.3,a:0.04,s:0.9,},{w:"w9999",v:0.2,t:8,f:2,a:0.04,s:0.9,}],
        [{w:"sine",v:0.2,a:0.02,d:0.05,s:1,},{w:"sine",v:6,t:3,f:1,a:0.02,d:0.05,s:1,g:1,}],
        [{w:"triangle",v:0.2,a:0.02,d:0.05,s:0.8,},{w:"square",v:7,t:3,f:1,d:0.05,s:1.5,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:0.2,s:0.5,},{w:"square",v:1,d:0.03,s:2,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:0.1,s:0.8,},{w:"square",v:1,a:0.3,d:0.1,s:2,g:1,}],
        /* 25-32 : Guitar */
        [{w:"sine",v:0.3,d:0.5,f:1,},{w:"triangle",v:5,t:3,f:-1,d:1,s:0.1,g:1,}],
        [{w:"sine",v:0.4,d:0.6,f:1,},{w:"triangle",v:12,t:3,d:0.6,s:0.1,g:1,f:-1,}],
        [{w:"triangle",v:0.3,d:1,f:1,},{w:"triangle",v:6,f:-1,d:0.4,s:0.5,g:1,t:3,}],
        [{w:"sine",v:0.3,d:1,f:-1,},{w:"triangle",v:11,f:1,d:0.4,s:0.5,g:1,t:3,}],
        [{w:"sine",v:0.4,d:0.1,r:0.01},{w:"sine",v:7,g:1,}],
        [{w:"triangle",v:0.4,d:1,f:1,},{w:"square",v:4,f:-1,d:1,s:0.7,g:1,}],//[{w:"triangle",v:0.35,d:1,f:1,},{w:"square",v:7,f:-1,d:0.3,s:0.5,g:1,}],
        [{w:"triangle",v:0.35,d:1,f:1,},{w:"square",v:7,f:-1,d:0.3,s:0.5,g:1,}],//[{w:"triangle",v:0.4,d:1,f:1,},{w:"square",v:4,f:-1,d:1,s:0.7,g:1,}],//[{w:"triangle",v:0.4,d:1,},{w:"square",v:4,f:2,d:1,s:0.7,g:1,}],
        [{w:"sine",v:0.2,t:1.5,a:0.005,h:0.2,d:0.6,},{w:"sine",v:11,t:5,f:2,d:1,s:0.5,g:1,}],
        /* 33-40 : Bass */
        [{w:"sine",d:0.3,},{w:"sine",v:4,t:3,d:1,s:1,g:1,}],
        [{w:"sine",d:0.3,},{w:"sine",v:4,t:3,d:1,s:1,g:1,}],
        [{w:"w9999",d:0.3,v:0.7,s:0.5,},{w:"sawtooth",v:1.2,d:0.02,s:0.5,g:1,h:0,r:0.02,}],
        [{w:"sine",d:0.3,},{w:"sine",v:4,t:3,d:1,s:1,g:1,}],
        [{w:"triangle",v:0.3,t:2,d:1,},{w:"triangle",v:15,t:2.5,d:0.04,s:0.1,g:1,}],
        [{w:"triangle",v:0.3,t:2,d:1,},{w:"triangle",v:15,t:2.5,d:0.04,s:0.1,g:1,}],
        [{w:"triangle",d:0.7,},{w:"square",v:0.4,t:0.5,f:1,d:0.2,s:10,g:1,}],
        [{w:"triangle",d:0.7,},{w:"square",v:0.4,t:0.5,f:1,d:0.2,s:10,g:1,}],
        /* 41-48 : Strings */
        [{w:"sawtooth",v:0.4,a:0.1,d:11,},{w:"sine",v:5,d:11,s:0.2,g:1,}],
        [{w:"sawtooth",v:0.4,a:0.1,d:11,},{w:"sine",v:5,d:11,s:0.2,g:1,}],
        [{w:"sawtooth",v:0.4,a:0.1,d:11,},{w:"sine",v:5,t:0.5,d:11,s:0.2,g:1,}],
        [{w:"sawtooth",v:0.4,a:0.1,d:11,},{w:"sine",v:5,t:0.5,d:11,s:0.2,g:1,}],
        [{w:"sine",v:0.4,a:0.1,d:11,},{w:"sine",v:6,f:2.5,d:0.05,s:1.1,g:1,}],
        [{w:"sine",v:0.3,d:0.1,r:0.1,},{w:"square",v:4,t:3,d:1,s:0.2,g:1,}],
        [{w:"sine",v:0.3,d:0.5,r:0.5,},{w:"sine",v:7,t:2,f:2,d:1,r:1,g:1,}],
        [{w:"triangle",v:0.6,h:0.03,d:0.3,r:0.3,t:0.5,},{w:"n0",v:8,t:1.5,d:0.08,r:0.08,g:1,}],
        /* 49-56 : Ensamble */
        [{w:"sawtooth",v:0.3,a:0.03,s:0.5,},{w:"sawtooth",v:0.2,t:2,f:2,d:1,s:2,}],
        [{w:"sawtooth",v:0.3,f:-2,a:0.03,s:0.5,},{w:"sawtooth",v:0.2,t:2,f:2,d:1,s:2,}],
        [{w:"sawtooth",v:0.2,a:0.02,s:1,},{w:"sawtooth",v:0.2,t:2,f:2,a:1,d:1,s:1,}],
        [{w:"sawtooth",v:0.2,a:0.02,s:1,},{w:"sawtooth",v:0.2,f:2,a:0.02,d:1,s:1,}],
        [{w:"triangle",v:0.3,a:0.03,s:1,},{w:"sine",v:3,t:5,f:1,d:1,s:1,g:1,}],
        [{w:"sine",v:0.4,a:0.03,s:0.9,},{w:"sine",v:1,t:2,f:3,d:0.03,s:0.2,g:1,}],
        [{w:"triangle",v:0.6,a:0.05,s:0.5,},{w:"sine",v:1,f:0.8,d:0.2,s:0.2,g:1,}],
        [{w:"square",v:0.15,a:0.01,d:0.2,r:0.2,t:0.5,h:0.03,},{w:"square",v:4,f:0.5,d:0.2,r:11,a:0.01,g:1,h:0.02,},{w:"square",v:0.15,t:4,f:1,a:0.02,d:0.15,r:0.15,h:0.03,},{g:3,w:"square",v:4,f:-0.5,a:0.01,h:0.02,d:0.15,r:11,}],
        /* 57-64 : Brass */
        [{w:"square",v:0.2,a:0.01,d:1,s:0.6,r:0.04,},{w:"sine",v:1,d:0.1,s:4,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:1,s:0.5,r:0.08,},{w:"sine",v:1,d:0.1,s:4,g:1,}],
        [{w:"square",v:0.2,a:0.04,d:1,s:0.4,r:0.08,},{w:"sine",v:1,d:0.1,s:4,g:1,}],
        [{w:"square",v:0.15,a:0.04,s:1,},{w:"sine",v:2,d:0.1,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:1,s:0.5,r:0.08,},{w:"sine",v:1,d:0.1,s:4,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:1,s:0.6,r:0.08,},{w:"sine",v:1,f:0.2,d:0.1,s:4,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:0.5,s:0.7,r:0.08,},{w:"sine",v:1,d:0.1,s:4,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:1,s:0.5,r:0.08,},{w:"sine",v:1,d:0.1,s:4,g:1,}],
        /* 65-72 : Reed */
        [{w:"square",v:0.2,a:0.02,d:2,s:0.6,},{w:"sine",v:2,d:1,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:2,s:0.6,},{w:"sine",v:2,d:1,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:1,s:0.6,},{w:"sine",v:2,d:1,g:1,}],
        [{w:"square",v:0.2,a:0.02,d:1,s:0.6,},{w:"sine",v:2,d:1,g:1,}],
        [{w:"sine",v:0.4,a:0.02,d:0.7,s:0.5,},{w:"square",v:5,t:2,d:0.2,s:0.5,g:1,}],
        [{w:"sine",v:0.3,a:0.05,d:0.2,s:0.8,},{w:"sawtooth",v:6,f:0.1,d:0.1,s:0.3,g:1,}],
        [{w:"sine",v:0.3,a:0.03,d:0.2,s:0.4,},{w:"square",v:7,f:0.2,d:1,s:0.1,g:1,}],
        [{w:"square",v:0.2,a:0.05,d:0.1,s:0.8,},{w:"square",v:4,d:0.1,s:1.1,g:1,}],
        /* 73-80 : Pipe */
        [{w:"sine",a:0.02,d:2,},{w:"sine",v:6,t:2,d:0.04,g:1,}],
        [{w:"sine",v:0.7,a:0.03,d:0.4,s:0.4,},{w:"sine",v:4,t:2,f:0.2,d:0.4,g:1,}],
        [{w:"sine",v:0.7,a:0.02,d:0.4,s:0.6,},{w:"sine",v:3,t:2,d:0,s:1,g:1,}],
        [{w:"sine",v:0.4,a:0.06,d:0.3,s:0.3,},{w:"sine",v:7,t:2,d:0.2,s:0.2,g:1,}],
        [{w:"sine",a:0.02,d:0.3,s:0.3,},{w:"sawtooth",v:3,t:2,d:0.3,g:1,}],
        [{w:"sine",v:0.4,a:0.02,d:2,s:0.1,},{w:"sawtooth",v:8,t:2,f:1,d:0.5,g:1,}],
        [{w:"sine",v:0.7,a:0.03,d:0.5,s:0.3,},{w:"sine",v:0.003,t:0,f:4,d:0.1,s:0.002,g:1,}],
        [{w:"sine",v:0.7,a:0.02,d:2,},{w:"sine",v:1,t:2,f:1,d:0.02,g:1,}],
        /* 81-88 : SynthLead */
        [{w:"square",v:0.3,d:1,s:0.5,},{w:"square",v:1,f:0.2,d:1,s:0.5,g:1,}],
        [{w:"sawtooth",v:0.3,d:2,s:0.5,},{w:"square",v:2,f:0.1,s:0.5,g:1,}],
        [{w:"triangle",v:0.5,a:0.05,d:2,s:0.6,},{w:"sine",v:4,t:2,g:1,}],
        [{w:"triangle",v:0.3,a:0.01,d:2,s:0.3,},{w:"sine",v:22,t:2,f:1,d:0.03,s:0.2,g:1,}],
        [{w:"sawtooth",v:0.3,d:1,s:0.5,},{w:"sine",v:11,t:11,a:0.2,d:0.05,s:0.3,g:1,}],
        [{w:"sine",v:0.3,a:0.06,d:1,s:0.5,},{w:"sine",v:7,f:1,d:1,s:0.2,g:1,}],
        [{w:"sawtooth",v:0.3,a:0.03,d:0.7,s:0.3,r:0.2,},{w:"sawtooth",v:0.3,t:0.75,d:0.7,a:0.1,s:0.3,r:0.2,}],
        [{w:"triangle",v:0.3,a:0.01,d:0.7,s:0.5,},{w:"square",v:5,t:0.5,d:0.7,s:0.5,g:1,}],
        /* 89-96 : SynthPad */
        [{w:"triangle",v:0.3,a:0.02,d:0.3,s:0.3,r:0.3,},{w:"square",v:3,t:4,f:1,a:0.02,d:0.1,s:1,g:1,},{w:"triangle",v:0.08,t:0.5,a:0.1,h:0,d:0.1,s:0.5,r:0.1,b:0,c:0,}],
        [{w:"sine",v:0.3,a:0.05,d:1,s:0.7,r:0.3,},{w:"sine",v:2,f:1,d:0.3,s:1,g:1,}],
        [{w:"square",v:0.3,a:0.03,d:0.5,s:0.3,r:0.1,},{w:"square",v:4,f:1,a:0.03,d:0.1,g:1,}],
        [{w:"triangle",v:0.3,a:0.08,d:1,s:0.3,r:0.1,},{w:"square",v:2,f:1,d:0.3,s:0.3,g:1,t:4,a:0.08,}],
        [{w:"sine",v:0.3,a:0.05,d:1,s:0.3,r:0.1,},{w:"sine",v:0.1,t:2.001,f:1,d:1,s:50,g:1,}],
        [{w:"triangle",v:0.3,a:0.03,d:0.7,s:0.3,r:0.2,},{w:"sine",v:12,t:7,f:1,d:0.5,s:1.7,g:1,}],
        [{w:"sine",v:0.3,a:0.05,d:1,s:0.3,r:0.1,},{w:"sawtooth",v:22,t:6,d:0.06,s:0.3,g:1,}],
        [{w:"triangle",v:0.3,a:0.05,d:11,r:0.3,},{w:"triangle",v:1,d:1,s:8,g:1,}],
        /* 97-104 : FX */
        [{w:"sawtooth",v:0.3,d:4,s:0.8,r:0.1,},{w:"square",v:1,t:2,f:8,a:1,d:1,s:1,r:0.1,g:1,}],
        [{w:"triangle",v:0.3,d:1,s:0.5,t:0.8,a:0.2,p:1.25,q:0.2,},{w:"sawtooth",v:0.2,a:0.2,d:0.3,s:1,t:1.2,p:1.25,q:0.2,}],
        [{w:"sine",v:0.3,d:1,s:0.3,},{w:"square",v:22,t:11,d:0.5,s:0.1,g:1,}],
        [{w:"sawtooth",v:0.3,a:0.04,d:1,s:0.8,r:0.1,},{w:"square",v:1,t:0.5,d:1,s:2,g:1,}],
        [{w:"triangle",v:0.3,d:1,s:0.3,},{w:"sine",v:22,t:6,d:0.6,s:0.05,g:1,}],
        [{w:"sine",v:0.6,a:0.1,d:0.05,s:0.4,},{w:"sine",v:5,t:5,f:1,d:0.05,s:0.3,g:1,}],
        [{w:"sine",a:0.1,d:0.05,s:0.4,v:0.8,},{w:"sine",v:5,t:5,f:1,d:0.05,s:0.3,g:1,}],
        [{w:"square",v:0.3,a:0.1,d:0.1,s:0.4,},{w:"square",v:1,f:1,d:0.3,s:0.1,g:1,}],
        /* 105-112 : Ethnic */
        [{w:"sawtooth",v:0.3,d:0.5,r:0.5,},{w:"sawtooth",v:11,t:5,d:0.05,g:1,}],
        [{w:"square",v:0.3,d:0.2,r:0.2,},{w:"square",v:7,t:3,d:0.05,g:1,}],
        [{w:"triangle",d:0.2,r:0.2,},{w:"square",v:9,t:3,d:0.1,r:0.1,g:1,}],
        [{w:"triangle",d:0.3,r:0.3,},{w:"square",v:6,t:3,d:1,r:1,g:1,}],
        [{w:"triangle",v:0.4,d:0.2,r:0.2,},{w:"square",v:22,t:12,d:0.1,r:0.1,g:1,}],
        [{w:"sine",v:0.25,a:0.02,d:0.05,s:0.8,},{w:"square",v:1,t:2,d:0.03,s:11,g:1,}],
        [{w:"sine",v:0.3,a:0.05,d:11,},{w:"square",v:7,t:3,f:1,s:0.7,g:1,}],
        [{w:"square",v:0.3,a:0.05,d:0.1,s:0.8,},{w:"square",v:4,d:0.1,s:1.1,g:1,}],
        /* 113-120 : Percussive */
        [{w:"sine",v:0.4,d:0.3,r:0.3,},{w:"sine",v:7,t:9,d:0.1,r:0.1,g:1,}],
        [{w:"sine",v:0.7,d:0.1,r:0.1,},{w:"sine",v:22,t:7,d:0.05,g:1,}],
        [{w:"sine",v:0.6,d:0.15,r:0.15,},{w:"square",v:11,t:3.2,d:0.1,r:0.1,g:1,}],
        [{w:"sine",v:0.8,d:0.07,r:0.07,},{w:"square",v:11,t:7,r:0.01,g:1,}],
        [{w:"triangle",v:0.7,t:0.5,d:0.2,r:0.2,p:0.95,},{w:"n0",v:9,g:1,d:0.2,r:0.2,}],
        [{w:"sine",v:0.7,d:0.1,r:0.1,p:0.9,},{w:"square",v:14,t:2,d:0.005,r:0.005,g:1,}],
        [{w:"square",d:0.15,r:0.15,p:0.5,},{w:"square",v:4,t:5,d:0.001,r:0.001,g:1,}],
        [{w:"n1",v:0.3,a:1,s:1,d:0.15,r:0,t:0.5,}],
        /* 121-128 : SE */
        [{w:"sine",t:12.5,d:0,r:0,p:0.5,v:0.3,h:0.2,q:0.5,},{g:1,w:"sine",v:1,t:2,d:0,r:0,s:1,},{g:1,w:"n0",v:0.2,t:2,a:0.6,h:0,d:0.1,r:0.1,b:0,c:0,}],
        [{w:"n0",v:0.2,a:0.05,h:0.02,d:0.02,r:0.02,}],
        [{w:"n0",v:0.4,a:1,d:1,t:0.25,}],
        [{w:"sine",v:0.3,a:0.1,d:1,s:0.5,},{w:"sine",v:4,t:0,f:1.5,d:1,s:1,r:0.1,g:1,},{g:1,w:"sine",v:4,t:0,f:2,a:0.6,h:0,d:0.1,s:1,r:0.1,b:0,c:0,}],
        [{w:"square",v:0.3,t:0.25,d:11,s:1,},{w:"square",v:12,t:0,f:8,d:1,s:1,r:11,g:1,}],
        [{w:"n0",v:0.4,t:0.5,a:1,d:11,s:1,r:0.5,},{w:"square",v:1,t:0,f:14,d:1,s:1,r:11,g:1,}],
        [{w:"sine",t:0,f:1221,a:0.2,d:1,r:0.25,s:1,},{g:1,w:"n0",v:3,t:0.5,d:1,s:1,r:1,}],
        [{w:"sine",d:0.4,r:0.4,p:0.1,t:2.5,v:1,},{w:"n0",v:12,t:2,d:1,r:1,g:1,}],
    ];

    public drummap1 = [
        /*35*/
        [{w:"triangle",t:0,f:70,v:1,d:0.05,h:0.03,p:0.9,q:0.1,},{w:"n0",g:1,t:6,v:17,r:0.01,h:0,p:0,}],
        [{w:"triangle",t:0,f:88,v:1,d:0.05,h:0.03,p:0.5,q:0.1,},{w:"n0",g:1,t:5,v:42,r:0.01,h:0,p:0,}],
        [{w:"n0",f:222,p:0,t:0,r:0.01,h:0,}],
        [{w:"triangle",v:0.3,f:180,d:0.05,t:0,h:0.03,p:0.9,q:0.1,},{w:"n0",v:0.6,t:0,f:70,h:0.02,r:0.01,p:0,},{g:1,w:"square",v:2,t:0,f:360,r:0.01,b:0,c:0,}],
        [{w:"square",f:1150,v:0.34,t:0,r:0.03,h:0.025,d:0.03,},{g:1,w:"n0",t:0,f:13,h:0.025,d:0.1,s:1,r:0.1,v:1,}],
        /*40*/
        [{w:"triangle",f:200,v:1,d:0.06,t:0,r:0.06,},{w:"n0",g:1,t:0,f:400,v:12,r:0.02,d:0.02,}],
        [{w:"triangle",f:100,v:0.9,d:0.12,h:0.02,p:0.5,t:0,r:0.12,},{g:1,w:"n0",v:5,t:0.4,h:0.015,d:0.005,r:0.005,}],
        [{w:"n1",f:390,v:0.25,r:0.01,t:0,}],
        [{w:"triangle",f:120,v:0.9,d:0.12,h:0.02,p:0.5,t:0,r:0.12,},{g:1,w:"n0",v:5,t:0.5,h:0.015,d:0.005,r:0.005,}],
        [{w:"n1",v:0.25,f:390,r:0.03,t:0,h:0.005,d:0.03,}],
        /*45*/
        [{w:"triangle",f:140,v:0.9,d:0.12,h:0.02,p:0.5,t:0,r:0.12,},{g:1,w:"n0",v:5,t:0.3,h:0.015,d:0.005,r:0.005,}],
        [{w:"n1",v:0.25,f:390,t:0,d:0.2,r:0.2,},{w:"n0",v:0.3,t:0,c:0,f:440,h:0.005,d:0.05,}],
        [{w:"triangle",f:155,v:0.9,d:0.12,h:0.02,p:0.5,t:0,r:0.12,},{g:1,w:"n0",v:5,t:0.3,h:0.015,d:0.005,r:0.005,}],
        [{w:"triangle",f:180,v:0.9,d:0.12,h:0.02,p:0.5,t:0,r:0.12,},{g:1,w:"n0",v:5,t:0.3,h:0.015,d:0.005,r:0.005,}],
        [{w:"n1",v:0.3,f:1200,d:0.2,r:0.2,h:0.05,t:0,},{w:"n1",t:0,v:1,d:0.1,r:0.1,p:1.2,f:440,}],
        /*50*/
        [{w:"triangle",f:220,v:0.9,d:0.12,h:0.02,p:0.5,t:0,r:0.12,},{g:1,w:"n0",v:5,t:0.3,h:0.015,d:0.005,r:0.005,}],
        [{w:"n1",f:500,v:0.15,d:0.4,r:0.4,h:0,t:0,},{w:"n0",v:0.1,t:0,r:0.01,f:440,}],
        [{w:"n1",v:0.3,f:800,d:0.2,r:0.2,h:0.05,t:0,},{w:"square",t:0,v:1,d:0.1,r:0.1,p:0.1,f:220,g:1,}],
        [{w:"sine",f:1651,v:0.15,d:0.2,r:0.2,h:0,t:0,},{w:"sawtooth",g:1,t:1.21,v:7.2,d:0.1,r:11,h:1,},{g:1,w:"n0",v:3.1,t:0.152,d:0.002,r:0.002,}],
        null,
        /*55*/
        [{w:"n1",v:.3,f:1200,d:0.2,r:0.2,h:0.05,t:0,},{w:"n1",t:0,v:1,d:0.1,r:0.1,p:1.2,f:440,}],
        null,
        [{w:"n1",v:0.3,f:555,d:0.25,r:0.25,h:0.05,t:0,},{w:"n1",t:0,v:1,d:0.1,r:0.1,f:440,a:0.005,h:0.02,}],
        [{w:"sawtooth",f:776,v:0.2,d:0.3,t:0,r:0.3,},{g:1,w:"n0",v:2,t:0,f:776,a:0.005,h:0.02,d:0.1,s:1,r:0.1,c:0,},{g:11,w:"sine",v:0.1,t:0,f:22,d:0.3,r:0.3,b:0,c:0,}],
        [{w:"n1",f:440,v:0.15,d:0.4,r:0.4,h:0,t:0,},{w:"n0",v:0.4,t:0,r:0.01,f:440,}],
        /*60*/  null,null,null,null,null,
        /*65*/  null,null,null,null,null,
        /*70*/  null,null,null,null,null,
        /*75*/  null,null,null,null,null,
        /*80*/
        [{w:"sine",f:1720,v:0.3,d:0.02,t:0,r:0.02,},{w:"square",g:1,t:0,f:2876,v:6,d:0.2,s:1,r:0.2,}],
        [{w:"sine",f:1720,v:0.3,d:0.25,t:0,r:0.25,},{w:"square",g:1,t:0,f:2876,v:6,d:0.2,s:1,r:0.2,}],
    ];

    public pg:number[] = [];
    public vol:number[] = [];
    public ex:number[] = [];
    public bend:number[] = [];
    public rpnidx:number[] = [];
    public brange:number[] = [];
    public sustain:number[] = [];
    public notetab:Note[] = [];
    public rhythm:number[] = [];

    public chvol:GainNode[] = [];
    public chmod:GainNode[] = [];
    public chpan:StereoPannerNode[] = [];

    public maxTick = 0;
    public playTick = 0;
    public playing = 0;
    public releaseRatio = 3.5;
    public preroll = 0.2;
    public relcnt = 0;

    public isReady = false;

    private audioContext!:AudioContext;
    public actx!:AudioContext;
    public dest!:AudioDestinationNode;
    public out!:GainNode;
    public comp!:DynamicsCompressorNode;

    private convBuf!:AudioBuffer;
    private conv!:ConvolverNode;
    private noiseBuf:{[key:string]:AudioBuffer} = {};
    private useReverb:boolean = false;
    private rev!:GainNode;
    public lfo!:OscillatorNode; //https://en.wikipedia.org/wiki/Low-frequency_oscillation
    public wave:{ [key:string]:PeriodicWave } = {};

    private tsdiff!:number;

    constructor() {
        this.setQuality(1);
        this.ready();
    }

    public ready() {
        this.pg = [];
        this.vol = [];
        this.ex = [];
        this.bend = [];
        this.rpnidx = [];
        this.brange = [];
        this.sustain = [];
        this.notetab = [];
        this.rhythm = [];
        this.maxTick = 0;
        this.playTick = 0;
        this.playing = 0;
        this.releaseRatio = 3.5;

        for (let i = 0; i < 16; i++) {
            this.pg[i] = 0;
            this.vol[i] = 3 * 100 * 100 / (127 * 127);
            this.bend[i] = 0;
            this.brange[i] = 0x100;
            this.rhythm[i]=0;
        }
        this.rhythm[9] = 1;
        this.preroll = 0.2;
        this.relcnt = 0;
        setInterval(() => {
            if(++this.relcnt>=3){
                this.relcnt=0;
                for(var i=this.notetab.length-1;i>=0;--i){
                    var nt=this.notetab[i];
                    if(this.actx.currentTime>nt.e){
                        this._pruneNote(nt);
                        this.notetab.splice(i,1);
                    }
                }
            }
        }, 60);
        if (this.internalcontext) {
            window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            this.setAudioContext(new AudioContext());
        }
        this.isReady = true;
    }

    public setMasterVol(v?:number) {
        if (v != undefined) {
            this.masterVol = v;
        }
        if (this.out) {
            this.out.gain.value = this.masterVol;
            console.log('this.out', this.out);
        }
    }

    public setReverbLev(v?:number) {
        if (v) {
            this.reverbLev = v;
        }
        if (this.rev) {
            this.rev.gain.value = this.reverbLev * 8;
        }
    }

    public setLoop(f:boolean) {
        this.loop = f;
    }

    public getTimbreName (m:number, n:number){
        if(m == 0) {
            return this.program[n].name;
        } else {
            return this.drummap[n-35].name;
        }
    }

    public reset() {
        for (let i = 0; i < 16; i++) {
            this.setProgram(i, 0);
            this.setBendRange(i,0x100);
            this.setChVol(i,100);
            this.setPan(i,64);
            this.resetAllControllers(i);
            this.allSoundOff(i);
            this.rhythm[i]=0;
        }
        this.rhythm[9]=1;
    }

    public setQuality(q:number = 1) {
        if (q !== undefined) {
            this.quality = q;
        }
        if (this.quality) {
            for (let i = 0; i < this.program1.length; i++) {
                this.setTimbre(0, i, this.program1[i]);
            }
            for (let i = 0; i < this.drummap1.length; i++){
                if(this.drummap1[i]) {
                    this.setTimbre(1, i + 35, this.drummap1[i]);
                }
            }
        }
    }

    public setTimbre(m:number, n:number, p:any) {
        const defp = {
            g:0,
            w:"sine",
            t:1,
            f:0,
            v:0.5,
            a:0,
            h:0.01,
            d:0.01,
            s:0,
            r:0.05,
            p:1,
            q:1,
            k:0,
        };
        function filldef(pg:any) {
            for (let i = 0; i < pg.length; i++) {
                for (const k in defp) {
                    if (!pg[i].hasOwnProperty(k) || typeof (pg[i][k]) == 'undefined') {
                        pg[i][k] = (defp as any)[k];
                    }
                }
            }
            return pg;
        }
        if (m && n >= 35 && n <= 81) {
            this.drummap[n - 35] = {
                name: this.drummapNamelist[n-35].name,
                p: filldef(p),
            }
        }
        if (m == 0 && n >= 0 && n <= 127) {
            this.program[n] = {
                name: this.programNameList[n].name,
                p: filldef(p),
            }
        }
    }

    private _pruneNote(nt:Note) {
        for (let k = nt.o.length - 1; k >= 0; k--) {
            let isOscillator = false;
            if (typeof (nt.o[k] as any).frequency !== 'undefined') {
                this.chmod[nt.ch].disconnect(nt.o[k].detune);
                isOscillator = true;
            }
            nt.o[k].disconnect();
            if (isOscillator) {
                (nt.o[k] as OscillatorNode).frequency.cancelScheduledValues(0);
            } else {
                (nt.o[k] as AudioBufferSourceNode).playbackRate.cancelScheduledValues(0);
            }
            nt.o[k].stop(0);
        }
        for (let k = nt.g.length - 1; k >= 0; k--) {
            nt.g[k].disconnect();
            nt.g[k].gain.cancelScheduledValues(0);
        }
    }

    private _limitVoices(ch:number, n:number) {
        this.notetab.sort(function(n1, n2) {
            if (n1.f != n2.f) {
                return n1.f - n2.f;
            }
            if (n1.e != n2.e) {
                return n2.e - n1.e;
            }
            return n2.t-n1.t;
        });
        for(let i=this.notetab.length-1;i>=0;--i){
            const nt=this.notetab[i];
            if(this.actx.currentTime > nt.e || i >= (this.voices-1)){
                this._pruneNote(nt);
                this.notetab.splice(i,1);
            }
        }
    }

    private _note(time:number, ch:number, n:number, volume:number, p:any) {
        const o:(AudioBufferSourceNode|OscillatorNode)[] = [];
        const g:GainNode[] = [];
        const vp:number[] = [];
        const fp:number[] = [];
        const r = [];
        const frequency = 440 * Math.pow(2, (n - 69) / 12);
        let out:AudioParam|AudioNode;
        let sc;
        let pn;
        this._limitVoices(ch,n);
        for (let i = 0; i < p.length; i++) {
            pn = p[i];
            console.log('i =', i, pn);
            let dt = time + pn.a + pn.h;
            if (pn.g == 0) {
                out = this.chvol[ch];
                sc = volume * volume / 16384;
                fp[i] = frequency * pn.t + pn.f;
            } else if (pn.g > 10) {
                out = g[pn.g - 11].gain;
                sc = 1;
                fp[i] = fp[pn.g-11] * pn.t + pn.f;
            } else if (typeof (o[pn.g - 1] as any).frequency !== 'undefined') {
                out = (o[pn.g - 1] as OscillatorNode).frequency;
                sc = fp[pn.g-1];
                fp[i] = fp[pn.g-1] * pn.t + pn.f;
            } else {
                out = (o[pn.g - 1] as AudioBufferSourceNode).playbackRate;
                sc = fp[pn.g-1] / 440;
                fp[i] = fp[pn.g-1] * pn.t + pn.f;
            }

            switch(pn.w[0]) {
                case 'n':
                    const bufferSource = this.actx.createBufferSource();
                    bufferSource.buffer = this.noiseBuf[pn.w];
                    bufferSource.loop = true;
                    bufferSource.playbackRate.value = fp[i] / 440;
                    o[i] = bufferSource;
                    if (pn.p !== 1) {
                        this._setParamTarget((o[i] as AudioBufferSourceNode).playbackRate, fp[i]/440 * pn.p, time, pn.q);
                    }
                    break;
                default :
                    const osc = this.actx.createOscillator();
                    osc.frequency.value = fp[i];
                    o[i] = osc;
                    if (pn.p !== 1) {
                        this._setParamTarget((o[i] as OscillatorNode).frequency, fp[i] * pn.p, time, pn.q);
                    }
                    if (pn.w[0] == 'w') {
                        (o[i] as OscillatorNode).setPeriodicWave(this.wave[pn.w]);
                    } else {
                        (o[i] as OscillatorNode).type = pn.w;
                    }
                    this.chmod[ch].connect(o[i].detune);
                    o[i].detune.value = this.bend[ch];
                    break;
            }
            g[i] = this.actx.createGain();
            r[i] = pn.r;
            o[i].connect(g[i]);

            g[i].connect(out as any);
            vp[i] = sc * pn.v;
            if (pn.k) {
                vp[i] *= Math.pow(2, (n - 60)/12 * pn.k);
            }
            if (pn.a) {
                g[i].gain.value = 0;
                g[i].gain.setValueAtTime(0, time);
                g[i].gain.linearRampToValueAtTime(vp[i], time + pn.a);
            } else {
                g[i].gain.setValueAtTime(vp[i], time);
            }
            this._setParamTarget(g[i].gain, pn.s * vp[i], dt, pn.d);
            o[i].start(time);
            console.log('startTime:', time);
            if(this.rhythm[ch]) {
                o[i].stop(time + p[0].d * this.releaseRatio);
            }
        }
        console.log('pn', pn);
        if (!this.rhythm[ch]) {
            this.notetab.push({t: time, e:99999, ch:ch, n:n, o:o, g:g, t2: time + pn.a, v: vp, r:r, f: 0});
        }
    }

    private _setParamTarget(param:AudioParam, value:number, time:number, d:number) {
        if (d !== 0) {
            param.setTargetAtTime(value, time, d);
        } else {
            param.setValueAtTime(value, time);
        }
    }

    private _releaseNote(nt:Note, t:number) {
        if (nt.ch != 9) {
            for (let k = nt.g.length - 1; k >=0; k--) {
                nt.g[k].gain.cancelScheduledValues(t);
                if (t == nt.t2) {
                    nt.g[k].gain.setValueAtTime(nt.v[k], t);
                } else if (t < nt.t2) {
                    nt.g[k].gain.setValueAtTime(nt.v[k] * (t - nt.t) / (nt.t2 - nt.t), t);
                }
                this._setParamTarget(nt.g[k].gain, 0, t, nt.r[k]);
            }
        }
        nt.e = t + nt.r[0] * this.releaseRatio;
        nt.f = 1;
    }

    public allSoundOff(ch:number) {
        for (let i = this.notetab.length - 1; i >= 0; i--) {
            let nt = this.notetab[i];
            if (nt.ch === ch) {
                this._pruneNote(nt);
                this.notetab.splice(i,1);
            }
        }
    }

    public resetAllControllers(ch:number) {
        this.bend[ch] = 0;
        this.ex[ch] = 1.0;
        this.rpnidx[ch] = 0x3fff;
        this.sustain[ch]=0;
        if(this.chvol[ch]){
            this.chvol[ch].gain.value = this.vol[ch] * this.ex[ch];
            this.chmod[ch].gain.value=0;
        }
    }

    public setBendRange(ch:number, v:number) {
        this.brange[ch] = v;
    }

    public setProgram(ch:number, v:number) {
        this.pg[ch] = v;
    }

    public setBend(ch:number, v:number, time?:number) {
        time = this._tsConv(time);
        const br = this.brange[ch] * 100 / 127;
        this.bend[ch] = (v - 8192) * br / 8192;
        for (let i = this.notetab.length - 1; i >= 0; i--) {
            let nt = this.notetab[i];
            if (nt.ch == ch) {
                for (let k = nt.o.length - 1; k >= 0; k--) {
                    if (typeof (nt.o[k] as any).frequency !== 'undefined') {
                        nt.o[k].detune.setValueAtTime(this.bend[ch], time);
                    }
                }
            }
        }
    }

    public noteOn(ch:number, n:number, v:number, time?:number) {
        if (v == 0) {
            this.noteOff(ch, n, time);
            return;
        }
        time = this._tsConv(time);
        if (this.rhythm[ch]) {
            if (n >= 35 && n <= 81) {
                this._note(time, ch, n, v, this.drummap[n-35].p);
            }
            return;
        }
        console.log('noteOn', ch, n, v, time);
        this._note(time, ch, n, v, this.program[this.pg[ch]].p);
    }

    public noteOff(ch:number, n:number, time?:number) {
        if (this.rhythm[ch]) {
            return;
        }
        time = this._tsConv(time);
        for (let i = this.notetab.length - 1; i >= 0; i--) {
            let nt = this.notetab[i];
            if (time >= nt.t && nt.ch === ch && nt.n==n && nt.f==0) {
                nt.f=1;
                if (this.sustain[ch] < 64) {
                    this._releaseNote(nt, time);
                }
            }
        }
    }

    private _tsConv(t?:number) {
        if (t == undefined || t <= 0) {
            t = 0;
            if (this.actx) {
                t = this.actx.currentTime;
            }
        } else {
            if (this.tsmode) {
                t = t * 0.001 - this.tsdiff;
            }
        }
        return t;
    }

    public setTsMode(f:boolean) {
        this.tsmode = f;
    }
    
    // https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message
    public send(msg:number[], t?:number) {
        const ch = msg[0] & 0xf;
        const cmd = msg[0] & (~0xf);
        if(cmd < 0x80 || cmd >= 0x100) {
            return;
        }
        switch (cmd) {
            case 0xb0: // 1011nnnn
                switch (msg[1]) {
                    case 1:     this.setModulation(ch, msg[2], t); break;
                    case 7:     this.setChVol(ch, msg[2], t); break;
                    case 10:    this.setPan(ch, msg[2], t); break;
                    case 11:    this.setExpression(ch,msg[2],t); break;
                    case 64:    this.setSustain(ch,msg[2],t); break;
                    case 98:  case 98: this.rpnidx[ch]=0x3fff; break; /* nrpn lsb/msb */
                    case 100:   this.rpnidx[ch]=(this.rpnidx[ch]&0x380)|msg[2]; break; /* rpn lsb */
                    case 101:   this.rpnidx[ch]=(this.rpnidx[ch]&0x7f)|(msg[2]<<7); break; /* rpn msb */
                    case 6:  /* data entry msb */
                        if(this.rpnidx[ch]==0) {
                            this.brange[ch]=(msg[2]<<7)+(this.brange[ch]&0x7f);
                        }
                        break;
                    case 38:  /* data entry lsb */
                        if(this.rpnidx[ch]==0) {
                            this.brange[ch]=(this.brange[ch]&0x380)|msg[2];
                        }
                        break;
                    case 120:  /* all sound off */
                    case 123:  /* all notes off */
                    case 124: case 125: case 126: case 127: /* omni off/on mono/poly */
                        this.allSoundOff(ch);
                        break;
                    case 121:   this.resetAllControllers(ch); break;
                }
            case 0xc0: this.setProgram(ch, msg[1]); break;
            case 0xe0: this.setBend(ch, (msg[1] + (msg[2]<<7))); break;
            case 0x90: this.noteOn(ch, msg[1], msg[2], t); break;
            case 0x80: this.noteOff(ch, msg[1], t); break;
            case 0xf0:
                break;
        }
    }

    public setModulation(ch:number, v:number, t?:number) {
        this.chmod[ch].gain.setValueAtTime(v * 100 / 127, this._tsConv(t));
    }

    public setChVol(ch:number, v:number, t?:number) {
        this.vol[ch] = 3 * v * v / (127 * 127);
        console.log(this.vol[ch] * this.ex[ch]);
        this.chvol[ch].gain.setValueAtTime(this.vol[ch]*this.ex[ch],this._tsConv(t));
    }

    public setPan(ch:number, v:number, t?:number) {
        if (this.chpan[ch]) {
            this.chpan[ch].pan.setValueAtTime((v - 64) / 64,this._tsConv(t));
        }
    }

    public setExpression(ch:number, v:number, t?:number) {
        this.ex[ch]=v*v/(127*127);
        this.chvol[ch].gain.setValueAtTime(this.vol[ch]*this.ex[ch],this._tsConv(t));
    }

    public setSustain(ch:number, v:number, time?:number) {
        this.sustain[ch] = v;
        time = this._tsConv(time);
        if (v < 64) {
            for (let i = this.notetab.length - 1; i >= 0; i--) {
                const nt = this.notetab[i];
                if (time >= nt.t && nt.ch == ch && nt.f == 1) {
                    this._releaseNote(nt, time);
                }
            }
        }
    }
    // About the wave: these are really usefull content
    // https://stackoverflow.com/questions/20156888/what-are-the-parameters-for-createperiodicwave-in-google-chrome
    // https://www.reddit.com/r/webaudio/comments/7g3ag6/question_about_how_to_use_createperiodicwave_to/
    // https://meettechniek.info/additional/additive-synthesis.html
    private _createWave(w:string) {
        const imag = new Float32Array(w.length);
        const real = new Float32Array(w.length);
        for (let i = 1 ; i < w.length; i++) {
            imag[i] = parseFloat(w[i]);
        }
        return this.actx.createPeriodicWave(real,imag);
    }

    public getAudioContext() {
        return this.actx;
    }

    public setAudioContext(actx:AudioContext, dest?:AudioDestinationNode) {
        this.audioContext = this.actx = actx;
        if (!dest) {
            dest = actx.destination;
        }
        this.dest = dest;
        this.tsdiff = performance.now() * 0.001 - this.actx.currentTime;
        this.out = this.actx.createGain();
        this.comp=this.actx.createDynamicsCompressor();
        const blen = this.actx.sampleRate * .5 | 0;
        this.convBuf = this.actx.createBuffer(2, blen, this.actx.sampleRate);
        this.noiseBuf = {};
        this.noiseBuf['n0'] = this.actx.createBuffer(1, blen, this.actx.sampleRate);
        this.noiseBuf['n1'] = this.actx.createBuffer(1, blen, this.actx.sampleRate);
        const d1 = this.convBuf.getChannelData(0);
        const d2 = this.convBuf.getChannelData(1);
        const dn = this.noiseBuf['n0'].getChannelData(0);
        const dr = this.noiseBuf['n1'].getChannelData(0);
        for (let i = 0; i < blen; i++) {
            if (i / blen < Math.random()) {
                d1[i]=Math.exp(-3*i/blen)*(Math.random()-.5)*.5;
                d2[i]=Math.exp(-3*i/blen)*(Math.random()-.5)*.5;
            }
            dn[i] = Math.random() * 2 - 1;
        }
        for (let jj = 0; jj < 64; jj++) {
            let r1 = Math.random() * 10 + 1;
            let r2 = Math.random() * 10 + 1;
            for (let i = 0; i < blen; i++) {
                const dd = Math.sin((i / blen) * 2 * Math.PI * 440 * r1) * Math.sin((i / blen) * 2 * Math.PI * 440 * r2);
                dr[i] += dd / 8;
            }
        }
        if (this.useReverb) {
            this.conv = this.actx.createConvolver();
            this.conv.buffer = this.convBuf;
            this.rev = this.actx.createGain();
            this.rev.gain.value = this.reverbLev;
            this.out.connect(this.conv);
            this.conv.connect(this.rev);
            this.rev.connect(this.comp);
        }
        this.setMasterVol(1);
        this.out.connect(this.comp);
        this.comp.connect(this.dest);
        this.chvol = [];
        this.chmod = [];
        this.chpan = [];
        this.wave = { "w9999": this._createWave("w9999"), };
        this.lfo = this.actx.createOscillator();
        this.lfo.frequency.value = 5;
        this.lfo.start(0);
        for(let i = 0; i < 16; ++i){
            this.chvol[i] = this.actx.createGain();
            // if(this.actx.createStereoPanner){
            //     this.chpan[i] = this.actx.createStereoPanner();
            //     this.chvol[i].connect(this.chpan[i]);
            //     this.chpan[i].connect(this.out);
            // }
            // else{
            //     delete this.chpan[i];
            //     this.chvol[i].connect(this.out);
            // }
            this.chvol[i].connect(this.out);

            this.chmod[i] = this.actx.createGain();
            this.lfo.connect(this.chmod[i]);
            this.pg[i]=0;
            this.resetAllControllers(i);
        }
        this.setReverbLev();
        this.reset();
        this.send([0x90,60,1]);
        this.send([0x90,60,0]);
    }
}