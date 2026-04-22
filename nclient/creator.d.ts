/** Cocos Creator 2.4.15 TypeScript Declarations */

declare namespace cc {
    // Node
    class Node {
        name: string;
        active: boolean;
        x: number;
        y: number;
        width: number;
        height: number;
        anchorX: number;
        anchorY: number;
        opacity: number;
        color: Color;
        scale: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        rotationX: number;
        rotationY: number;
        skewX: number;
        skewY: number;
        parent: Node | null;
        children: Node[];
        zIndex: number;
        uuid: string;
        anchorPoint: Vec2;
        position: Vec2;
        _components: Component[];

        constructor(name?: string);

        addChild(child: Node): void;
        removeChild(child: Node, cleanup?: boolean): void;
        removeFromParent(cleanup?: boolean): void;
        getChildByName(name: string): Node | null;
        getChildByUuid(uuid: string): Node | null;
        getChildAtIndex(index: number): Node;
        getChildren(): Node[];
        getSiblingIndex(): number;
        setSiblingIndex(index: number): void;
        cleanup(): void;
        destroy(): void;
        isValid(): boolean;
        getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponent(type: string | Function): Component | null;
        getComponents(type?: string | Function): Component[];
        addComponent<T extends Component>(type: new (...args: any[]) => T): T;
        addComponent(type: string | Function): Component;
        removeComponent(component: Component): void;
        on(type: string, callback: Function, target?: any, useCapture?: boolean): void;
        off(type: string, callback?: Function, target?: any, useCapture?: boolean): void;
        emit(type: string, ...args: any[]): void;
        dispatchEvent(event: Event): void;
        runAction(action: Action): void;
        stopAllActions(): void;
        stopAction(action: Action): void;
        stopActionByTag(tag: number): void;
        getActionByTag(tag: number): Action | null;
        getNumberOfRunningActions(): number;
        schedule(callback: Function, interval?: number, repeat?: number, delay?: number): void;
        scheduleOnce(callback: Function, delay?: number): void;
        unschedule(callback: Function): void;
        unscheduleAllCallbacks(): void;
        convertToNodeSpace(worldPoint: Vec2): Vec2;
        convertToWorldSpace(nodePoint: Vec2): Vec2;
        convertToNodeSpaceAR(worldPoint: Vec2): Vec2;
        convertToWorldSpaceAR(nodePoint: Vec2): Vec2;
        getBoundingBox(): Rect;
        getBoundingBoxToWorld(): Rect;
        setContentSize(size: Size | number, height?: number): void;
        setPosition(pos: Vec2 | number, y?: number): void;
        setAnchorPoint(point: Vec2 | number, y?: number): void;
        getComponentInChildren<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentsInChildren(type?: string | Function): Component[];
    }

    // Component
    class Component {
        node: Node;
        name: string;
        enabled: boolean;
        enabledInHierarchy: boolean;
        isValid: boolean;
        uuid: string;

        onLoad(): void;
        start(): void;
        update(dt: number): void;
        lateUpdate(dt: number): void;
        onDestroy(): void;
        onEnable(): void;
        onDisable(): void;
        onDestroy(): void;
        getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponent(type: string | Function): Component | null;
        getComponents(type?: string | Function): Component[];
        getComponentInChildren<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentsInChildren(type?: string | Function): Component[];
        schedule(callback: Function, interval?: number, repeat?: number, delay?: number): void;
        scheduleOnce(callback: Function, delay?: number): void;
        unschedule(callback: Function): void;
        unscheduleAllCallbacks(): void;
        destroy(): boolean;
    }

    // Scene
    class Scene extends Node {
        autoReleaseAssets: boolean;
        dependentAssets: any[];

        constructor(name?: string);
    }

    // Director
    namespace director {
        function loadScene(sceneName: string, onLaunched?: Function): void;
        function loadScene(sceneName: string, onProgress?: (completedCount: number, totalCount: number, item: any) => void, onLaunched?: Function): void;
        function preloadScene(sceneName: string, callback?: Function): void;
        function preloadScene(sceneName: string, onProgress?: (completedCount: number, totalCount: number, item: any) => void, callback?: Function): void;
        function getScene(): Scene | null;
        function getRunningScene(): Scene | null;
        function pause(): void;
        function resume(): void;
        function getDeltaTime(): number;
        function getTotalTime(): number;
        function getCurrentTime(): number;
        function getAnimationInterval(): number;
        function setAnimationInterval(value: number): void;
    }

    // Camera
    class Camera extends Component {
        zoomRatio: number;
        backgroundColor: Color;

        getWorldToScreenPoint(worldPoint: Vec2): Vec2;
        getScreenToWorldPoint(screenPoint: Vec2): Vec2;
        getCameraToWorldPoint(point: Vec2): Vec2;
        containsNode(node: Node): boolean;
        render(camera: Camera): void;
        static findCamera(node: Node): Camera | null;
    }

    // Canvas
    class Canvas extends Component {
        designResolution: Size;
        fitWidth: boolean;
        fitHeight: boolean;
    }

    // Vec2
    class Vec2 {
        x: number;
        y: number;
        static ZERO: Vec2;
        static ONE: Vec2;
        static UNIT_X: Vec2;
        static UNIT_Y: Vec2;
        static ANCHOR_TOP: Vec2;
        static ANCHOR_BOTTOM: Vec2;
        static ANCHOR_LEFT: Vec2;
        static ANCHOR_RIGHT: Vec2;
        static ANCHOR_CENTER: Vec2;
        static ANCHOR_TOP_LEFT: Vec2;
        static ANCHOR_TOP_RIGHT: Vec2;
        static ANCHOR_BOTTOM_LEFT: Vec2;
        static ANCHOR_BOTTOM_RIGHT: Vec2;

        constructor(x?: number, y?: number);
        clone(): Vec2;
        set(x: number, y: number): Vec2;
        equals(other: Vec2): boolean;
        fuzzyEquals(other: Vec2, variance: number): boolean;
        toString(): string;
        lerp(to: Vec2, ratio: number, out?: Vec2): Vec2;
        add(other: Vec2, out?: Vec2): Vec2;
        sub(other: Vec2, out?: Vec2): Vec2;
        mul(other: Vec2, out?: Vec2): Vec2;
        div(other: Vec2, out?: Vec2): Vec2;
        negate(out?: Vec2): Vec2;
        dot(vector: Vec2): number;
        cross(vector: Vec2): number;
        mag(): number;
        magSqr(): number;
        normalize(out?: Vec2): Vec2;
        normalizeSelf(): Vec2;
        angle(vector: Vec2): number;
        signAngle(vector: Vec2): number;
        rotate(radians: number, out?: Vec2): Vec2;
        rotateSelf(radians: number): Vec2;
        project(vector: Vec2): Vec2;
        transformMat4(matrix: Mat4): Vec2;
        static str(a: Vec2): string;
        static add(out: Vec2, a: Vec2, b: Vec2): Vec2;
        static sub(out: Vec2, a: Vec2, b: Vec2): Vec2;
        static mul(out: Vec2, a: Vec2, b: Vec2): Vec2;
        static div(out: Vec2, a: Vec2, b: Vec2): Vec2;
        static negate(out: Vec2, a: Vec2): Vec2;
        static dot(a: Vec2, b: Vec2): number;
        static cross(a: Vec2, b: Vec2): number;
        static len(a: Vec2): number;
        static lenSqr(a: Vec2): number;
        static normalize(out: Vec2, a: Vec2): Vec2;
        static distance(a: Vec2, b: Vec2): number;
        static angle(a: Vec2, b: Vec2): number;
        static lerp(out: Vec2, a: Vec2, b: Vec2, t: number): Vec2;
    }

