"use client";

import { useEffect, useRef } from "react";
import {
  vertexShader,
  sceneFragment,
  brightFragment,
  blurFragment,
  compositeFragment,
} from "@/lib/shaders";

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null!;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: string,
  fs: string,
): WebGLProgram {
  const vShader = compileShader(gl, gl.VERTEX_SHADER, vs);
  const fShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram()!;
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null!;
  }
  return program;
}

function createTexture(
  gl: WebGLRenderingContext,
  w: number,
  h: number,
): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    w,
    h,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!ctx) return;
    const gl: WebGLRenderingContext = ctx;

    const sceneProg = createProgram(gl, vertexShader, sceneFragment);
    const brightProg = createProgram(gl, vertexShader, brightFragment);
    const blurProg = createProgram(gl, vertexShader, blurFragment);
    const compositeProg = createProgram(gl, vertexShader, compositeFragment);

    const verts = new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
    ]);
    const idx = new Uint16Array([0, 1, 2, 2, 1, 3]);

    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const ibo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    function setupAttribs(prog: WebGLProgram) {
      const pos = gl.getAttribLocation(prog, "a_position");
      const uv = gl.getAttribLocation(prog, "a_uv");
      gl.enableVertexAttribArray(pos);
      gl.enableVertexAttribArray(uv);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8);
    }

    function unif1f(prog: WebGLProgram, name: string, v: number) {
      const loc = gl.getUniformLocation(prog, name);
      if (loc) gl.uniform1f(loc, v);
    }

    function unif2f(prog: WebGLProgram, name: string, x: number, y: number) {
      const loc = gl.getUniformLocation(prog, name);
      if (loc) gl.uniform2f(loc, x, y);
    }

    function bindTex(
      prog: WebGLProgram,
      name: string,
      unit: number,
      tex: WebGLTexture,
    ) {
      const loc = gl.getUniformLocation(prog, name);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (loc) gl.uniform1i(loc, unit);
    }

    function use(prog: WebGLProgram) {
      gl.useProgram(prog);
      setupAttribs(prog);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }

    function quad() {
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    let w = Math.round(window.innerWidth * window.devicePixelRatio);
    let h = Math.round(window.innerHeight * window.devicePixelRatio);
    let texScene: WebGLTexture;
    let texBloom: WebGLTexture;
    let texBlur: WebGLTexture;
    let fboScene: WebGLFramebuffer;
    let fboBloom: WebGLFramebuffer;
    let fboBlur: WebGLFramebuffer;

    function makeFBO(tex: WebGLTexture): WebGLFramebuffer {
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex,
        0,
      );
      return fbo;
    }

    function resize() {
      w = Math.round(window.innerWidth * window.devicePixelRatio);
      h = Math.round(window.innerHeight * window.devicePixelRatio);
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, w, h);

      if (texScene) {
        gl.deleteTexture(texScene);
        gl.deleteTexture(texBloom);
        gl.deleteTexture(texBlur);
        gl.deleteFramebuffer(fboScene);
        gl.deleteFramebuffer(fboBloom);
        gl.deleteFramebuffer(fboBlur);
      }

      texScene = createTexture(gl, w, h);
      texBloom = createTexture(gl, w, h);
      texBlur = createTexture(gl, w, h);

      fboScene = makeFBO(texScene);
      fboBloom = makeFBO(texBloom);
      fboBlur = makeFBO(texBlur);

      starScale = Math.max(1.0, 1920 / window.innerWidth);
      const aspect = window.innerWidth / window.innerHeight;
      const mobileFactor = Math.min(1.0, window.innerWidth / 400);
      densityScale = Math.sqrt(aspect) * mobileFactor;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    let raf = 0;
    let starScale = 1.0;
    let densityScale = 1.0;

    function loop(time: number) {
      // Pass 1: Scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboScene);
      use(sceneProg);
      unif2f(sceneProg, "u_resolution", w, h);
      unif1f(sceneProg, "u_time", time * 0.001);
      unif1f(sceneProg, "u_starDensity", 0.6 * densityScale);
      unif1f(sceneProg, "u_starSize", 6.0 * starScale);
      quad();

      // Pass 2: Bright extract
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboBloom);
      use(brightProg);
      bindTex(brightProg, "u_scene", 0, texScene);
      unif1f(brightProg, "u_threshold", 0.15);
      quad();

      // Pass 3: Blur H
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboBlur);
      use(blurProg);
      bindTex(blurProg, "u_texture", 0, texBloom);
      unif2f(blurProg, "u_offset", 1.0, 0.0);
      unif2f(blurProg, "u_resolution", w, h);
      unif1f(blurProg, "u_blurSpread", 1.5);
      quad();

      // Pass 4: Blur V
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboBloom);
      use(blurProg);
      bindTex(blurProg, "u_texture", 0, texBlur);
      unif2f(blurProg, "u_offset", 0.0, 1.0);
      unif2f(blurProg, "u_resolution", w, h);
      unif1f(blurProg, "u_blurSpread", 1.5);
      quad();

      // Pass 5: Blur H (iter 2)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboBlur);
      use(blurProg);
      bindTex(blurProg, "u_texture", 0, texBloom);
      unif2f(blurProg, "u_offset", 1.0, 0.0);
      unif2f(blurProg, "u_resolution", w, h);
      unif1f(blurProg, "u_blurSpread", 1.5);
      quad();

      // Pass 6: Blur V (iter 2)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboBloom);
      use(blurProg);
      bindTex(blurProg, "u_texture", 0, texBlur);
      unif2f(blurProg, "u_offset", 0.0, 1.0);
      unif2f(blurProg, "u_resolution", w, h);
      unif1f(blurProg, "u_blurSpread", 1.5);
      quad();

      // Pass 7: Composite
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      use(compositeProg);
      bindTex(compositeProg, "u_scene", 0, texScene);
      bindTex(compositeProg, "u_bloom", 1, texBloom);
      unif1f(compositeProg, "u_intensity", 1.5 / Math.sqrt(starScale));
      quad();

      raf = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteTexture(texScene);
      gl.deleteTexture(texBloom);
      gl.deleteTexture(texBlur);
      gl.deleteFramebuffer(fboScene);
      gl.deleteFramebuffer(fboBloom);
      gl.deleteFramebuffer(fboBlur);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteProgram(sceneProg);
      gl.deleteProgram(brightProg);
      gl.deleteProgram(blurProg);
      gl.deleteProgram(compositeProg);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -10 }}
    />
  );
}
