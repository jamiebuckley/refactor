/**
 * Created by Jamie on 04-Jul-15.
 */
import Shaders = require("graphics/shaders");
import Mesh = require("graphics/mesh");
import Texture = require("graphics/texture");
import Assets = require("graphics/assets");

export class Graphics {
    ctx:WebGLRenderingContext;
    viewportWidth:number;
    viewportHeight:number;

    pMatrix:Float32Array;
    mvMatrix:Float32Array;

    _lightDir:number[];
    _shaders:Shaders.Shader[];

    _meshAssets:Assets.Asset[];
    _textureAssets:Assets.Asset[];

    meshes:Mesh.Mesh[];
    textures:Texture.Texture[];
    currentShader:Shaders.Shader;

    assetLoader:Assets.AssetLoader;


    constructor(canvas) {
        this.ctx = canvas.getContext("webgl");
        this.viewportWidth = canvas.width;
        this.viewportHeight = canvas.height;
        if (!this.ctx) alert("Error initializing WebGL context");

        this._shaders = [];
        this._meshAssets = [];
        this.meshes = [];
        this.textures = [];

        this._lightDir = [0.0, 1.0, 0.0];

        this.ctx.clearColor(0.0, 0.2, 0.0, 1.0);
        this.ctx.enable(this.ctx.DEPTH_TEST);

        this.pMatrix = mat4.create();
        this.mvMatrix = mat4.create();
    }

    setBackground(r, g, b) {
        this.ctx.clearColor(r, g, b, 1.0);
    }

    SetAssets(assetLoader) {
        this.assetLoader = assetLoader;

        this._meshAssets = this.assetLoader.getByType("mesh");
        for (var i = 0; i < this._meshAssets.length; i++) {
            var meshAsset = this._meshAssets[i];
            this.meshes[meshAsset.name] = (this.CreateMeshFromAsset(meshAsset));
        }
        this.meshes["cube"] = this.CreateCube();
        this.meshes["square"] = this.CreateSquare();

        this._textureAssets = assetLoader.getByType("texture");
        for (var i = 0; i < this._textureAssets.length; i++) {
            var textureAsset = this._textureAssets[i];
            this.textures[textureAsset.name] = new Texture.Texture(this.ctx, textureAsset.data);
        }
    }

    GetMesh(meshName) {
        var mesh = this.meshes[meshName];
        if (mesh == null) throw new Error("Attempted to access mesh '" + meshName + "', but this mesh could not be found");
        return mesh;
    }

    GetTexture(textureName) {
        var texture = this.textures[textureName];
        if (texture == null) throw new Error("Attempted to access texture '" + textureName + "', but this texture could not be found");
        return texture;
    }

    LoadShader(shaderName, vShaderName, fShaderName, attributes, uniforms) {
        var vShader = this.assetLoader.getAsset(vShaderName);
        var fShader = this.assetLoader.getAsset(fShaderName);
        var mainShader = new Shaders.Shader(this.ctx, vShader.data, fShader.data);
        mainShader.LoadAttributes(attributes);
        mainShader.LoadUniforms(uniforms);
        this._shaders[shaderName] = mainShader;
    }

    UseShader(shaderName) {
        this._shaders[shaderName].Activate();
        this.currentShader = this._shaders[shaderName];
    }

    GetShader(shaderName) {
        return this._shaders[shaderName];
    }

    /* Helper for creating a cube */
    CreateCube() {
        var mesh = new Mesh.Mesh(this.ctx);
        mesh.MakeCube();
        return mesh;
    }

    CreateSquare() {
        var mesh = new Mesh.Mesh(this.ctx);
        mesh.MakeSquare();
        return mesh;
    }

    CreateMeshFromAsset(asset) {
        var mesh = new Mesh.Mesh(this.ctx);
        mesh.LoadVerticesFromFile(asset.data);
        return mesh;
    }

    SetLightDir(vec) {
        this._lightDir = vec;
    }

    Draw(camera, scenegraph) {
        this.ctx.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        this.ctx.clear(this.ctx.DEPTH_BUFFER_BIT | this.ctx.COLOR_BUFFER_BIT);
        mat4.perspective(this.pMatrix, 45, this.viewportWidth / this.viewportHeight, 0.1, 100);

        /* Mesh position */
        this.currentShader.PassMatrix("uPMatrix", this.pMatrix);
        this.currentShader.PassVec3("lightDirection", this._lightDir);

        if (!camera) throw new Error("Can't draw if a camera isn't set");
        // console.log(camera.GetMatrix());
        var x = camera.GetMatrix();
        this.currentShader.PassMatrix("uCMatrix", camera.GetMatrix());

        for (var i = 0; i < scenegraph.graph.length; i++) {
            var entity = scenegraph.graph[i];

            var modelMatrix = entity.getMatrix();
            if (entity.texture != null) {
                entity.texture.Bind();
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, entity.mesh.texturePositionBuffer);
                this.ctx.vertexAttribPointer(this.currentShader.attributes["aTexCoords"], 2, this.ctx.FLOAT, false, 0, 0);
            }
            entity.mesh.Draw(this.currentShader, modelMatrix);
        }
    }
}