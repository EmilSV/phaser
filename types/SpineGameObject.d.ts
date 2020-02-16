/// <reference path="./spine.d.ts" />
/// <reference path="./phaser.d.ts" />


declare class SpineGameObject extends Phaser.GameObjects.GameObject
{
    constructor(scene: Phaser.Scene, pluginManager: SpinePlugin, x: number, y: number, key?: string, animationName?: string, loop?: boolean);

    alpha: number;

    readonly blendMode: number;

    blue: number;
    bounds: any;
    displayOriginX: number;
    displayOriginY: number;
    drawDebug: boolean;
    green: number;
    plugin: SpinePlugin;
    preMultipliedAlpha: boolean;
    red: number;
    root: spine.Bone;
    scaleX: number;
    scaleY: number;
    skeleton: spine.Skeleton;
    skeletonData: spine.SkeletonData;
    state: spine.AnimationState;
    stateData: spine.AnimationStateData;
    timeScale: number;

    addAnimation(trackIndex: integer, animationName: string, loop?: boolean, delay?: integer): spine.TrackEntry;
    angleBoneToXY(bone: spine.Bone, worldX: number, worldY: number, offset?: number, minAngle?: number, maxAngle?: number): SpineGameObject;
    clearTrack(trackIndex: integer): this;
    clearTracks(): this;
    findAnimation(animationName: string): spine.Animation;
    findBone(boneName: string): spine.Bone;
    findBoneIndex(boneName: string): number;
    findEvent(eventDataName: string): spine.EventData;
    findIkConstraint(constraintName: string): spine.IkConstraintData;
    findPathConstraint(constraintName: string): spine.PathConstraintData;
    findPathConstraintIndex(constraintName: string): number;
    findSkin(skinName: string): spine.Skin;
    findSlot(slotName: string): spine.Slot;
    findSlotIndex(slotName: string): number;
    findTransformConstraint(constraintName: string): spine.TransformConstraintData;
    getAnimationList(): string[];
    getAttachment(slotIndex: integer, attachmentName: string): spine.Attachment;
    getAttachmentByName(slotName: string, attachmentName: string): spine.Attachment;
    getBoneList(): string[];
    getBounds(): any;
    getCurrentAnimation(trackIndex?: integer): spine.Animation;
    getRootBone(): spine.Bone;
    getSkinList(): string[];
    getSlotList(): string[];
    play(animationName: string, loop?: boolean, ignoreIfPlaying?: boolean): this;

    protected preUpdate(time: number, delta: number): void;
    protected preDestroy(): void;

    refresh(): this;
    setAlpha(value?: number): this;
    setAnimation(trackIndex: integer, animationName: string, loop?: boolean, ignoreIfPlaying?: boolean): spine.TrackEntry;
    setAttachment(slotName: string, attachmentName: string): this;
    setBonesToSetupPose(): this;
    setColor(color?: integer, slotName?: string): this;
    setEmptyAnimation(trackIndex: integer, mixDuration?: integer): spine.TrackEntry;
    setMix(fromName: string, toName: string, duration?: number): this;
    setOffset(offsetX?: number, offsetY?: number): this;
    setSize(width: number, height: number, offsetX?: number, offsetY?: number): this;
    setSkeleton(atlasDataKey: string, skeletonJSON: object, animationName?: string, loop?: boolean): this;
    setSkeletonFromJSON(atlasDataKey: string, skeletonJSON: object, animationName?: string, loop?: boolean): this;
    setSkin(newSkin: spine.Skin): this;
    setSkinByName(skinName: string): this;
    setSlotsToSetupPose(): this;
    setToSetupPose(): this;
    updateSize(): this;
    willRender(): boolean;
}

declare interface SpineGameObjectConfig extends Phaser.Types.GameObjects.GameObjectConfig
{
    key?: string;
    animationName?: string;
    loop?: boolean;
    skinName?: string;
    slotName?: string;
    attachmentName?: string;
}


interface SpineGameObject extends
    Phaser.GameObjects.Components.ComputedSize,
    Phaser.GameObjects.Components.Depth,
    Phaser.GameObjects.Components.Flip,
    Phaser.GameObjects.Components.ScrollFactor,
    Phaser.GameObjects.Components.Transform,
    Phaser.GameObjects.Components.Visible
{

}