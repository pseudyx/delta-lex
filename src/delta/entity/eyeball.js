//cx/cy is center of eye.
//lx/ly is pupil rotation
const Eyeball = (ctx, cx, cy, lx=0, ly=0) =>{
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
    
    ctx.beginPath();
    ctx.arc(cx, cy, ballRadius, 0, 2 * Math.PI, false);
    var grd1 = ctx.createRadialGradient(cx, cy, ballRadius/2, cx, cy, ballRadius);
    grd1.addColorStop(1, "rgba(0, 0, 0, 0.25)");
    grd1.addColorStop(0, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = grd1;
    ctx.fill();

    lx = (lx > 10) ? 10 : lx;
    lx = (lx < -10) ? -10 : lx;
    ly = (ly > 10) ? 10 : ly;
    ly = (ly < -10) ? -10 : ly;

    var pupilRadius = 4.1/100 *ctx.canvas.width; //80;
   
    //pupil backfill
    ctx.beginPath();
    ctx.arc(cx+lx, cy+ly, pupilRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.stroke();

    //pupil backlight 
    ctx.beginPath();
    ctx.arc(cx+lx, cy+ly, pupilRadius/1.1, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
    ctx.fill();

    //pupil covering
    ctx.beginPath();
    ctx.arc(cx+lx, cy+ly, pupilRadius, 0, 2 * Math.PI, false);
    var grd1 = ctx.createRadialGradient(cx+lx, cy+ly, pupilRadius/2, cx+lx, cy+ly, pupilRadius);
    grd1.addColorStop(0, "rgba(0, 0, 0, 0)");
    grd1.addColorStop(1, "rgba(255, 0, 0, 0.25)");
    ctx.fillStyle = grd1;
    ctx.fill();

    //pupil covering left flair
    ctx.beginPath();
    ctx.ellipse((cx+lx)/1.03, (cy+ly)/1.03, pupilRadius/2, pupilRadius/1.3, Math.PI / 4, 0, 2 * Math.PI);
    var grd2 = ctx.createRadialGradient((cx+lx)/1.06, (cy+ly)/1.06, pupilRadius/4, (cx+lx)/1.09, (cy+ly)/1.09, pupilRadius);
    grd2.addColorStop(0, "rgba(255, 0, 0, .1)");
    grd2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grd2;
    ctx.fill();

    //pupul covering right flair
    ctx.beginPath();
    ctx.ellipse((cx+lx)*1.03, (cy+ly)*1.03, pupilRadius/2, pupilRadius/1.3, Math.PI / 4, 0, 2 * Math.PI);
    var grd3 = ctx.createRadialGradient((cx+lx)*1.06, (cy+ly)*1.06, pupilRadius/4, (cx+lx)*1.09, (cy+ly)*1.09, pupilRadius);
    grd3.addColorStop(0, "rgba(255, 0, 0, .10)");
    grd3.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grd3;
    ctx.fill();
    
}

export default Eyeball;