import React, { RefObject } from 'react';
import './style.css';

interface Props {
    min?:number;
    keys?:number;
    width?:number;
    height?:number;
}

interface State {
}

export class WebaudioKeyboard extends React.Component<Props, State> {

    private canvasRef:React.RefObject<HTMLCanvasElement> = React.createRef<HTMLCanvasElement>();

    private width = 480;
    private height = 128;

    private blackHeight!:number;
    private kp = [0, 7/12, 1, 3*7/12, 2, 3, 6*7/12, 4, 8*7/12, 5, 10*7/12, 6];
    private kf = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
    private ko = [0, 0, (7*2)/12-1 , 0, (7*4)/12-2, (7*5)/12-3, 0, (7*7)/12-4, 0, (7*9)/12-5, 0, (7*11)/12-6];
    private kn = [0, 2, 4, 5, 7, 9, 11];
    private colors = ['#222', '#eee', '#ccc', '#333', '#000', '#e88', '#c44', '#c33', '#800'];
    private dispvalues:number[] = [];
    private min = 0;
    private keys = 72;
    private max = 24;

    private whiteWidth!:number;
    private blackWidth!:number;

    private enable = true;

    private values:number[] = [];
    private prevValues:number[] = [];

    private press:boolean = false;
    private hover:boolean = false;
    private currentKey = -1;

    constructor(props:Props) {
        super(props);
        this.width = props.width || this.width;
        this.height = props.height || this.height;
        this.min = props.min || this.min;
        this.keys = props.keys || this.keys;
        this.max = this.min + this.keys - 1;
        this.blackHeight = this.height * 0.55;
        // don't let the black key be the min or max
        if(this.kf[this.min%12]) {
            --this.min;
        }
        if(this.kf[this.max%12]) {
            ++this.max;
        }
    }

