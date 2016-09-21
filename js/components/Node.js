import React from 'react';
import { connect } from 'react-redux';
import Actions from '../Actions';
import Input from './Input'
import Output from './Output'
class Node extends React.Component {
    el: ''
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            pos: {
                x: this.props.pos.x,
                y: this.props.pos.y
            },
            rel: null,
            showRemove: false
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.removeNode = this.removeNode.bind(this);
    }

    componentWillUpdate(props, state) {
        if (!this.state.dragging && state.dragging) {
            document.addEventListener('mousemove', this.onDrag)
            document.addEventListener('mouseup', this.onMouseUp)
        }
        else if (this.state.dragging && !state.dragging) {
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.onMouseUp)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dirty)
            this.props.dispatch(Actions.updateNode(this.props.id,
                nextProps.inputs,
                this.getOutputs(nextProps.inputs),
            this.props.cons))
    }
    onMouseDown(e) {
        if (e.target.tagName != "INPUT" && !e.target.classList.contains("Field") && !e.target.parentElement.classList.contains("Handle")) {
            this.setState({
                dragging: true,
                rel: {
                    x: e.pageX - this.state.pos.x,
                    y: e.pageY - this.state.pos.y
                }
            })
            this.props.dispatch(Actions.startDragging(this.props.id))
        }
    }

    onDrag(e) {
        this.setState({
            pos: {
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y
            }
        })
    }

    onMouseUp(e) {
        this.setState({dragging: false})
        this.props.dispatch(Actions.setPos(this.props.id, this.state.pos))
    }

    removeNode(e) {
        this.props.dispatch(Actions.removeNode(this.props.id, this.props.cons));
    }
    render() {
        return <div
            className="Node"
            id={"Node" + this.props.id}
            style={{position: "absolute", left: this.props.globalOffset.x + this.state.pos.x, top: this.props.globalOffset.y + this.state.pos.y}}
            onMouseDown={this.onMouseDown}
        >

            <svg onMouseDown={this.removeNode} className="removeNodeButton" width="24" height="24" viewBox="0 0 300 300">
                <path d="   M150, 150 L0, 300Z
                            M150, 150 L300, 0Z
                            M150, 150 L0, 0Z
                            M150, 150 L300, 300Z"/>
            </svg>
            <Input
                input={this.show.inputs}
                node={this.props.id}
                cons={this.props.cons.filter(con => {return (con.Input.Node == this.props.id) ? true : false })}
            />
            <div className="Center">
                <div className="NodeName">
                    {this.name}
                </div>
                <div className="Values">
                    {this.center()}
                </div>
            </div>
            <Output
                output={this.show.outputs}
                node={this.props.id}
                cons={this.props.cons.filter(con => {return (con.Output.Node == this.props.id) ? true : false })}
            />
        </div>
    }
}

class ValueNode extends Node {
    get name() { return 'Value'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return { Value: inputs.Value } }
    center() {
        return <input
            type="number"
            onChange={(e) => {
                this.props.dispatch(Actions.updateNode(

                    this.props.id,
                    {Value: (e.target.value.length == 0) ? "0" : e.target.value },
                    {Value: (e.target.value.length == 0) ? "0.0" : parseFloat(e.target.value).toFixed(Math.max(1, (e.target.value.split('.')[1] || []).length))},
                    this.props.cons))}}
                value={parseFloat(this.props.inputs.Value)}
                step="0.01"/>}
    static get input() {return {
        Value: "10.0"
    }}
    get show() {
        return {
            inputs: {},
            outputs: {Value: ''}
        }
    }
    static get output() {return {
        Value: "10.0"
    }}
}

class MathNode extends Node {
    get name() {return 'Math'}
    constructor(props) {
        super(props)
    }
    getFunction (fun) {
        switch (fun) {
            case 'Add':
                return '+';
            case 'Subtract':
                return '-';
            case 'Multiply':
                return '*';
            case 'Divide':
                return '/';
        }
        return 'Error';
    }
    getOutputs(inputs) {
        return {
            Result: `${inputs.Value1}${this.getFunction(inputs.Function)}${inputs.Value2}`
        }
    }
    center() {
        return <select onChange={(e) => {
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Result:`${this.props.inputs.Value1}${this.getFunction(e.target.value)}${this.props.inputs.Value2}` },
                this.props.cons))}}
            value={this.props.inputs.Function}
        >
            <option>Add</option>
            <option>Subtract</option>
            <option>Multiply</option>
            <option>Divide</option>
        </select>
    }

    static get input() {return {
        Function: 'Add',
        Value1: '0.0',
        Value2: '0.0'
    }}

    get show() {
        return {
            inputs: {
                Value1: 0,
                Value2: 0
            },
            outputs: {Result: ''}
        }
    }
    static get output() {return {
        Result: '0.0'
    }}
}

