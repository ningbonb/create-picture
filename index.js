/* 说明
* 该组件提供了 canvas 的图片绘制与文本绘制功能，使用同步的语法完成异步绘制，简化原生 canvas 绘制语法。
* API：https://g.hz.netease.com/sale_tool/f2e_common/tree/master/components/createPicture
* */

/* 提供方法
* const cp:CreatePicture = new CreatePicture(); - 初始化，可接受一个对象参数
* drawPicture() - 绘制图片，第一个参数为图片路径，其他参数与 CanvasRenderingContext2D.drawImage() 参数相同
* drawText() - 绘制文本，返回文字宽度（可选）
* getPicture().then((picture)=>{}); - 最终合成的图片
* */

/* 示例
const cp:CreatePicture = new CreatePicture();
cp.drawPicture(require('../assets/save_bg.jpg'),0,0);
const textWidth = cp.drawText({
    content:'文本',
    fontSize: 30,
    top: 300,
    color: '#ffffff',
});
cp.getPicture().then((picture)=>{
    this.picture = picture;
});
* */

/*  new CreatePicture() 默认值
* width: 750
* height: 1448
* */

/*  drawText 可选参数
* @param {string} fontStyle - 文字样式，默认 normal
* @param {string} fontVariant - 文字变体，默认 normal
* @param {string} fontWeight - 文字宽度，默认 normal
* @param {string} fontSize - 文字宽度，默认 30
* @param {number} lineHeight - 文字行高，默认 normal
* @param {string} fontFamily - 字体，默认 Arial
* @param {number} left - 左对齐，默认 0
* @param {number} top- 上对齐，默认 300
* @param {number} maxWidth - 文字最大宽度，默认 undefined
* @param {string} content - 文本内容
* @param {string} textAlign - 对齐方式，默认 start
* @param {string} textBaseline - 文本基线，默认 alphabetic
* @param {string} direction - 文字方向，默认 inherit
* @param {string} color - 文字颜色，默认 #000000
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
        this.ctx.font = `${prop.fontStyle} ${prop.fontVariant} ${prop.fontWeight} ${prop.fontSize}px ${prop.lineHeight} ${prop.fontFamily}`;
        let width = this.ctx.measureText(prop.content).width;
        this.ctx.restore();
        return width;
    }
    async getPicture(){
        const picture =  await new Promise((resolve)=>{
            this.getImages(...this.pictureMap.values()).then((images)=>{
                [...this.pictureMap.keys()].forEach((item,index)=>{
                    this.pictureMap.set(item,images[0][index]);
                });
                for(let [key,value] of this.map.entries()){
                    if(value === 'picture') this.addPicture(key);
                    if(value === 'text') this.addText(key);
                }
                resolve(this.canvas.toDataURL());
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