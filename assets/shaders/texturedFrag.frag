    precision mediump float;
    varying vec4 color;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    }