class TrigNode extends Node {
    get name() {return 'Trig'}
    constructor(props) { super(props) }
    getFunction (fun) {
        switch (fun) {
            case 'Sine':
                return 'sin';
            case 'Cosine':
                return 'cos';
            case 'Tangent':
                return 'tan';
        }
        return 'Error';
    }
    getOutputs(inputs) { return { Function: `${this.getFunction(inputs.Function)}(${inputs.Value})` } }
    center() {
        return <select onChange={(e) => {
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Function:`${this.getFunction(e.target.value)}(${this.props.inputs.Value})` },
                this.props.cons))}}
            value={this.props.inputs.Function}
        >
            <option>Sine</option>
            <option>Cosine</option>
            <option>Tangent</option>
        </select>
    }
    static get input() {return {
        Function: 'Sine',
        Value: '0.0'
    }}

    get show() {
        return {
            inputs: {
                Value: ''
            },
            outputs: {
                Function: ''
            }
        }
    }
    static get output() {return {
        Function: 'sin(0.0)'
    }}
}

class PerlinNode extends Node {
    get name() { return 'Perlin'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return 'cnoise(vec3(position.x, position.y, 0.0))' }
    center() {}
    static get input() {return {
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                Value: ''
            }
        }
    }
    static get output() {return {
        Value: 'cnoise(vec3(position.x, 0.0, position.z))'
    }}
}

class PositionNode extends Node {
    get name() { return 'Position'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return PositionNode.output }
    center() {}
    static get input() {return {
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                X: '',
                Y: ''
            }
        }
    }
    static get output() {return {
        X: 'position.x',
        Y: 'position.y'
    }}
}

class OutputNode extends Node {
    get name() { return 'Output'; }
    constructor(props) { super(props); }
    getOutputs(inputs) {
        let Vertex = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`
        let Fragment = `
        precision highp float;

        uniform vec2 resolution;
        uniform int view;
        vec3 mod289(vec3 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x)
        {
          return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
          return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        // Classic Perlin noise
        float cnoise(vec3 P)
        {
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        float scene(vec3 position) {
            return position.y - ${inputs.Height};
        }

        vec3 getNormal(vec3 p) {
            float eps = 0.001;
            return normalize(vec3(
        		scene(vec3(p.x+eps,p.y,p.z))-scene(vec3(p.x-eps,p.y,p.z)),
        		scene(vec3(p.x,p.y+eps,p.z))-scene(vec3(p.x,p.y-eps,p.z)),
        		scene(vec3(p.x,p.y,p.z+eps))-scene(vec3(p.x,p.y,p.z-eps))
        	));
        }

        float raymarch(vec3 ro, vec3 rd) {
            float sceneDist = 1e4;
        	float rayDepth = 0.0; // Ray depth. "start" is usually zero, but for various reasons, you may wish to start the ray further away from the origin.
        	for ( int i = 0; i < 128; i++ ) {

        		sceneDist = scene(ro + rd * rayDepth); // Distance from the point along the ray to the nearest surface point in the scene.
                if (( sceneDist < 0.005 ) || (rayDepth >= 100.0)) {
    		          break;
        		}
        		rayDepth += sceneDist * 0.5;

        	}
            if ( sceneDist >= 0.005 ) rayDepth = 5000.0;
        	else rayDepth += sceneDist;

        	return rayDepth;
        }
        void main(void) {
            vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
        	vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*aspect;
            if (view == 1) {
            	vec3 lookAt = vec3(0.0, 0.0, 0.0);  // This is the point you look towards, or at.
            	vec3 camPos = vec3(20.0, 10.0, 20.0); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.

                // Camera setup.
                vec3 forward = normalize(lookAt-camPos); // Forward vector.

                vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
                vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.

                float FOV = 0.5;

                vec3 ro = camPos;
                vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);

                float dist = raymarch(ro, rd);
                if ( dist >= 5000.0 ) {
            	    gl_FragColor = vec4(vec3(0.05, 0.066, 0.07), 1.0);
            	    return;
            	}
                vec3 sp = ro + rd*dist;
                vec3 surfNormal = getNormal(sp);

                vec3 lp = vec3(15, 10, 15);
            	vec3 ld = lp-sp;

            	float len = length( ld ); // Distance from the light to the surface point.
            	ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
                float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value, which depends on the angle that the light hits the object.
                vec3 Color = vec3(0.4, 0.6, 1.0);
                gl_FragColor = vec4(Color * diffuse, 1.0);
            } else {

            	vec3 forward = vec3(0, -1, 0);
                vec3 up = vec3(0, 0, 1);
                vec3 right = vec3(1, 0, 0);

                vec3 ro = vec3(0,10,0)  + screenCoords.x*right + screenCoords.y*up;
                vec3 rd = forward;

                float dist = raymarch(ro, rd);
                vec3 P = ro + rd * dist;
                P.y += 1.0;
                P.y /= 2.0;
                float f  = fract (P.y * 20.0);
                float df = fwidth(P.y * 25.0);

                float g = smoothstep(df * 0.5, df * 1.0, f);

                float c = g;
                gl_FragColor = vec4(vec3(0.4, 0.6, 1.0) * c * floor(P.y * 20.0) / 20.0, 1.0);
            }
        }`
        this.props.dispatch(Actions.setProgram(Vertex, Fragment))
    }
    center() {}
    static get input() {return {
        Height: 0.0,
        Color: 0.0
    }}
    get show() {
        return {
            inputs: {
                 Height: '',
                 Color: ''
             },
            outputs: {}
        }
    }
    static get output() {return {
    }}
}

export default {
    Value: connect()(ValueNode),
    Math: connect()(MathNode),
    Trig: connect()(TrigNode),
    Position: connect()(PositionNode),
    Perlin: connect()(PerlinNode),
    Output: connect()(OutputNode)
}