    public componentDidMount() {
        if (this.canvasRef.current) {
            const canvas = this.canvasRef.current;
            canvas.height = this.height;
            canvas.width = this.width;
            canvas.style.width = this.width + 'px';
            canvas.style.height = this.height + 'px';
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('canvas context cannot create');
                return;
            }
            ctx.fillStyle = '#a22';
            ctx.fillRect(0, 0, this.width, this.height);
            document.addEventListener('keydown', this.keydown);
            document.addEventListener('keyup', this.keyup);
            this.redraw();
        }
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);
    }

    private preventScroll = (ev:TouchEvent) => {
        ev.preventDefault();
    }

    private pointerdown = (e:React.MouseEvent<HTMLDivElement, MouseEvent>|React.TouchEvent<HTMLDivElement>) => {
        document.body.addEventListener('touchstart', this.preventScroll);
        if (this.enable) {
            this.press = true;
            this.pointermove(e);
        }
        e.preventDefault();
    }

    private pointermove = (e:React.MouseEvent<HTMLDivElement, MouseEvent>|React.TouchEvent<HTMLDivElement>) => {
        if (!this.enable) {
            return;
        }
        if (!e.target) {
            return;
        }
        const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const v = [];
        let p:{clientX:number, clientY:number}[] = [];
        if (typeof (e as React.TouchEvent<HTMLDivElement>).touches !== 'undefined') {
            for (let i = 0; i < (e as React.TouchEvent<HTMLDivElement>).touches.length; i++) {
                p.push({
                    clientX: (e as React.TouchEvent<HTMLDivElement>).touches[i].clientX,
                    clientY: (e as React.TouchEvent<HTMLDivElement>).touches[i].clientY,
                });
            }
        } else if (this.press && this.hover) {
            p.push({
                clientX: (e as React.MouseEvent).clientX,
                clientY: (e as React.MouseEvent).clientY,
            });
        } else {
            return;
        }
        for (let i = 0; i < p.length; i++) {
            let px = p[i].clientX - r.left;
            let py = p[i].clientY - r.top;
            if (px < 0) {
                px = 0;
            }
            if (px >= r.width) {
                px = r.width - 1;
            }
            if (py < this.blackHeight) {
                const x = px - this.whiteWidth * this.ko[this.min % 12];
                const k = this.min + ((x / this.blackWidth) | 0);
                v.push(k);
            } else {
                let k = (px / this.whiteWidth)|0;
                const ko = this.kp[this.min%12];
                k += ko;
                k = this.min + ((k / 7) | 0) * 12 + this.kn[k % 7] - this.kn[ko % 7];
                v.push(k);
            }
        }
        v.sort();
        this.values = v;
        this.sendevent();
        this.redraw();
    }

    private pointerup = (e:React.MouseEvent<HTMLDivElement, MouseEvent>|React.TouchEvent<HTMLDivElement>) => {
        document.body.removeEventListener('touchstart', this.preventScroll);
        if (this.enable) {
            this.press = false;
            this.values = [];
            this.sendevent();
            this.redraw();
        }
        e.preventDefault();
    }

    private pointerover = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(!this.enable) {
            return;
        }
        this.hover = true;
    }

    private pointerout = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(!this.enable) {
            return;
        }
        this.hover = false;
        this.values = [];
        this.sendevent();
        this.redraw();
    }

    // z and a row
    private keyCodes1 = [90,83,88,68,67,86,71,66,72,78,74,77,188,76,190,187,191,226];
    // q and number row
    private keyCodes2 = [81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80,192,222,219];

    private keydown = (ev:KeyboardEvent) => {
        const m = Math.floor((this.min + 11) / 12) * 12;
        let k = this.keyCodes1.indexOf(ev.keyCode);
        if(k < 0) {
            k = this.keyCodes2.indexOf(ev.keyCode);
            if (k >= 0) {
                k += 12;
            }
        }
        if(k >= 0){
            k += m;
            if(this.currentKey != k){
                this.currentKey = k;
                this.sendEvent(1, k);
                this.setNote(1, k);
            }
        }
    }

    private keyup = (ev:KeyboardEvent) => {
        const m = Math.floor((this.min + 11) / 12) * 12;
        let k = this.keyCodes1.indexOf(ev.keyCode);
        if(k < 0) {
            k = this.keyCodes2.indexOf(ev.keyCode);
            if (k >= 0) {
                k += 12;
            }
        }
        if(k >= 0){
            k += m;
            this.currentKey = -1;
            this.sendEvent(0, k);
            this.setNote(0, k);
        }
    }

    public sendEvent(s:number, k:number) {
        var ev=document.createEvent('HTMLEvents');
        ev.initEvent('webaudio-keyboard-change',true,true);
        (ev as any).note=[s,k];
        this.canvasRef.current?.dispatchEvent(ev);
    }

    public sendevent() {
        const notes = [];
        for (let i = 0, j = this.prevValues.length; i < j; i++) {
            if (this.values.indexOf(this.prevValues[i]) < 0) {
                // note off
                notes.push([0, this.prevValues[i]]);
            }
        }
        for (let i = 0, j = this.values.length; i < j; i++) {
            if (this.prevValues.indexOf(this.values[i]) < 0) {
                // note on
                notes.push([1, this.values[i]]);
            }
        }
        if (notes.length) {
            this.prevValues = this.values;
            for(let i = 0; i < notes.length; ++i) {
                this.setDispValues(notes[i][0], notes[i][1]);
                const ev = document.createEvent('HTMLEvents');
                ev.initEvent('webaudio-keyboard-change',true,true);
                (ev as any).note = notes[i];
                this.canvasRef.current?.dispatchEvent(ev);
            }
        }
    }

    private redraw = () => {
        function rrect(ctx:CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number, c1:string, c2?:string) {
            if (c2) {
                let g = ctx.createLinearGradient(x, y, x+w, y);
                g.addColorStop(0, c1);
                g.addColorStop(1, c2);
                ctx.fillStyle = g;
            } else {
                ctx.fillStyle = c1;
            }
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y+h-r);
            ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
            ctx.lineTo(x+r, y+h);
            ctx.quadraticCurveTo(x, y+h, x, y+h-r);
            ctx.lineTo(x, y);
            ctx.fill();
        }
        const ctx = this.canvasRef.current?.getContext('2d');
        if (!ctx) {
            return;
        }
        ctx.fillStyle = this.colors[0];
        ctx.fillRect(0, 0, this.width, this.height);
        const x0 = 7 * ((this.min / 12)|0) + this.kp[this.min % 12];
        const x1 = 7 * ((this.max / 12)|0) + this.kp[this.max % 12];
        const n = x1 - x0;
        this.whiteWidth = (this.width - 1)/(n + 1);
        this.blackWidth = this.whiteWidth*7/12;
        const h2 = this.blackHeight;
        let r = Math.min(8, this.whiteWidth * 0.2);
        for (let i = this.min, j = 0; i <= this.max; i++) {
            if (this.kf[i%12] == 0) {
                const x = this.whiteWidth * j + 1;
                j++;
                if (this.dispvalues.indexOf(i) >= 0) {
                    rrect(ctx, x, 1, this.whiteWidth - 1, this.height - 2, r, this.colors[5], this.colors[6]);
                } else {
                    rrect(ctx, x, 1, this.whiteWidth - 1, this.height - 2, r, this.colors[1], this.colors[2]);
                }
            }
        }
        r = Math.min(8, this.blackWidth * 0.3);
        for (let i = this.min; i < this.max; i++) {
            if (this.kf[i%12] == 1) {
                let x = this.whiteWidth * this.ko[this.min % 12] + this.blackWidth * (i - this.min) + 1;
                if (this.dispvalues.indexOf(i) >= 0) {
                    rrect(ctx, x, 1, this.blackWidth, h2, r, this.colors[7], this.colors[8]);
                } else {
                    rrect(ctx, x, 1, this.blackWidth, h2, r, this.colors[3], this.colors[4]);
                }
                ctx.strokeStyle = this.colors[0];
                ctx.stroke();
            }
        }
    }

    public setDispValues(state:number, note:number) {
        let n = this.dispvalues.indexOf(note);
        if (state) {
            if (n < 0) {
                this.dispvalues.push(note);
            }
        } else {
            if (n >=0 ) {
                this.dispvalues.splice(n,1);
            }
        }
    }

    public setNote(state:number, note:number) {
        this.setDispValues(state, note);
        this.redraw();
    }

    public render() {
        return <div
            onMouseDown={(ev) => { this.pointerdown(ev); }}
            onTouchStart={(ev) => { this.pointerdown(ev); }}
            onMouseMove={(ev) => { this.pointermove(ev); }}
            onTouchMove={(ev) => { this.pointermove(ev); }}
            onMouseUp={(ev) => { this.pointerup(ev); }}
            onTouchEnd={(ev) => { this.pointerup(ev); }}
            onTouchCancel={(ev) => { this.pointerup(ev); }}
            onMouseOver={(ev) => { this.pointerover(ev); }}
            onMouseOut={(ev) => { this.pointerout(ev); }}
        >
            <canvas ref={this.canvasRef}></canvas>
        </div>
    }
}