    // Vec3
    class Vec3 {
        x: number;
        y: number;
        z: number;
        static ZERO: Vec3;
        static ONE: Vec3;
        static UNIT_X: Vec3;
        static UNIT_Y: Vec3;
        static UNIT_Z: Vec3;

        constructor(x?: number, y?: number, z?: number);
        clone(): Vec3;
        set(x: number, y: number, z: number): Vec3;
        equals(other: Vec3, epsilon?: number): boolean;
        toString(): string;
        lerp(to: Vec3, ratio: number): Vec3;
        add(other: Vec3): Vec3;
        sub(other: Vec3): Vec3;
        mul(other: Vec3): Vec3;
        div(other: Vec3): Vec3;
        negate(): Vec3;
        dot(vector: Vec3): number;
        cross(vector: Vec3): Vec3;
        mag(): number;
        magSqr(): number;
        normalize(): Vec3;
        static add(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static sub(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static mul(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static div(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static dot(a: Vec3, b: Vec3): number;
        static cross(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static len(a: Vec3): number;
        static lenSqr(a: Vec3): number;
        static normalize(out: Vec3, a: Vec3): Vec3;
        static distance(a: Vec3, b: Vec3): number;
    }

    // Color
    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        static WHITE: Color;
        static BLACK: Color;
        static TRANSPARENT: Color;
        static GRAY: Color;
        static RED: Color;
        static GREEN: Color;
        static BLUE: Color;
        static YELLOW: Color;
        static ORANGE: Color;
        static CYAN: Color;
        static MAGENTA: Color;

        constructor(r?: number, g?: number, b?: number, a?: number);
        clone(): Color;
        equals(other: Color): boolean;
        lerp(to: Color, ratio: number, out?: Color): Color;
        toRGB(): { r: number; g: number; b: number };
        toHEX(fmt?: string): string;
        set(r: number, g: number, b: number, a?: number): Color;
        fromHEX(hexString: string): Color;
        static fromHEX(out: Color, hexString: string): Color;
    }

    // Size
    class Size {
        width: number;
        height: number;
        static ZERO: Size;

        constructor(width?: number, height?: number);
        clone(): Size;
        equals(other: Size): boolean;
        lerp(to: Size, ratio: number): Size;
        toString(): string;
        set(width: number, height: number): Size;
    }

    // Rect
    class Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
        center: Vec2;
        origin: Vec2;
        size: Size;
        static ZERO: Rect;

        constructor(x?: number, y?: number, width?: number, height?: number);
        clone(): Rect;
        equals(other: Rect): boolean;
        lerp(to: Rect, ratio: number): Rect;
        intersection(out: Rect, rect: Rect): Rect;
        union(out: Rect, rect: Rect): Rect;
        contains(point: Vec2): boolean;
        intersects(rect: Rect): boolean;
        containsRect(rect: Rect): boolean;
        toString(): string;
        set(x: number, y: number, width: number, height: number): Rect;
        fromMinMax(min: Vec2, max: Vec2): Rect;
    }

    // Mat4
    class Mat4 {
        m: Float32Array;

        constructor();
        clone(): Mat4;
        set(source: Mat4): Mat4;
        equals(other: Mat4, epsilon?: number): boolean;
        identity(): Mat4;
        transpose(): Mat4;
        invert(): Mat4;
        determinant(): number;
        multiply(other: Mat4): Mat4;
        multiply(m1: Mat4, m2: Mat4, out?: Mat4): Mat4;
        translate(vector: Vec3): Mat4;
        scale(vector: Vec3): Mat4;
        rotate(rad: number, axis: Vec3): Mat4;
        getTranslation(out: Vec3): Vec3;
        getScale(out: Vec3): Vec3;
        getRotation(out: Quat): Quat;
        static identity(out: Mat4): Mat4;
        static copy(out: Mat4, a: Mat4): Mat4;
        static invert(out: Mat4, a: Mat4): Mat4;
        static multiply(out: Mat4, a: Mat4, b: Mat4): Mat4;
        static fromTranslation(out: Mat4, v: Vec3): Mat4;
        static fromScaling(out: Mat4, v: Vec3): Mat4;
        static fromRotation(out: Mat4, rad: number, axis: Vec3): Mat4;
        static fromRT(out: Mat4, q: Quat, v: Vec3): Mat4;
        static fromRTS(out: Mat4, q: Quat, v: Vec3, s: Vec3): Mat4;
    }

    // Quat
    class Quat {
        x: number;
        y: number;
        z: number;
        w: number;
        static identity: Quat;

        constructor(x?: number, y?: number, z?: number, w?: number);
        clone(): Quat;
        set(x: number, y: number, z: number, w: number): Quat;
        equals(other: Quat, epsilon?: number): boolean;
        lerp(to: Quat, ratio: number): Quat;
        slerp(to: Quat, ratio: number): Quat;
        magnitude(): number;
        magnitudeSqr(): number;
        normalize(): Quat;
        invert(): Quat;
        multiply(other: Quat): Quat;
        rotateX(rad: number): Quat;
        rotateY(rad: number): Quat;
        rotateZ(rad: number): Quat;
        getAxisAngle(axis: Vec3): number;
        static fromAngleAxis(out: Quat, rad: number, axis: Vec3): Quat;
        static fromEuler(out: Quat, x: number, y: number, z: number): Quat;
        static fromMat3(out: Quat, m: Mat4): Quat;
    }

    // Actions
    class Action {
        clone(): Action;
        reverse(): Action;
        retain(): void;
        release(): void;
    }

    class FiniteTimeAction extends Action {
        duration: number;
        getDuration(): number;
        setDuration(d: number): void;
        repeatForever(): Action;
        repeat(times: number): Action;
    }

    class ActionInterval extends FiniteTimeAction {
        speed(speed: number): Action;
        easing(easeObj: any): Action;
    }

    class ActionInstant extends FiniteTimeAction {}

    namespace action {
        function runAction(target: Node, action: Action): Action;
        function stopAction(target: Node, action: Action): void;
        function stopAllActions(target: Node): void;
        function pauseTarget(target: Node): void;
        function resumeTarget(target: Node): void;
        function pauseAllTargets(): void;
        function resumeAllTargets(): void;
    }

    // Action Methods
    function moveTo(duration: number, x: number, y: number): ActionInterval;
    function moveTo(duration: number, position: Vec2): ActionInterval;
    function moveBy(duration: number, x: number, y: number): ActionInterval;
    function moveBy(duration: number, delta: Vec2): ActionInterval;
    function rotateTo(duration: number, angle: number): ActionInterval;
    function rotateBy(duration: number, deltaAngle: number): ActionInterval;
    function scaleTo(duration: number, sx: number, sy?: number): ActionInterval;
    function scaleBy(duration: number, sx: number, sy?: number): ActionInterval;
    function fadeIn(duration: number): ActionInterval;
    function fadeOut(duration: number): ActionInterval;
    function fadeTo(duration: number, opacity: number): ActionInterval;
    function blink(duration: number, times: number): ActionInterval;
    function tintTo(duration: number, red: number, green: number, blue: number): ActionInterval;
    function tintBy(duration: number, deltaRed: number, deltaGreen: number, deltaBlue: number): ActionInterval;
    function delayTime(duration: number): ActionInterval;
    function reverseTime(action: ActionInterval): ActionInterval;
    function spawn(...actions: ActionInterval[]): ActionInterval;
    function sequence(...actions: ActionInterval[]): ActionInterval;
    function repeat(action: ActionInterval, times: number): ActionInterval;
    function repeatForever(action: ActionInterval): ActionInterval;
    function easeIn(rate: number): any;
    function easeOut(rate: number): any;
    function easeInOut(rate: number): any;
    function easeExponentialIn(): any;
    function easeExponentialOut(): any;
    function easeExponentialInOut(): any;
    function easeSineIn(): any;
    function easeSineOut(): any;
    function easeSineInOut(): any;
    function easeElasticIn(): any;
    function easeElasticOut(): any;
    function easeElasticInOut(): any;
    function easeBounceIn(): any;
    function easeBounceOut(): any;
    function easeBounceInOut(): any;
    function easeBackIn(): any;
    function easeBackOut(): any;
    function easeBackInOut(): any;
    function easeBezierAction(p0: number, p1: number, p2: number, p3: number): any;
    function easeCircleActionIn(): any;
    function easeCircleActionOut(): any;
    function easeCircleActionInOut(): any;

    class CallFunc extends ActionInstant {
        constructor(func: Function, target?: any, data?: any);
    }
    function callFunc(func: Function, target?: any, data?: any): CallFunc;

    class Hide extends ActionInstant {
        constructor();
    }
    function hide(): Hide;

    class Show extends ActionInstant {
        constructor();
    }
    function show(): Show;

    class RemoveSelf extends ActionInstant {
        constructor();
    }
    function removeSelf(isNeedCleanUp?: boolean): RemoveSelf;

    class FlipX extends ActionInstant {
        flip: boolean;
        constructor(flip: boolean);
    }
    function flipX(flip: boolean): FlipX;

    class FlipY extends ActionInstant {
        flip: boolean;
        constructor(flip: boolean);
    }
    function flipY(flip: boolean): FlipY;

    class Place extends ActionInstant {
        constructor(x: number, y: number);
        constructor(pos: Vec2);
    }
    function place(x: number, y: number): Place;
    function place(pos: Vec2): Place;

    // UI Components
    class Sprite extends Component {
        spriteFrame: SpriteFrame | null;
        type: number;
        sizeMode: number;
        srcBlendFactor: number;
        dstBlendFactor: number;
        trim: boolean;
       fillType: number;
        fillCenter: Vec2;
        fillStart: number;
        fillRange: number;
        enableBold: boolean;
        enableItalic: boolean;
        enableUnderline: boolean;
        underlineHeight: number;

        static FillType: {
            SIMPLE: number;
            SLICED: number;
            TILED: number;
            FILLED: number;
            RADIAL: number;
        };
        static.SizeMode: {
            CUSTOM: number;
            TRIMMED: number;
            RAW: number;
        };

        setSpriteFrame(spriteFrame: SpriteFrame): void;
        getSpriteFrame(): SpriteFrame | null;
    }

    class Label extends Component {
        string: string;
        horizontalAlign: number;
        verticalAlign: number;
        fontSize: number;
        fontFamily: string;
        lineHeight: number;
        overflow: number;
        enableWrapText: boolean;
        enableBold: boolean;
        enableItalic: boolean;
        enableUnderline: boolean;
        underlineHeight: number;
        cacheMode: number;
        maxWidth: number;
        color: Color;

        static HorizontalAlign: {
            LEFT: number;
            CENTER: number;
            RIGHT: number;
        };
        static VerticalAlign: {
            TOP: number;
            CENTER: number;
            BOTTOM: number;
        };
        static Overflow: {
            NONE: number;
            CLAMP: number;
            SHRINK: number;
            RESIZE_HEIGHT: number;
        };
        static CacheMode: {
            NONE: number;
            BITMAP: number;
            CHAR: number;
        };

        updateRenderData(enable: boolean): void;
    }

    class Button extends Component {
        interactable: boolean;
        transition: number;
        normalColor: Color;
        pressedColor: Color;
        hoverColor: Color;
        disabledColor: Color;
        normalSprite: SpriteFrame | null;
        pressedSprite: SpriteFrame | null;
        hoverSprite: SpriteFrame | null;
        disabledSprite: SpriteFrame | null;
        duration: number;
        zoomScale: number;
        target: Node | null;
        clickEvents: EventHandler[];

        static Transition: {
            NONE: number;
            COLOR: number;
            SPRITE: number;
            SCALE: number;
        };

        _onTouchBegan(event: Event.EventTouch): void;
        _onTouchMove(event: Event.EventTouch): void;
        _onTouchEnd(event: Event.EventTouch): void;
        _onTouchCancel(event: Event.EventTouch): void;
    }

    class Toggle extends Component {
        isChecked: boolean;
        toggleGroup: ToggleGroup | null;
        checkMark: Sprite | null;
        checkEvents: EventHandler[];

        _onTouchBegan(event: Event.EventTouch): void;
        _onTouchMove(event: Event.EventTouch): void;
        _onTouchEnd(event: Event.EventTouch): void;
        _onTouchCancel(event: Event.EventTouch): void;
    }

    class ToggleGroup extends Component {
        allowSwitchOff: boolean;
        checkEvents: EventHandler[];
        toggleItems: Toggle[];

        addToggle(toggle: Toggle): void;
        removeToggle(toggle: Toggle): void;
        getCheckedToggle(): Toggle | null;
        getToggles(): Toggle[];
    }

    class EditBox extends Component {
        string: string;
        placeholder: string;
        background: SpriteFrame | null;
        textColor: Color;
        placeholderTextColor: Color;
        fontSize: number;
        fontFamily: string;
        inputMode: number;
        inputFlag: number;
        returnType: number;
        maxLength: number;
        tabIndex: number;
        editingDidBegan: EventHandler[];
        textChanged: EventHandler[];
        editingDidEnded: EventHandler[];
        editingReturn: EventHandler[];

        static InputMode: {
            ANY: number;
            EMAIL_ADDR: number;
            NUMERIC: number;
            PHONE_NUMBER: number;
            URL: number;
            DECIMAL: number;
            SINGLE_LINE: number;
        };
        static InputFlag: {
            PASSWORD: number;
            SENSITIVE: number;
            INITIAL_CAPS_WORD: number;
            INITIAL_CAPS_SENTENCE: number;
            INITIAL_CAPS_ALL_CHARACTERS: number;
            LOWERCASE_ALL_CHARACTERS: number;
            UPPERCASE_ALL_CHARACTERS: number;
        };
        static KeyboardReturnType: {
            DEFAULT: number;
            DONE: number;
            SEND: number;
            SEARCH: number;
            GO: number;
            NEXT: number;
        };

        setFocus(): void;
        isFocused(): boolean;
    }

    class RichText extends Component {
        string: string;
        horizontalAlign: number;
        fontSize: number;
        fontFamily: string;
        lineHeight: number;
        maxWidth: number;
        imageAtlas: SpriteAtlas | null;
        handleTouchEvent: boolean;

        static HorizontalAlign: {
            LEFT: number;
            CENTER: number;
            RIGHT: number;
        };
    }

    class ProgressBar extends Component {
        barSprite: Sprite | null;
        mode: number;
        totalLength: number;
        progress: number;
        reverse: boolean;

        static Mode: {
            HORIZONTAL: number;
            VERTICAL: number;
            FILLED: number;
        };
    }

    class Slider extends Component {
        handle: Node | null;
        direction: number;
        progress: number;
        slideEvents: EventHandler[];

        static Direction: {
            Horizontal: number;
            Vertical: number;
        };
    }

    class ScrollView extends Component {
        content: Node | null;
        horizontal: boolean;
        vertical: boolean;
        inertia: boolean;
        brake: number;
        elastic: boolean;
        bounceDuration: number;
        bounceDurationScale: number;
        horizontalScrollBar: Scrollbar | null;
        verticalScrollBar: Scrollbar | null;
        scrollEvents: EventHandler[];
        cancelInnerEvents: boolean;
        scrollToBottom(timeInSecond?: number, attenuated?: boolean): void;
        scrollToTop(timeInSecond?: number, attenuated?: boolean): void;
        scrollToLeft(timeInSecond?: number, attenuated?: boolean): void;
        scrollToRight(timeInSecond?: number, attenuated?: boolean): void;
        scrollToTopLeft(timeInSecond?: number, attenuated?: boolean): void;
        scrollToTopRight(timeInSecond?: number, attenuated?: boolean): void;
        scrollToBottomLeft(timeInSecond?: number, attenuated?: boolean): void;
        scrollToBottomRight(timeInSecond?: number, attenuated?: boolean): void;
        scrollToOffset(offset: Vec2, timeInSecond?: number, attenuated?: boolean): void;
        getScrollOffset(): Vec2;
        getMaxScrollOffset(): Vec2;
        getScrollPercentage(): Vec2;
        stopAutoScroll(): void;
        isScrolling(): boolean;
        isAutoScrolling(): boolean;
    }

    class Scrollbar extends Component {
        view: Node | null;
        handle: Node | null;
        direction: number;
        enableAutoHide: boolean;
        autoHideTime: number;

        static Direction: {
            HORIZONTAL: number;
            VERTICAL: number;
        };
    }

    class Layout extends Component {
        type: number;
        resizeMode: number;
        cellSize: Size;
        startAxis: number;
        horizontalDirection: number;
        verticalDirection: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        spacingX: number;
        spacingY: number;
        verticalDirection: number;
        horizontalDirection: number;
        affectedByScale: boolean;

        static Type: {
            NONE: number;
            HORIZONTAL: number;
            VERTICAL: number;
            GRID: number;
        };
        static VerticalDirection: {
            TOP_TO_BOTTOM: number;
            BOTTOM_TO_TOP: number;
        };
        static HorizontalDirection: {
            LEFT_TO_RIGHT: number;
            RIGHT_TO_LEFT: number;
        };
        static AxisDirection: {
            HORIZONTAL: number;
            VERTICAL: number;
        };
        static ResizeMode: {
            NONE: number;
            CHILDREN: number;
            CONTAINER: number;
        };

        updateLayout(): void;
    }

    class Widget extends Component {
        isAlignTop: boolean;
        isAlignBottom: boolean;
        isAlignLeft: boolean;
        isAlignRight: boolean;
        isAlignHorizontalCenter: boolean;
        isAlignVerticalCenter: boolean;
        top: number;
        bottom: number;
        left: number;
        right: number;
        horizontalCenter: number;
        verticalCenter: number;
        isAbsoluteTop: boolean;
        isAbsoluteBottom: boolean;
        isAbsoluteLeft: boolean;
        isAbsoluteRight: boolean;
        isAbsoluteHorizontalCenter: boolean;
        isAbsoluteVerticalCenter: boolean;
        alignMode: number;

        static AlignMode: {
            ONCE: number;
            ALWAYS: number;
            ON_WINDOW_RESIZE: number;
        };

        updateAlignment(): void;
    }

    class Mask extends Component {
        type: number;
        spriteFrame: SpriteFrame | null;
        inverted: boolean;
        threshold: number;

        static Type: {
            RECT: number;
            ELLIPSE: number;
            IMAGE_STENCIL: number;
        };

        _clearGraphics(): void;
    }

    class Graphics extends Component {
        lineWidth: number;
        strokeColor: Color;
        fillColor: Color;
        miterLimit: number;
        lineCap: number;
        lineJoin: number;

        static LineCap: {
            BUTT: number;
            ROUND: number;
            SQUARE: number;
        };
        static LineJoin: {
            BEVEL: number;
            ROUND: number;
            MITER: number;
        };

        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
        quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
        arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
        ellipse(cx: number, cy: number, rx: number, ry: number): void;
        circle(cx: number, cy: number, r: number): void;
        rect(x: number, y: number, w: number, h: number): void;
        roundRect(x: number, y: number, w: number, h: number, r: number): void;
        fill(): void;
        stroke(): void;
        clear(): void;
        close(): void;
    }

    class PageView extends Component {
        content: Node | null;
        direction: number;
        scrollThreshold: number;
        autoPageTurningThreshold: number;
        indicator: PageViewIndicator | null;
        inertia: boolean;
        bounceEnabled: boolean;
        bounceDuration: number;
        pageEvents: EventHandler[];
        currentPageIndex: number;

        static Direction: {
            HORIZONTAL: number;
            VERTICAL: number;
        };

        scrollToPage(index: number, timeInSecond?: number): void;
        getCurrentPageIndex(): number;
        setCurrentPageIndex(index: number): void;
        getPages(): Node[];
        addPage(page: Node): void;
        insertPage(page: Node, index: number): void;
        removePage(page: Node): void;
        removePageAtIndex(index: number): void;
        removeAllPages(): void;
    }

    class PageViewIndicator extends Component {
        spriteFrame: SpriteFrame | null;
        direction: number;
        cellSize: Size;
        spacing: number;

        static Direction: {
            HORIZONTAL: number;
            VERTICAL: number;
        };

        setPageCount(count: number): void;
        setCurrentPageIndex(index: number): void;
        resetPageIndex(): void;
    }

    class WebView extends Component {
        url: string;
        webviewEvents: EventHandler[];

        loadURL(url: string): void;
        evaluateJS(str: string): void;
        canGoBack(): boolean;
        canGoForward(): boolean;
        goBack(): void;
        goForward(): void;
        reload(): void;
    }

    class VideoPlayer extends Component {
        resourceType: number;
        remoteURL: string;
        clip: AudioClip | null;
        currentTime: number;
        volume: number;
        mute: boolean;
        playbackRate: number;
        keepAspectRatio: boolean;
        isFullscreen: boolean;
        videoPlayerEvents: EventHandler[];

        static ResourceType: {
            LOCAL: number;
            REMOTE: number;
        };

        play(): void;
        pause(): void;
        stop(): void;
        seekTo(sec: number): void;
        isPlaying(): boolean;
    }

    class SafeArea extends Component {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }

    // Resources
    class Asset extends RawAsset {
        _native: string;
        _nativeUrl: string;
        loaded: boolean;

        serialize(): string;
        deserialize(data: string): Asset;
        static deserialize(data: string): Asset;
    }

    class RawAsset {
        _native: string;
        _nativeUrl: string;
    }

    class SpriteFrame extends Asset {
        texture: Texture2D | null;
        rect: Rect;
        offset: Vec2;
        originalSize: Size;
        rotated: boolean;
        atlas: SpriteAtlas | null;

        getTexture(): Texture2D | null;
        setTexture(texture: Texture2D): void;
        getRect(): Rect;
        setRect(rect: Rect): void;
        getOffset(): Vec2;
        setOffset(offset: Vec2): void;
        getOriginalSize(): Size;
        setOriginalSize(size: Size): void;
        isRotated(): boolean;
        setRotated(rotated: boolean): void;
        clearTexture(): void;
    }

    class Texture2D extends Asset {
        width: number;
        height: number;
        pixelFormat: number;
        _minFilter: number;
        _magFilter: number;
        _mipFilter: number;
        _wrapS: number;
        _wrapT: number;
        _anisotropy: number;

        static PixelFormat: {
            RGB565: number;
            RGB888: number;
            RGBA4444: number;
            RGBA5551: number;
            RGBA8888: number;
            A8: number;
            I8: number;
            AI8: number;
            BGRA8888: number;
        };

        initWithElement(element: HTMLImageElement | HTMLCanvasElement): void;
        initWithData(data: ArrayBufferView, pixelFormat: number, pixelsWide: number, pixelsHigh: number): void;
        getDescription(): string;
        getHtmlElementObj(): HTMLImageElement | HTMLCanvasElement | null;
        isLoaded(): boolean;
        handleLoadedTexture(): void;
        destroy(): void;
    }

    class SpriteAtlas extends Asset {
        spriteFrames: { [key: string]: SpriteFrame };

        getSpriteFrame(key: string): SpriteFrame | null;
        getSpriteFrames(): SpriteFrame[];
    }

    class AudioClip extends Asset {
        loadMode: number;

        static LoadMode: {
            AUDIO_POOL: number;
            DYNAMIC: number;
        };
    }

    class Prefab extends Asset {
        data: Node;

        instantiate(parent?: Node): Node;
    }

    class Font extends Asset {
        fontFamilyName: string;
        fontFace: any;
    }

    class ParticleAsset extends Asset {}

    class TTFFont extends Asset {
        _nativeUrl: string;
        _native: string;
    }

    class BitmapFont extends Asset {
        spriteFrame: SpriteFrame | null;
        fontSize: number;
        fntDataStr: string;
    }

    class JsonAsset extends Asset {
        json: any;
    }

    class TextAsset extends Asset {
        text: string;
    }

    // Resource Loading
    namespace resources {
        function load(path: string, type: typeof Asset, callback: (error: Error, resource: Asset) => void): void;
        function load<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (error: Error, resource: T) => void): void;
        function load(path: string, callback: (error: Error, resource: Asset) => void): void;
        function loadDir(path: string, type: typeof Asset, callback: (error: Error, resources: Asset[]) => void): void;
        function loadDir<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (error: Error, resources: T[]) => void): void;
        function loadDir(path: string, callback: (error: Error, resources: Asset[]) => void): void;
        function loadRes(path: string, type: typeof Asset, callback: (error: Error, resource: Asset) => void): void;
        function loadRes<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (error: Error, resource: T) => void): void;
        function loadRes(path: string, callback: (error: Error, resource: Asset) => void): void;
        function loadResArray(paths: string[], type: typeof Asset, callback: (error: Error, resources: Asset[]) => void): void;
        function loadResArray<T extends Asset>(paths: string[], type: new (...args: any[]) => T, callback: (error: Error, resources: T[]) => void): void;
        function loadResArray(paths: string[], callback: (error: Error, resources: Asset[]) => void): void;
        function loadResDir(path: string, type: typeof Asset, callback: (error: Error, resources: Asset[], paths: string[]) => void): void;
        function loadResDir<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (error: Error, resources: T[], paths: string[]) => void): void;
        function loadResDir(path: string, callback: (error: Error, resources: Asset[], paths: string[]) => void): void;
        function getRes(path: string, type?: typeof Asset): Asset | null;
        function getRes<T extends Asset>(path: string, type?: new (...args: any[]) => T): T | null;
        function release(res: Asset | string): void;
        function release(res: Asset[] | string[]): void;
        function release(path: string, type: typeof Asset): void;
        function releaseAll(): void;
        function releaseRes(path: string): void;
        function releaseRes(path: string, type: typeof Asset): void;
        function releaseResDir(path: string): void;
        function releaseResDir(path: string, type: typeof Asset): void;
        function preloadDir(path: string, type: typeof Asset, callback: (error: Error) => void): void;
        function preloadRes(path: string, type: typeof Asset, callback: (error: Error) => void): void;
        function preloadResArray(paths: string[], type: typeof Asset, callback: (error: Error) => void): void;
    }

    namespace loader {
        function load(resource: any, options: any, callback: (error: Error, resource: Asset) => void): void;
        function load(resource: any, callback: (error: Error, resource: Asset) => void): void;
        function loadRes(path: string, type: typeof Asset, callback: (error: Error, resource: Asset) => void): void;
        function loadRes(path: string, callback: (error: Error, resource: Asset) => void): void;
        function loadResDir(path: string, type: typeof Asset, callback: (error: Error, resources: Asset[], paths: string[]) => void): void;
        function loadResDir(path: string, callback: (error: Error, resources: Asset[], paths: string[]) => void): void;
        function loadResArray(paths: string[], type: typeof Asset, callback: (error: Error, resources: Asset[]) => void): void;
        function loadResArray(paths: string[], callback: (error: Error, resources: Asset[]) => void): void;
        function getRes(path: string, type?: typeof Asset): Asset | null;
        function release(res: Asset | string): void;
        function release(res: Asset[] | string[]): void;
        function release(path: string, type: typeof Asset): void;
        function releaseAll(): void;
        function releaseRes(path: string): void;
        function releaseResDir(path: string): void;
        function preloadRes(path: string, type: typeof Asset, callback: (error: Error) => void): void;
        function preloadResArray(paths: string[], type: typeof Asset, callback: (error: Error) => void): void;
        function preloadResDir(path: string, type: typeof Asset, callback: (error: Error) => void): void;
        function getProgress(): number;
        function getLoadingItem(id: string): any;
        function isLoading(): boolean;
        function getXMLHttpRequest(): XMLHttpRequest;
        let startTime: number;
        let totalCount: number;
        let loadedCount: number;
        let pipeline: any;
        let autoRelease: { [key: string]: boolean };
    }

    // Audio
    namespace audioEngine {
        function play(clip: AudioClip, loop: boolean, volume?: number): number;
        function playMusic(clip: AudioClip, loop: boolean): number;
        function playEffect(clip: AudioClip, loop: boolean): number;
        function stop(audioID: number): void;
        function stopAll(): void;
        function pause(audioID: number): void;
        function pauseAll(): void;
        function resume(audioID: number): void;
        function resumeAll(): void;
        function setVolume(audioID: number, volume: number): void;
        function setLoop(audioID: number, loop: boolean): void;
        function isLoop(audioID: number): boolean;
        function isPlaying(audioID: number): boolean;
        function getCurrentTime(audioID: number): number;
        function setCurrentTime(audioID: number, time: number): void;
        function getDuration(audioID: number): number;
        function getVolume(audioID: number): number;
        function setMusicVolume(volume: number): void;
        function setEffectsVolume(volume: number): void;
        function getMusicVolume(): number;
        function getEffectsVolume(): number;
        function seek(audioID: number, time: number): void;
        function getCurrentMusicVolume(): number;
        function getCurrentEffectsVolume(): number;
        function getMaxAudioInstance(): number;
        function setMaxAudioInstance(num: number): void;
        function uncache(clip: AudioClip): void;
        function uncacheAll(): void;
        function preload(clip: AudioClip, callback?: Function): void;
        function getState(audioID: number): number;

        const AudioState: {
            ERROR: number;
            INITIALZING: number;
            PLAYING: number;
            PAUSED: number;
            STOPPED: number;
        };
    }

    // Event
    class Event {
        type: string;
        bubbles: boolean;
        target: Node;
        currentTarget: Node;
        eventPhase: number;

        constructor(type: string, bubbles: boolean);
        unuse(): void;
        reuse(): void;
        stopPropagation(): void;
        stopPropagationImmediate(): void;
        isStopped(): boolean;
        getCurrentTarget(): Node;
        getType(): string;
    }

    namespace Event {
        class EventTouch extends Event {
            touches: Touch[];
            allTouches: Touch[];
            touch: Touch | null;
            location: Vec2;
            UILocation: Vec2;
            prevLocation: Vec2;
            UIPrevLocation: Vec2;
            startLocation: Vec2;
            UIStartLocation: Vec2;
            getID(): number;
            getLocation(): Vec2;
            getUILocation(): Vec2;
            getPreviousLocation(): Vec2;
            getUIPreviousLocation(): Vec2;
            getStartLocation(): Vec2;
            getUIStartLocation(): Vec2;
            getDelta(): Vec2;
            getUIDelta(): Vec2;
            getLocationInView(): Vec2;
            getTouches(): Touch[];
            getTouch(): Touch | null;
            setUserData(data: any): void;
            getUserData(): any;
        }

        class EventMouse extends Event {
            scrollData: number[];
            button: number;
            x: number;
            y: number;
            prevX: number;
            prevY: number;
            getScrollY(): number;
            getScrollData(): number[];
            setLocation(x: number, y: number): void;
            getLocation(): Vec2;
            getUILocation(): Vec2;
            getPreviousLocation(): Vec2;
            getUIPreviousLocation(): Vec2;
            getDelta(): Vec2;
            getUIDelta(): Vec2;
            getDeltaX(): number;
            getDeltaY(): number;
            getButton(): number;
            getLocationInView(): Vec2;

            const BUTTON_LEFT: number;
            const BUTTON_RIGHT: number;
            const BUTTON_MIDDLE: number;
            const BUTTON_4: number;
            const BUTTON_5: number;
            const BUTTON_6: number;
            const BUTTON_7: number;
            const BUTTON_8: number;
        }

        class EventKeyboard extends Event {
            keyCode: number;
            isPressed: boolean;

            static KEY_A: number;
            static KEY_B: number;
            static KEY_C: number;
            static KEY_D: number;
            static KEY_E: number;
            static KEY_F: number;
            static KEY_G: number;
            static KEY_H: number;
            static KEY_I: number;
            static KEY_J: number;
            static KEY_K: number;
            static KEY_L: number;
            static KEY_M: number;
            static KEY_N: number;
            static KEY_O: number;
            static KEY_P: number;
            static KEY_Q: number;
            static KEY_R: number;
            static KEY_S: number;
            static KEY_T: number;
            static KEY_U: number;
            static KEY_V: number;
            static KEY_W: number;
            static KEY_X: number;
            static KEY_Y: number;
            static KEY_Z: number;
            static KEY_0: number;
            static KEY_1: number;
            static KEY_2: number;
            static KEY_3: number;
            static KEY_4: number;
            static KEY_5: number;
            static KEY_6: number;
            static KEY_7: number;
            static KEY_8: number;
            static KEY_9: number;
            static KEY_ESCAPE: number;
            static KEY_SPACE: number;
            static KEY_ENTER: number;
            static KEY_TAB: number;
            static KEY_BACKSPACE: number;
            static KEY_SHIFT: number;
            static KEY_CTRL: number;
            static KEY_ALT: number;
            static KEY_PAUSE: number;
            static KEY_CAPS_LOCK: number;
            static KEY_NUM_LOCK: number;
            static KEY_SCROLL_LOCK: number;
            static KEY_INSERT: number;
            static KEY_DELETE: number;
            static KEY_HOME: number;
            static KEY_END: number;
            static KEY_PAGE_UP: number;
            static KEY_PAGE_DOWN: number;
            static KEY_LEFT: number;
            static KEY_RIGHT: number;
            static KEY_UP: number;
            static KEY_DOWN: number;
            static KEY_F1: number;
            static KEY_F2: number;
            static KEY_F3: number;
            static KEY_F4: number;
            static KEY_F5: number;
            static KEY_F6: number;
            static KEY_F7: number;
            static KEY_F8: number;
            static KEY_F9: number;
            static KEY_F10: number;
            static KEY_F11: number;
            static KEY_F12: number;
            static KEY_NUMPAD_0: number;
            static KEY_NUMPAD_1: number;
            static KEY_NUMPAD_2: number;
            static KEY_NUMPAD_3: number;
            static KEY_NUMPAD_4: number;
            static KEY_NUMPAD_5: number;
            static KEY_NUMPAD_6: number;
            static KEY_NUMPAD_7: number;
            static KEY_NUMPAD_8: number;
            static KEY_NUMPAD_9: number;
            static KEY_NUMPAD_ADD: number;
            static KEY_NUMPAD_SUBTRACT: number;
            static KEY_NUMPAD_MULTIPLY: number;
            static KEY_NUMPAD_DIVIDE: number;
            static KEY_NUMPAD_ENTER: number;
            static KEY_NUMPAD_DECIMAL: number;
        }
    }

    // Touch
    class Touch {
        id: number;
        _point: Vec2;
        _prevPoint: Vec2;
        _lastModified: number;

        constructor(id: number, x: number, y: number);
        getId(): number;
        getLocation(): Vec2;
        getUILocation(): Vec2;
        getPreviousLocation(): Vec2;
        getUIPreviousLocation(): Vec2;
        getStartLocation(): Vec2;
        getUIStartLocation(): Vec2;
        getDelta(): Vec2;
        getUIDelta(): Vec2;
        getLocationInView(): Vec2;
        getPreviousLocationInView(): Vec2;
        getStartLocationInView(): Vec2;
        setTouchInfo(id: number, x: number, y: number): void;
    }

    // Event Handler
    class EventHandler {
        target: Node;
        component: string;
        handler: string;
        customEventData: string;

        constructor();
        static emitEvents(handlers: EventHandler[], ...params: any[]): void;
        emit(...params: any[]): void;
    }

    // System
    namespace sys {
        const language: string;
        const os: string;
        const osVersion: string;
        const osMainVersion: number;
        const browserType: string;
        const browserVersion: string;
        const platform: number;
        const isNative: boolean;
        const isMobile: boolean;
        const isLittleEndian: boolean;
        const garbageCollection: () => void;
        const restartVM: () => void;
        const dump: () => string;
        const getPluginBinaryPath: (pluginName: string) => string;

        const LANGUAGE_CHINESE: string;
        const LANGUAGE_CHINESE_TRADITIONAL: string;
        const LANGUAGE_ENGLISH: string;
        const LANGUAGE_FRENCH: string;
        const LANGUAGE_ITALIAN: string;
        const LANGUAGE_GERMAN: string;
        const LANGUAGE_SPANISH: string;
        const LANGUAGE_DUTCH: string;
        const LANGUAGE_PORTUGUESE: string;
        const LANGUAGE_RUSSIAN: string;
        const LANGUAGE_KOREAN: string;
        const LANGUAGE_JAPANESE: string;
        const LANGUAGE_HUNGARIAN: string;
        const LANGUAGE_ARABIC: string;
        const LANGUAGE_NORWEGIAN: string;
        const LANGUAGE_POLISH: string;
        const LANGUAGE_TURKISH: string;
        const LANGUAGE_UKRAINIAN: string;
        const LANGUAGE_ROMANIAN: string;
        const LANGUAGE_BULGARIAN: string;

        const OS_IOS: string;
        const OS_ANDROID: string;
        const OS_WINDOWS: string;
        const OS_MARMALADE: string;
        const OS_LINUX: string;
        const OS_BADA: string;
        const OS_BLACKBERRY: string;
        const OS_OSX: string;
        const OS_WINRT: string;
        const OS_WP8: string;
        const OS_TIZEN: string;

        const UNKNOWN: number;
        const WIN32: number;
        const LINUX: number;
        const MACOS: number;
        const ANDROID: number;
        const IPHONE: number;
        const IPAD: number;
        const BLACKBERRY: number;
        const NACL: number;
        const EMSCRIPTEN: number;
        const TIZEN: number;
        const WINRT: number;
        const WP8: number;
        const MOBILE_BROWSER: number;
        const DESKTOP_BROWSER: number;

        const BROWSER_TYPE_WECHAT: string;
        const BROWSER_TYPE_ANDROID: string;
        const BROWSER_TYPE_IE: string;
        const BROWSER_TYPE_QQ: string;
        const BROWSER_TYPE_MOBILE_QQ: string;
        const BROWSER_TYPE_UC: string;
        const BROWSER_TYPE_UCBS: string;
        const BROWSER_TYPE_360: string;
        const BROWSER_TYPE_BAIDU_APP: string;
        const BROWSER_TYPE_BAIDU: string;
        const BROWSER_TYPE_BAIDU_BROWSER: string;
        const BROWSER_TYPE_MI: string;
        const BROWSER_TYPE_FIREFOX: string;
        const BROWSER_TYPE_CHROME: string;
        const BROWSER_TYPE_SAFARI: string;
        const BROWSER_TYPE_HUAWEI: string;
        const BROWSER_TYPE_WECHAT_GAME: string;
        const BROWSER_TYPE_FB_PLAYABLE_ADS: string;
        const BROWSER_TYPE_XIAOMI_GAME: string;
        const BROWSER_TYPE_VIVO_GAME: string;
        const BROWSER_TYPE_OPPO_GAME: string;

        let openURL(url: string): void;
        let now(): number;
        let localStorage: Storage;

        function getNetworkType(): number;
        function getBatteryLevel(): number;
        function isBatteryCharging(): boolean;
        function getRealScreenResolution(): Size;

        const NetworkType: {
            NONE: number;
            LAN: number;
            WWAN: number;
        };
    }

    // View
    namespace view {
        const DESIGN_RESOLUTION_ORIENTATION: number;
        const EXACT_FIT: number;
        const NO_BORDER: number;
        const SHOW_ALL: number;
        const FIXED_HEIGHT: number;
        const FIXED_WIDTH: number;

        function enableRetina(enabled: boolean): void;
        function isRetinaEnabled(): boolean;
        function enableAutoFullScreen(enabled: boolean): void;
        function isAutoFullScreenEnabled(): boolean;
        function getCanvasSize(): Size;
        function getFrameSize(): Size;
        function setFrameSize(width: number, height: number): void;
        function getVisibleSize(): Size;
        function getVisibleOrigin(): Vec2;
        function getDesignResolutionSize(): Size;
        function setDesignResolutionSize(width: number, height: number, resolutionPolicy: number): void;
        function getResolutionPolicy(): ResolutionPolicy;
        function setResolutionPolicy(resolutionPolicy: number | ResolutionPolicy): void;
        function setContentTranslateLeftTop(offsetX: number, offsetY: number): void;
        function getContentTranslateLeftTop(): Vec2;
        function convertToLocationInView(x: number, y: number, relatedPos: Vec2): Vec2;
        function convertToNodeSpace(point: Vec2): Vec2;
        function convertToUI(point: Vec2): Vec2;
        function enableAntiAlias(enabled: boolean): void;
        function setViewport(target: any, rect?: Rect): void;
        function setTargetDensityDPI(densityDPI: string): void;
        function getTargetDensityDPI(): string;
        function resizeWithBrowserSize(enabled: boolean): void;
        function setResizeCallback(callback: Function): void;
        function setOrientation(orientation: number): void;
        function adjustViewportMeta(): void;
        function resetCanvasSize(): void;
        function init(width: number, height: number): void;

        function on(type: string, callback: Function, target?: any): void;
        function off(type: string, callback?: Function, target?: any): void;

        function emit(type: string, ...args: any[]): void;

        const MAX_FRAMERATE: number;
    }

    class ResolutionPolicy {
        containerRatio: number;
        fixedWidth: number;
        fixedHeight: number;
        noBorder: number;
        exactFit: number;
        showAll: number;

        constructor(containerStg: number, resolutionPolicy: number);
    }

    // Screen
    namespace screen {
        let fullScreen: boolean;
        function init(): void;
        function requestFullScreen(element?: Element): boolean;
        function exitFullScreen(): boolean;
        function autoFullScreen(element?: Element): boolean;
        function fullScreenEnabled(): boolean;
    }

    // Game
    namespace game {
        const EVENT_HIDE: string;
        const EVENT_SHOW: string;
        const EVENT_PAUSE: string;
        const EVENT_RESUME: string;
        const EVENT_RESTART: string;
        const EVENT_GAME_INITED: string;
        const RENDER_TYPE_CANVAS: number;
        const RENDER_TYPE_WEBGL: number;
        const RENDER_TYPE_OPENGL: number;

        let frameRate: number;
        let renderType: number;
        let canvas: HTMLCanvasElement | null;
        let container: HTMLDivElement | null;
        let config: any;

        function onStart(): void;
        function onPause(): void;
        function onResume(): void;
        function on(type: string, callback: Function, target?: any): void;
        function off(type: string, callback?: Function, target?: any): void;
        function emit(type: string, ...args: any[]): void;
        function pause(): void;
        function resume(): void;
        function restart(): void;
        function end(): void;
        function step(): void;
        function getRenderType(): number;
        function isPaused(): boolean;
        function getFrameRate(): number;
        function setFrameRate(frameRate: number): void;
        function getTime(): number;
        function getTick(): number;
        function getScene(): Scene | null;
        function getCanvas(): HTMLCanvasElement | null;
        function addPersistRootNode(node: Node): void;
        function removePersistRootNode(node: Node): void;
        function isPersistRootNode(node: Node): boolean;
    }

    // Intersection
    namespace intersection {
        function lineLine(lineStart1: Vec2, lineEnd1: Vec2, lineStart2: Vec2, lineEnd2: Vec2): Vec2 | null;
        function lineRect(lineStart: Vec2, lineEnd: Vec2, rect: Rect): Vec2 | null;
        function linePolygon(lineStart: Vec2, lineEnd: Vec2, polygon: Vec2[]): Vec2 | null;
        function rectRect(rect1: Rect, rect2: Rect): boolean;
        function rectPolygon(rect: Rect, polygon: Vec2[]): boolean;
        function polygonPolygon(polygon1: Vec2[], polygon2: Vec2[]): boolean;
        function circleCircle(circle1: { position: Vec2; radius: number }, circle2: { position: Vec2; radius: number }): boolean;
        function circleRect(circle: { position: Vec2; radius: number }, rect: Rect): boolean;
        function circlePolygon(circle: { position: Vec2; radius: number }, polygon: Vec2[]): boolean;
        function pointInPolygon(point: Vec2, polygon: Vec2[]): boolean;
        function pointLineDistance(point: Vec2, lineStart: Vec2, lineEnd: Vec2, isSegment: boolean): number;
        function pointOnLine(point: Vec2, lineStart: Vec2, lineEnd: Vec2): boolean;
    }

    // Math
    namespace math {
        function random(): number;
        function randomRange(min: number, max: number): number;
        function randomRangeInt(min: number, max: number): number;
        function toRadian(degree: number): number;
        function toDegree(radian: number): number;
        function clamp(val: number, min: number, max: number): number;
        function clamp01(val: number): number;
        function lerp(a: number, b: number, t: number): number;
        function pingPong(t: number, length: number): number;
        function inverseLerp(a: number, b: number, t: number): number;
        function smoothstep(from: number, to: number, t: number): number;
        function repeat(t: number, length: number): number;
        function approximately(a: number, b: number): boolean;
        function sign(x: number): number;
        function abs(x: number): number;
        function min(a: number, b: number): number;
        function max(a: number, b: number): number;
        function pow(x: number, y: number): number;
        function sqrt(x: number): number;
        function sin(x: number): number;
        function cos(x: number): number;
        function tan(x: number): number;
        function asin(x: number): number;
        function acos(x: number): number;
        function atan(x: number): number;
        function atan2(y: number, x: number): number;
        function log(x: number): number;
        function log10(x: number): number;
        function log2(x: number): number;
        function exp(x: number): number;
        function floor(x: number): number;
        function ceil(x: number): number;
        function round(x: number): number;
        function fract(x: number): number;
        function isPowerOfTwo(x: number): boolean;
        function nextPow2(x: number): number;
        function bitCount(x: number): number;
        function lerp(a: number, b: number, t: number): number;
        function lerp(a: Vec2, b: Vec2, t: number): Vec2;
        function lerp(a: Vec3, b: Vec3, t: number): Vec3;
        function lerp(a: Color, b: Color, t: number): Color;
        function lerp(a: Quat, b: Quat, t: number): Quat;
        function tanh(x: number): number;
        function sinh(x: number): number;
        function cosh(x: number): number;
        function fmod(x: number, y: number): number;
    }

    // Find
    function find(path: string): Node | null;

    // instantiate
    function instantiate(original: Prefab | Node): Node;

    // isValid
    function isValid(value: any): boolean;

    // CCClass
    namespace CCClass {
        function attr(obj: any, propName: string, attrs: any): void;
        function attr(obj: any, attrs: any): void;
    }

    // Enum
    function Enum(obj: object): any;
    namespace Enum {
        function getList(enumDef: any): { name: string; value: number }[];
        function getName(enumDef: any, value: number): string;
        function getValueByName(enumDef: any, name: string): number;
        function getNameByValue(enumDef: any, value: number): string;
    }

    // Decorators
    function ccclass(name?: string): ClassDecorator;
    function property(options?: any): PropertyDecorator;
    function property(target: any, key: string | symbol, descriptor?: PropertyDescriptor): void;
    function executeInEditMode(): ClassDecorator;
    function help(url: string): ClassDecorator;
    function menu(path: string): ClassDecorator;
    function executionOrder(order: number): ClassDecorator;
    function disallowMultiple(): ClassDecorator;
    function playOnFocus(): ClassDecorator;
    function inspector(path: string): ClassDecorator;
    function icon(path: string): ClassDecorator;
    function requireComponent(component: typeof Component): ClassDecorator;
    function editorOnly(target: any, propertyKey: string, descriptor?: PropertyDescriptor): void;

    // misc
    namespace misc {
        function valueForUniform(value: any): any;
        function clampf(value: number, min_inclusive: number, max_inclusive: number): number;
        function clamp01(value: number): number;
        function lerp(a: number, b: number, t: number): number;
        function contains(rect: Rect, point: Vec2): boolean;
    }

    // Hex Binary Encoding
    namespace hexBinary {
        function decode(encoded: string): Uint8Array;
        function encode(bytes: Uint8Array): string;
    }

    // UTF8
    namespace utf8 {
        function decode(encoded: string): string;
        function encode(str: string): Uint8Array;
    }

    // Node.EventType
    namespace Node {
        enum EventType {
            TOUCH_START = 'touchstart',
            TOUCH_MOVE = 'touchmove',
            TOUCH_END = 'touchend',
            TOUCH_CANCEL = 'touchcancel',
            MOUSE_DOWN = 'mousedown',
            MOUSE_MOVE = 'mousemove',
            MOUSE_ENTER = 'mouseenter',
            MOUSE_LEAVE = 'mouseleave',
            MOUSE_WHEEL = 'mousewheel',
            MOUSE_UP = 'mouseup',
            POSITION_CHANGED = 'position-changed',
            ROTATION_CHANGED = 'rotation-changed',
            SCALE_CHANGED = 'scale-changed',
            SIZE_CHANGED = 'size-changed',
            ANCHOR_CHANGED = 'anchor-changed',
            CHILD_ADDED = 'child-added',
            CHILD_REMOVED = 'child-removed',
            CHILD_REORDER = 'child-reorder',
            GROUP_CHANGED = 'group-changed',
            SIBLING_ORDER_CHANGED = 'sibling-order-changed',
            ACTIVE_IN_HIERARCHY_CHANGED = 'active-in-hierarchy-changed',
        }
    }

    // SystemEventType
    namespace SystemEvent {
        enum EventType {
            KEY_DOWN = 'keydown',
            KEY_UP = 'keyup',
            DEVICEMOTION = 'devicemotion',
            TOUCH_START = 'touchstart',
            TOUCH_MOVE = 'touchmove',
            TOUCH_END = 'touchend',
            TOUCH_CANCEL = 'touchcancel',
            MOUSE_DOWN = 'mousedown',
            MOUSE_MOVE = 'mousemove',
            MOUSE_ENTER = 'mouseenter',
            MOUSE_LEAVE = 'mouseleave',
            MOUSE_WHEEL = 'mousewheel',
            MOUSE_UP = 'mouseup',
        }
    }

    class SystemEvent extends Component {
        on(type: string, callback: Function, target?: any): void;
        off(type: string, callback?: Function, target?: any): void;
    }

    // Tween
    namespace tween {
        function tween<T>(target: T): Tween<T>;
    }

    class Tween<T> {
        to(duration: number, props: any, opts?: any): Tween<T>;
        by(duration: number, props: any, opts?: any): Tween<T>;
        set(props: any): Tween<T>;
        delay(duration: number): Tween<T>;
        call(callback: Function): Tween<T>;
        target(target: T): Tween<T>;
        start(): Tween<T>;
        stop(): Tween<T>;
        clone(target: T): Tween<T>;
        union(): Tween<T>;
        repeat(repeatTimes: number, tween?: Tween<T>): Tween<T>;
        repeatForever(tween?: Tween<T>): Tween<T>;
        reverseTime(tween?: Tween<T>): Tween<T>;
        sequence(...tweens: Tween<T>[]): Tween<T>;
        parallel(...tweens: Tween<T>[]): Tween<T>;
    }
}

// Global functions
declare function ccclass(name?: string): ClassDecorator;
declare function property(options?: any): PropertyDecorator;
declare const cc: typeof cc;

// Global objects
declare let window: Window & { [key: string]: any };
