/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @author       Felipe Alfonso <@bitnenfer>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../../utils/Class');
var ShaderSourceFS = require('../shaders/ForwardDiffuse-frag.js');
var TextureTintPipeline = require('./TextureTintPipeline');
var WebGLPipeline = require('../WebGLPipeline');

var LIGHT_COUNT = 10;

/**
 * @classdesc
 * ForwardDiffuseLightPipeline implements a forward rendering approach for 2D lights.
 * This pipeline extends TextureTintPipeline so it implements all it's rendering functions
 * and batching system.
 *
 * @class ForwardDiffuseLightPipeline
 * @extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline
 * @memberof Phaser.Renderer.WebGL.Pipelines
 * @constructor
 * @since 3.0.0
 *
 * @param {object} config - The configuration of the pipeline, same as the {@link Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline}. The fragment shader will be replaced with the lighting shader.
 */
var ForwardDiffuseLightPipeline = new Class({

    Extends: TextureTintPipeline,

    initialize:

    function ForwardDiffuseLightPipeline (config)
    {
        LIGHT_COUNT = config.maxLights;

        config.fragShader = ShaderSourceFS.replace('%LIGHT_COUNT%', LIGHT_COUNT.toString());

        TextureTintPipeline.call(this, config);

        /**
         * Inverse rotation matrix for normal map rotations.
         *
         * @name Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#inverseRotationMatrix
         * @type {Float32Array}
         * @private
         * @since 3.16.0
         */
        this.inverseRotationMatrix = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);

        /**
         * Stores the previous number of lights rendered.
         *
         * @name Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#lightCount
         * @type {number}
         * @since 3.25.0
         */
        this.lightCount = 0;
    },

    /**
     * Called every time the pipeline is bound by the renderer.
     * Sets the shader program, vertex buffer and other resources.
     * Should only be called when changing pipeline.
     *
     * @method Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#bind
     * @since 3.25.0
     *
     * @return {this} This WebGLPipeline instance.
     */
    bind: function ()
    {
        WebGLPipeline.prototype.bind.call(this);

        var renderer = this.renderer;
        var program = this.program;

        renderer.setInt1(program, 'uMainSampler', 0);
        renderer.setInt1(program, 'uNormSampler', 1);
        renderer.setFloat2(program, 'uResolution', this.width, this.height);

        return this;
    },

    /**
     * This function sets all the needed resources for each camera pass.
     *
     * @method Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#onRender
     * @since 3.0.0
     *
     * @param {Phaser.Scene} scene - The Scene being rendered.
     * @param {Phaser.Cameras.Scene2D.Camera} camera - The Scene Camera being rendered with.
     *
     * @return {this} This WebGLPipeline instance.
     */
    onRender: function (scene, camera)
    {
        this.active = false;

        var lightManager = scene.sys.lights;

        if (!lightManager || lightManager.lights.length <= 0 || !lightManager.active)
        {
            //  Passthru
            return this;
        }

        var lights = lightManager.cull(camera);
        var lightCount = Math.min(lights.length, LIGHT_COUNT);

        if (lightCount === 0)
        {
            return this;
        }

        this.active = true;

        var renderer = this.renderer;
        var program = this.program;
        var cameraMatrix = camera.matrix;
        var point = {x: 0, y: 0};
        var height = renderer.height;
        var i;

        if (lightCount !== this.lightCount)
        {
            for (i = 0; i < LIGHT_COUNT; i++)
            {
                //  Reset lights
                renderer.setFloat1(program, 'uLights[' + i + '].radius', 0);
            }

            this.lightCount = lightCount;
        }

        if (camera.dirty)
        {
            renderer.setFloat4(program, 'uCamera', camera.x, camera.y, camera.rotation, camera.zoom);
        }

        //  TODO - Only if dirty! and cache the location
        renderer.setFloat3(program, 'uAmbientLightColor', lightManager.ambientColor.r, lightManager.ambientColor.g, lightManager.ambientColor.b);

        for (i = 0; i < lightCount; i++)
        {
            var light = lights[i];

            if (light.dirty)
            {
                var lightName = 'uLights[' + i + '].';

                cameraMatrix.transformPoint(light.x, light.y, point);

                //  TODO - Cache the uniform locations!!!
                renderer.setFloat2(program, lightName + 'position', point.x - (camera.scrollX * light.scrollFactorX * camera.zoom), height - (point.y - (camera.scrollY * light.scrollFactorY) * camera.zoom));
                renderer.setFloat3(program, lightName + 'color', light.r, light.g, light.b);
                renderer.setFloat1(program, lightName + 'intensity', light.intensity);
                renderer.setFloat1(program, lightName + 'radius', light.radius);

                light.dirty = false;
            }
        }

        this.currentNormalMapRotation = null;

        return this;
    },

    /**
     * Rotates the normal map vectors inversely by the given angle.
     * Only works in 2D space.
     *
     * @method Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#setNormalMapRotation
     * @since 3.16.0
     *
     * @param {number} rotation - The angle of rotation in radians.
     */
    setNormalMapRotation: function (rotation)
    {
        if (rotation !== this.currentNormalMapRotation || this.vertexCount === 0)
        {
            if (this.vertexCount > 0)
            {
                this.flush();
            }

            var inverseRotationMatrix = this.inverseRotationMatrix;

            if (rotation)
            {
                var rot = -rotation;
                var c = Math.cos(rot);
                var s = Math.sin(rot);

                inverseRotationMatrix[1] = s;
                inverseRotationMatrix[3] = -s;
                inverseRotationMatrix[0] = inverseRotationMatrix[4] = c;
            }
            else
            {
                inverseRotationMatrix[0] = inverseRotationMatrix[4] = 1;
                inverseRotationMatrix[1] = inverseRotationMatrix[3] = 0;
            }

            this.renderer.setMatrix3(this.program, 'uInverseRotationMatrix', false, inverseRotationMatrix);

            this.currentNormalMapRotation = rotation;
        }
    },

    /**
     * Generic function for batching a textured quad with a normal map.
     *
     * @method Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#batchTexture
     * @since 3.0.0
     *
     * @param {Phaser.GameObjects.GameObject} gameObject - Source GameObject
     * @param {WebGLTexture} texture - Raw WebGLTexture associated with the quad
     * @param {integer} textureWidth - Real texture width
     * @param {integer} textureHeight - Real texture height
     * @param {number} srcX - X coordinate of the quad
     * @param {number} srcY - Y coordinate of the quad
     * @param {number} srcWidth - Width of the quad
     * @param {number} srcHeight - Height of the quad
     * @param {number} scaleX - X component of scale
     * @param {number} scaleY - Y component of scale
     * @param {number} rotation - Rotation of the quad
     * @param {boolean} flipX - Indicates if the quad is horizontally flipped
     * @param {boolean} flipY - Indicates if the quad is vertically flipped
     * @param {number} scrollFactorX - By which factor is the quad affected by the camera horizontal scroll
     * @param {number} scrollFactorY - By which factor is the quad effected by the camera vertical scroll
     * @param {number} displayOriginX - Horizontal origin in pixels
     * @param {number} displayOriginY - Vertical origin in pixels
     * @param {number} frameX - X coordinate of the texture frame
     * @param {number} frameY - Y coordinate of the texture frame
     * @param {number} frameWidth - Width of the texture frame
     * @param {number} frameHeight - Height of the texture frame
     * @param {integer} tintTL - Tint for top left
     * @param {integer} tintTR - Tint for top right
     * @param {integer} tintBL - Tint for bottom left
     * @param {integer} tintBR - Tint for bottom right
     * @param {number} tintEffect - The tint effect (0 for additive, 1 for replacement)
     * @param {number} uOffset - Horizontal offset on texture coordinate
     * @param {number} vOffset - Vertical offset on texture coordinate
     * @param {Phaser.Cameras.Scene2D.Camera} camera - Current used camera
     * @param {Phaser.GameObjects.Components.TransformMatrix} parentTransformMatrix - Parent container
     * @param {boolean} [skipFlip=false] - Skip the renderTexture check.
     */
    batchTexture: function (
        gameObject,
        texture,
        textureWidth, textureHeight,
        srcX, srcY,
        srcWidth, srcHeight,
        scaleX, scaleY,
        rotation,
        flipX, flipY,
        scrollFactorX, scrollFactorY,
        displayOriginX, displayOriginY,
        frameX, frameY, frameWidth, frameHeight,
        tintTL, tintTR, tintBL, tintBR, tintEffect,
        uOffset, vOffset,
        camera,
        parentTransformMatrix,
        skipFlip)
    {
        var normalTexture;

        if (gameObject.displayTexture)
        {
            normalTexture = gameObject.displayTexture.dataSource[gameObject.displayFrame.sourceIndex];
        }
        else if (gameObject.texture)
        {
            normalTexture = gameObject.texture.dataSource[gameObject.frame.sourceIndex];
        }
        else if (gameObject.tileset)
        {
            if (Array.isArray(gameObject.tileset))
            {
                normalTexture = gameObject.tileset[0].image.dataSource[0];
            }
            else
            {
                normalTexture = gameObject.tileset.image.dataSource[0];
            }
        }

        if (normalTexture)
        {
            TextureTintPipeline.prototype.batchTexture.call(this, gameObject, texture, textureWidth, textureHeight, srcX, srcY, srcWidth, srcHeight, scaleX, scaleY, rotation, flipX, flipY, scrollFactorX, scrollFactorY, displayOriginX, displayOriginY, frameX, frameY, frameWidth, frameHeight, tintTL, tintTR, tintBL, tintBR, tintEffect, uOffset, vOffset, camera, parentTransformMatrix, skipFlip, true);

            this.renderer.setNormalMap(normalTexture.glTexture);

            this.setNormalMapRotation(rotation);
        }
    },

    /**
     * Takes a Sprite Game Object, or any object that extends it, which has a normal texture and adds it to the batch.
     *
     * @method Phaser.Renderer.WebGL.Pipelines.ForwardDiffuseLightPipeline#batchSprite
     * @since 3.0.0
     *
     * @param {Phaser.GameObjects.Sprite} sprite - The texture-based Game Object to add to the batch.
     * @param {Phaser.Cameras.Scene2D.Camera} camera - The Camera to use for the rendering transform.
     * @param {Phaser.GameObjects.Components.TransformMatrix} parentTransformMatrix - The transform matrix of the parent container, if set.
     */
    batchSprite: function (sprite, camera, parentTransformMatrix)
    {
        if (!this.active)
        {
            return;
        }

        var normalTexture = sprite.texture.dataSource[sprite.frame.sourceIndex];

        if (normalTexture)
        {
            TextureTintPipeline.prototype.batchSprite.call(this, sprite, camera, parentTransformMatrix, true);

            this.renderer.setNormalMap(normalTexture.glTexture);

            this.setNormalMapRotation(sprite.rotation);
        }
    }

});

ForwardDiffuseLightPipeline.LIGHT_COUNT = LIGHT_COUNT;

module.exports = ForwardDiffuseLightPipeline;
