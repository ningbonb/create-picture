declare namespace CreatePicture{
    interface ConstructorProp{
        width?: number,
        height?: number,
    }
    interface FontStyle{
        fontStyle?: string|number,
        fontVariant?: string|number,
        fontWeight?: string|number,
        fontSize?: number,
        lineHeight?: string|number,
        fontFamily?: string,
        left?: number,
        top?: number,
        maxWidth?: undefined|number,
        content: string,
        textAlign?: string,
        textBaseline?: string,
        direction?:string,
        color?: string,
        rotation?: number,
        width?: undefined|number,
    }
}

declare class CreatePicture{
    constructor(prop:CreatePicture.ConstructorProp);
    drawImage(image: any, dx: number, dy: number): void;
    drawImage(image: any, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: any, sx: number, sy: number, sw: number|string, sh: number|string, dx: number, dy: number, dw: number, dh: number): void;
    drawCirclePicture(image: any, dx: number, dy: number): void;
    drawCirclePicture(image: any, dx: number, dy: number, dw: number, dh: number): void;
    drawCirclePicture(image: any, sx: number, sy: number, sw: number|string, sh: number|string, dx: number, dy: number, dw: number, dh: number): void;
    drawText(prop: CreatePicture.FontStyle):number;
    getPicture(type?: string, quality?: any);
}

export default CreatePicture;