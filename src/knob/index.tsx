import React from 'react';
import './style.css';

interface Props {
    size?:number,
    min?:number,
    max?:number,
    degrees?:number,
    value?:number,
    numTicks?:number,
    label?:string,
    precision?:number,
    color:boolean,
    onChange:(newValue:number) => void;
};

interface State {
    deg:number;
}

const defaultProps = {
    size: 150,
    min: 10,
    max: 30,
    numTicks: 0,
    degrees: 270,
    value: 0,
};

export class Knob extends React.Component<Props, State> {

    private fullAngle:number;
    private startAngle:number;
    private endAngle:number;
    private currentDeg:number;

    private size:number;
    private min:number;
    private max:number;    

    constructor(props:Props) {
        super(props);

        const degrees = props.degrees || defaultProps.degrees;
        this.size = props.size || defaultProps.size;
        this.min = (props.min !== undefined) ? props.min : defaultProps.min;
        this.max = (props.max !== undefined) ? props.max : defaultProps.max;
        const value = (props.value !== undefined) ? props.value : defaultProps.value; 

        this.fullAngle = degrees;
        this.startAngle = (360 - degrees) / 2;
        this.endAngle = this.startAngle + degrees;
        this.currentDeg = Math.floor(
            this.convertRange(
                this.min,
                this.max,
                this.startAngle,
                this.endAngle,
                value,
            )
        );
        this.state = { deg: this.currentDeg };
    }

    public startDrag = (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        const knob = (e.target as HTMLDivElement).getBoundingClientRect();
        const pts = {
            x: knob.left + knob.width / 2,
            y: knob.top + knob.height / 2
        };
        const moveHandler = (e:MouseEvent) => {
            this.currentDeg = this.getDeg(e.clientX, e.clientY, pts);
            if (this.currentDeg === this.startAngle) this.currentDeg--;
            let newValue = this.convertRange(
                this.startAngle,
                this.endAngle,
                this.min,
                this.max,
                this.currentDeg
            );
            const precision = this.props.precision || 0;
            newValue = Math.round(newValue * Math.pow(10, precision)) / Math.pow(10, precision);
            this.setState({ deg: this.currentDeg });
            this.props.onChange(newValue);
        };
        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", (e) => {
            document.removeEventListener("mousemove", moveHandler);
        });
    };

    public getDeg = (cX:number, cY:number, pts:any) => {
        const x = cX - pts.x;
        const y = cY - pts.y;
        let deg = Math.atan(y / x) * 180 / Math.PI;
        if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
            deg += 90;
        } else {
            deg += 270;
        }
        let finalDeg = Math.min(Math.max(this.startAngle, deg), this.endAngle);
        return finalDeg;
    };

    public convertRange = (oldMin:number, oldMax:number, newMin:number, newMax:number, oldValue:number) => {
        return (oldValue - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
    };

    public renderTicks = () => {
        if (!this.props.numTicks) {
            return null;
        }
        let ticks = [];
        const incr = this.fullAngle / this.props.numTicks;

        const margin = this.size * 0.2; 
        const size = margin + this.size / 2;
        for (let deg = this.startAngle; deg <= this.endAngle; deg += incr) {
            const tick = {
            deg: deg,
            tickStyle: {
                height: size * 1.2,
                left: size - 1,
                top: size + 2,
                transform: "rotate(" + deg + "deg)",
                transformOrigin: "top"
            }
            };
            ticks.push(tick);
        }
        return ticks;
    };

    public dcpy = (o:any) => {
        return JSON.parse(JSON.stringify(o));
    };

    public render() {
        const kStyle = {
            width: this.props.size + 'px',
            height: this.props.size + 'px',
        };
        const oStyle = {
            width: this.props.size + 'px',
            height: this.props.size + 'px',
            margin: this.size * 0.15 + 'px',
            backgroundImage: 'initial',
        }
        if (this.props.color) {
            oStyle.backgroundImage = `radial-gradient(100% 70%,hsl(210, ${this.currentDeg}%, ${this.currentDeg / 5}%),hsl(${Math.random() * 100}, 20%, ${this.currentDeg / 36}%))`;
        }
        const iStyle = {
            width: this.props.size + 'px',
            height: this.props.size + 'px',
            transform: `rotate(${this.state.deg}deg)`,
        }

        return (
            <div className="knob" style={kStyle}>
            <div className="ticks">
                {this.props.numTicks
                ? this.renderTicks()?.map((tick, i) => (
                    <div
                        key={i}
                        className={
                        "tick" + (tick.deg <= this.currentDeg ? " active" : "")
                        }
                        style={tick.tickStyle}
                    />
                    ))
                : null}
            </div>
            <div className="knob outer" style={oStyle} onMouseDown={this.startDrag}>
                <div className="knob inner" style={iStyle}>
                <div className="grip" />
                </div>
            </div>
            <div style={{
                position: 'absolute',
                bottom: '-95%',
                left: '50%',
                marginLeft: this.size * 0.17 + 'px',
                transform: 'translateX(-50%)',
                color: '#83aed9',
                fontSize: '14px',
                fontWeight: 'bold',
                userSelect: 'none',
            }}>{this.props.label}</div>
            </div>
        );
    }
}
