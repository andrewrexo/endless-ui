export default class GameShader extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
	constructor(game: Phaser.Game) {
		super({
			game,
			renderTarget: true,
			fragShader: `
      precision mediump float;

      uniform sampler2D uMainSampler;
      uniform float uTime;
      varying vec2 outTexCoord;

      void main()
      {
          vec2 uv = outTexCoord;
          vec2 center = vec2(0.5, 0.5);
          float radius = 0.5;
          
          // Calculate distance from current pixel to center
          float dist = distance(uv, center);
          
          // Check if the pixel is inside the circle
          if (dist > radius) {
              // Outside the circle, make it transparent
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else {
              // Inside the circle, use the original color
              gl_FragColor = texture2D(uMainSampler, uv);
          }
      }
      `
		});
	}

	onPreRender() {
		this.set1f('uTime', this.game.loop.time / 1000);
	}
}
