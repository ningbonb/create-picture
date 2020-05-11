/* 说明
* 该组件提供了 canvas 的图片绘制与文本绘制功能，使用同步的语法完成异步绘制，简化原生 canvas 绘制语法。
* API：https://github.com/NalvyBoo/create-picture
* */

const defaultProp = {
    width: 750,
    height: 1448,
};
const defaultFontStyle = {
    fontStyle:'normal',
    fontVariant:'normal',
    fontWeight:'normal',
    fontSize: 30,
    lineHeight: 'normal',
    fontFamily: 'Arial',
    left: 0,
    top: 300,
    maxWidth:undefined,
    content:'',
    textAlign:'start',
    textBaseline:'alphabetic',
    direction:'inherit',
    color: '#000000',
};
export default class CreatePicture{
    constructor({...prop}={}){
        prop = Object.assign(prop,defaultProp);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        [this.canvas.width,this.canvas.height] = [Reflect.get(prop,'width'),Reflect.get(prop,'height')];
        this.map = new Map();
        this.pictureMap = new Map();
    }
    drawPicture(...prop){
        this.map.set(prop,'picture');
        this.pictureMap.set(prop,prop[0]);
    }
    drawText(prop={}){
        this.map.set(Object.assign(defaultFontStyle,prop),'text');
        return this.getTextWidth(Object.assign(defaultFontStyle,prop));
    }
    getTextWidth(prop){
        this.ctx.save();
        prop.lineHeight = prop.lineHeight === 'normal' ? 'normal' :prop.lineHeight+'px';
        this.ctx.font = `${prop.fontStyle} ${prop.fontVariant} ${prop.fontWeight} ${prop.fontSize}px/${prop.lineHeight} ${prop.fontFamily}`;
        let width = this.ctx.measureText(prop.content).width;
        this.ctx.restore();
        return width;
    }
    async getPicture(...prop){
        const picture =  await new Promise((resolve)=>{
            this.getImages(...this.pictureMap.values()).then((images)=>{
                [...this.pictureMap.keys()].forEach((item,index)=>{
                    this.pictureMap.set(item,images[0][index]);
                });
                for(let [key,value] of this.map.entries()){
                    if(value === 'picture') this.addPicture(key);
                    if(value === 'text') this.addText(key);
                }
                resolve(this.canvas.toDataURL(...prop));
            });
        });
        return picture;
    }
    addPicture(key){
        key[0] = this.pictureMap.get(key);
        this.ctx.drawImage(...key);
    }
    addText(key){
        this.ctx.save();
        this.ctx.fillStyle = key.color;
        key.lineHeight = key.lineHeight === 'normal' ? 'normal' :key.lineHeight+'px';
        this.ctx.font = `${key.fontStyle} ${key.fontVariant} ${key.fontWeight} ${key.fontSize}px ${key.lineHeight} ${key.fontFamily}`;
        this.ctx.textBaseline = key.textBaseline;
        this.ctx.textAlign = key.textAlign;
        this.ctx.direction = key.direction;
        this.ctx.fillText(key.content,key.left,key.top,key.maxWidth);
        this.ctx.restore();
    }
    getImages(...assetsArr){
        const imageArr = [];
        const promiseArr = [];
        assetsArr.forEach((item,index)=>{
            promiseArr.push(new Promise((resolve)=>{
                const image = new Image();
                imageArr.push(image);
                image.onload = ()=>{
                    resolve(imageArr)
                };
                image.crossOrigin = 'anonymous';
                image.src = assetsArr[index]+'?corp';
            }));
        });
        return Promise.all(promiseArr);
    }
}