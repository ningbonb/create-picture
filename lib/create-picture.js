/* 说明 V 1.0.1
* 该组件提供了 canvas 的图片绘制与文本绘制功能，使用同步的语法完成异步绘制，简化原生 canvas 绘制语法。
* API：https://github.com/ningbonb/create-picture
* npm：https://www.npmjs.com/package/create-picture
* */

let saidHello = false;
const VERSION = '1.0.0';
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
    rotation: 0,
    width: undefined,
};
export default class CreatePicture{
    constructor({...prop}={}){
        prop = Object.assign(defaultProp,prop);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        [this.canvas.width,this.canvas.height] = [Reflect.get(prop,'width'),Reflect.get(prop,'height')];
        this.map = new Map();
        this.pictureMap = new Map();
        this.sayHello();
    }
    drawImage(...prop){
        this.map.set(prop,'picture');
        this.pictureMap.set(prop,prop[0]);
    }
    drawCirclePicture(...prop){
        this.map.set(prop,'circlePicture');
        this.pictureMap.set(prop,prop[0]);
    }
    drawText(prop={}){
        this.map.set(Object.assign({},defaultFontStyle,prop),'text');
        return this.getTextWidth(Object.assign(defaultFontStyle,prop));
    }
    getTextWidth(prop,content=null){
        this.ctx.save();
        this.ctx.font = `${prop.fontStyle} ${prop.fontVariant} ${prop.fontWeight} ${prop.fontSize}px/${prop.lineHeight} ${prop.fontFamily}`;
        let width = this.ctx.measureText(content?content:prop.content).width;
        this.ctx.restore();
        return width;
    }
    getTextLines(key){
        let lines = [];
        if(key.width){
            let tempWidth = 0,tempStr = '';
            for(let i = 0; i < key.content.length; i++){
                const textWidth = this.getTextWidth(key,key.content[i]);
                tempWidth+=textWidth;
                if(tempWidth>key.width){
                    lines.push(tempStr);
                    tempStr = key.content[i];
                    tempWidth = textWidth;
                }else{
                    tempStr += key.content[i];
                }
                if(i === key.content.length-1&&tempStr.length>0){
                    lines.push(tempStr);
                }
            }
        }else{
            lines = [key.content];
        }
        return lines;
    }
    async getPicture(...prop){
        const picture =  await new Promise((resolve)=>{
            this.getImages(...this.pictureMap.values()).then((images)=>{
                [...this.pictureMap.keys()].forEach((item,index)=>{
                    this.pictureMap.set(item,images[0][index]);
                });
                for(let [key,value] of this.map.entries()){
                    if(value === 'picture') this.addPicture(key);
                    if(value === 'circlePicture') this.addCirclePicture(key);
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
    addCirclePicture(key){
        key[0] = this.pictureMap.get(key);
        this.ctx.save();
        if(key.length===9){
            if(typeof key[3] !== 'number') key[3] = key[0].width;
            if(typeof key[4] !== 'number') key[4] = key[0].height;
        }
        // 圆半径
        let r = key.length===3 ? key[0].width/2 : key.length===5 ? key[3]/2 : key.length===9 ? key[7]/2 : 30;
        // 圆心坐标
        let [cx,cy] = key.length===9 ? [key[5]+r,key[6]+r] : [key[1]+r,key[2]+r];
        this.ctx.arc(cx,cy,r,0,2*Math.PI);
        this.ctx.clip();
        this.ctx.drawImage(...key);
        this.ctx.restore();
    }
    addText(key){
        let lines = this.getTextLines(key);
        this.ctx.save();
        this.ctx.fillStyle = key.color;
        this.ctx.font = `${key.fontStyle} ${key.fontVariant} ${key.fontWeight} ${key.fontSize}px/${key.lineHeight} ${key.fontFamily}`;
        this.ctx.textBaseline = key.textBaseline;
        this.ctx.textAlign = key.textAlign;
        this.ctx.direction = key.direction;
        if(key.rotation!==0){
            lines.forEach((item,index)=>{
                this.ctx.save();
                const LH = key.lineHeight==="normal"?key.fontSize:key.lineHeight;
                const transX = -LH*Math.sin(key.rotation*Math.PI/180);
                this.ctx.translate(key.left+index*transX,key.top+index*LH);
                this.ctx.rotate(Math.PI/180 * key.rotation);
                this.ctx.fillText(item,0,0,key.maxWidth);
                this.ctx.restore();
            });
        }else{
            lines.forEach((item,index)=>{
                this.ctx.fillText(item,key.left,key.top+index*(key.lineHeight==="normal"?key.fontSize:key.lineHeight),key.maxWidth);
            });
        }
        this.ctx.restore();
    }
    getImages(...assetsArr){
        const imageArr = [];
        const promiseArr = [];
        assetsArr.forEach((item,index)=>{
            promiseArr.push(new Promise((resolve)=>{
                if(item instanceof HTMLCanvasElement){
                    imageArr.push(item);
                    resolve(imageArr);
                }else{
                    const image = new Image();
                    imageArr.push(image);
                    image.onload = ()=>{
                        resolve(imageArr)
                    };
                    image.crossOrigin = 'anonymous';
                    image.src = assetsArr[index].indexOf('data:')>-1? assetsArr[index] : assetsArr[index]+'?corp';
                }
            }));
        });
        return Promise.all(promiseArr);
    }
    sayHello() {
        if (saidHello) return;
        if (window.console) {
            window.console.log("CreatePicture " + VERSION + " - https://github.com/ningbonb/create-picture");
        }
        saidHello = true;
    }
}