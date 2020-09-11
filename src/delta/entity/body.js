export const Body = (ctx, cx, cy) => {
    var offset = { 
        x:  2.1/100*ctx.canvas.width,//40,
        y: (ctx.canvas.width <= 800 && ctx.canvas.height > 600) ? 30/100 *ctx.canvas.height : 5.21/100 *ctx.canvas.height
    }

    leftEar(ctx, cx, cy, offset);
    rightEar(ctx, cx, cy, offset);
}

export const leftEar = (ctx, cx, cy, offset) => { 
    var top = {
        x: cx-offset.x,
        y: cy-(cy-offset.y)
    }
    var centerL = {
        x: top.x-(5.21/100 *ctx.canvas.width), //100,
        y: cy
    }
    var centerR = {
        x: centerL.x+ (2.6/100 *ctx.canvas.width), //50,
        y: cy
    }
    var bottom = {
        x: cx-offset.x,
        y: cy*2-offset.y
    }

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);         
    ctx.lineTo(centerL.x, centerL.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(centerR.x, centerR.y);
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fill();
}

export const rightEar = (ctx, cx, cy, offset) => {
    var top = {
        x: cx+offset.x,
        y: cy-(cy-offset.y)
    }
    var centerL = {
        x: top.x+(5.21/100 *ctx.canvas.width), //100,
        y: cy
    }
    var centerR = {
        x: centerL.x- (2.6/100 *ctx.canvas.width), //50,
        y: cy
    }
    var bottom = {
        x: cx+offset.x,
        y: cy*2-offset.y
    }

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);         
    ctx.lineTo(centerL.x, centerL.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(centerR.x, centerR.y);
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fill();
}

export default Body;