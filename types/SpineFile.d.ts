/// <reference types="./phaser" />

declare namespace Phaser.Loader.FileTypes
{
    type SpineFileConfig = {
        /**
         * The key of the file. Must be unique within both the Loader and the Texture Manager.
         */
        key: string;
        /**
         * The absolute or relative URL to load the JSON file from. If undefined or `null` it will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json".
         */
        jsonURL?: string | string[];
        /**
         * The absolute or relative URL to load the texture atlas data file from. If undefined or `null` it will be set to `<key>.txt`, i.e. if `key` was "alien" then the URL will be "alien.txt".
         */
        atlasURL?: string;
        /**
         * Do the textures contain pre-multiplied alpha or not?
         */
        preMultipliedAlpha?: boolean;
        /**
         * An XHR Settings configuration object for the json file. Used in replacement of the Loaders default XHR Settings.
         */
        jsonXhrSettings?: Phaser.Types.Loader.XHRSettingsObject;
        /**
         * An XHR Settings configuration object for the atlas data file. Used in replacement of the Loaders default XHR Settings.
         */
        atlasXhrSettings?: Phaser.Types.Loader.XHRSettingsObject;
    };

    class SpineFile extends Phaser.Loader.MultiFile
    {
        constructor(loader: Phaser.Loader.LoaderPlugin, key: string | Phaser.Loader.FileTypes.SpineFileConfig, jsonURL: string | string[], atlasURL: string, preMultipliedAlpha: boolean, jsonXhrSettings: Phaser.Types.Loader.XHRSettingsObject, atlasXhrSettings: Phaser.Types.Loader.XHRSettingsObject);

        addToCache();
    }
}
