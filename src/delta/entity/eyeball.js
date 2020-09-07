//cx/cy is center of eye.
//lx/ly is pupil rotation
const Eyeball = (ctx, cx, cy, lx=0, ly=0, isClosed=false) =>{
    var backRadius = 7.8125/100 * ctx.canvas.width;//150;
    ctx.beginPath();
    ctx.arc(cx, cy, backRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#000";
    ctx.fill();

    var irusRadius = 6.25/100 *ctx.canvas.width; //120;
    ctx.beginPath();
    ctx.arc(cx, cy, irusRadius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.stroke();

    var ballRadius = (ctx.canvas.width > 800) ? 5.21/100 *ctx.canvas.width : irusRadius; //100;
    ctx.beginPath();
    ctx.arc(cx, cy, ballRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.stroke();   

    lx = (lx > 10) ? 10 : lx;
    lx = (lx < -10) ? -10 : lx;
    ly = (ly > 10) ? 10 : ly;
    ly = (ly < -10) ? -10 : ly;

    var pupilRadius = 4.1/100 *ctx.canvas.width; //80;
    if(isClosed){
        ctx.beginPath();
        ctx.arc(cx+lx, cy+ly, pupilRadius, 0, Math.PI, false);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(cx+lx, cy+ly, pupilRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fill();
    }
    
}

export default Eyeball;