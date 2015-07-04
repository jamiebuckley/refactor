/**
 * Created by Jamie on 02-Jul-15.
 */


import FileLoader = require("graphics/filetypes/fileLoader");
import ObjLoader = require("graphics/filetypes/objloader");
///<reference path="../../lib/gl-matrix.d.ts" />

export class Mesh {
    ctx:WebGLRenderingContext;
    vertexBuffer:WebGLBuffer;
    colorBuffer:WebGLBuffer;
    indexBuffer:WebGLBuffer;
    normalBuffer:WebGLBuffer;
    texturePositionBuffer:WebGLBuffer;
    numIndices:number;


    constructor(ctx:WebGLRenderingContext){
        this.ctx = ctx;
        this.vertexBuffer = ctx.createBuffer();
        this.colorBuffer = ctx.createBuffer();
        this.indexBuffer = ctx.createBuffer();
        this.normalBuffer = ctx.createBuffer();
        this.texturePositionBuffer = ctx.createBuffer();
    }

    LoadVerticesFromFile(file:string){
        var modelData = new ObjLoader.ObjLoader().readFile(file);
        this.LoadVertices(modelData.vertices, modelData.indices, modelData.colors, modelData.normals, modelData.texCoords);
    }

    LoadVertices(vertices:number[], indices:number[], colors:number[], normals:number[], texCoords:number[]){
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertexBuffer);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertices), this.ctx.STATIC_DRAW);

        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.ctx.STATIC_DRAW);

        if(colors != undefined) {
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBuffer);
            this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(colors), this.ctx.STATIC_DRAW);
        }

        if(normals != undefined) {
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.normalBuffer);
            this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(normals), this.ctx.STATIC_DRAW);
        }

        if(texCoords != undefined) {
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.texturePositionBuffer);
            this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(texCoords), this.ctx.STATIC_DRAW);
        }

        this.numIndices = indices.length;
    }

    MakeSquare():void{
        var vertices = [
            // Front face
            -1.0, -1.0,  1.0, //bottom left
            1.0, -1.0,  1.0, //bottom right
            1.0,  1.0,  1.0, //top right
            -1.0,  1.0,  1.0]; //top left

        var indices = [
            0, 1, 2, 0, 2, 3];

        var colors = [
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
        ];

        var normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];

        var texCoords = [
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
        ]

        this.LoadVertices(vertices, indices, colors, normals, texCoords);
    }

    MakeCube():void{
        var vertices = [
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];

        var colors4 = [
            1.0, 0.0, 0.0,
            0.0, 0.0, 1.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 1.0,
            1.0, 1.0, 0.0,
            0.5, 0.5,0.5,
        ];

        var colors = [];
        for(var i = 0; i < 6; i++){
            for(var c = 0; c < 4; c++){
                var x = colors4.slice(i*3, i*3+3);
                colors = colors.concat(x);
            }
        }

        var indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ]

        this.LoadVertices(vertices, indices, colors, null, null);
    }

    Draw(shader:any, modelMatrix:mat4):void{
        //Need to have texture//colours bound at this point
        //if this.material -> this.material.bind
        //add something to notify if shader.attributes["name"] doesn't exist
        //console.log("drawing");
        shader.PassMatrix("uMVMatrix", modelMatrix);

        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertexBuffer);
        this.ctx.vertexAttribPointer(shader.attributes["aVertexPosition"], 3, this.ctx.FLOAT, false, 0, 0);

        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBuffer);
        this.ctx.vertexAttribPointer(shader.attributes["aVertexColour"], 3, this.ctx.FLOAT, false, 0, 0);

        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.normalBuffer);
        this.ctx.vertexAttribPointer(shader.attributes["aVertexNormal"], 3, this.ctx.FLOAT, false, 0, 0);

        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.ctx.drawElements(this.ctx.TRIANGLES, this.numIndices, this.ctx.UNSIGNED_SHORT, 0);
    }

    getBoundingCube(vertices:number[]): BoundingCube{
        var boundingCube = new BoundingCube();

        for(var i = 0; i < vertices.length; i+=3) {
            var currentVertex = {
                x: vertices[i * 3],
                y: vertices[i * 3 + 1],
                z: vertices[i * 3 + 2]
            };

            if(currentVertex.x < boundingCube.lowestX) boundingCube.lowestX = currentVertex.x;
            if(currentVertex.x > boundingCube.highestX) boundingCube.highestX = currentVertex.x;

            if(currentVertex.y < boundingCube.lowestY) boundingCube.lowestY = currentVertex.y;
            if(currentVertex.y > boundingCube.highestY) boundingCube.highestY = currentVertex.y;

            if(currentVertex.z < boundingCube.lowestZ) boundingCube.lowestZ = currentVertex.z;
            if(currentVertex.z > boundingCube.highestZ) boundingCube.highestZ = currentVertex.z;
        };

        return boundingCube;
    }
}

export class BoundingCube {
    lowestX:number = 0;
    highestX:number = 0;

    lowestY:number = 0;
    highestY:number = 0;

    lowestZ:number = 0;
    highestZ:number = 0;
}