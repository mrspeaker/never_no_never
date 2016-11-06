export default {
  green: {
    frag: `
    precision mediump float;

    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float time;
    uniform vec2 pos;

    void main(void) {

    vec4 texColor = texture2D(uSampler, vTextureCoord);
    float dist = 1.0 - distance(texColor.xz, vec2(0.0, 1.0));
    texColor *= vec4(abs(sin(vTextureCoord.y + time / 30.0)), 1.0, abs(cos(pos.x / 1000.0)), 1.0);
    texColor.z *= sin((pos.y - vTextureCoord.y) + (pos.x - vTextureCoord.x) * 10.0  + time * 10.0) * dist; //vec4(0.0, 1.0, dist, 1.0);
    gl_FragColor = texColor;

    }
    `,
    uniforms: {
      pos: { type: "2f", value: null },
    }
  }
};
