export class MicBtn {
    constructor(ctx, enabled=true, toggle=false) {
        this.ctx = ctx;
        this.toggle = toggle;
        this.enabled = enabled;
        
    }

    onRecord(){
        this.toggle = true;
    }

    onStop(){
        this.toggle = false;
    }

    onPress(){
        this.toggle = !this.toggle;
    }

    enable(){
        this.enable = true;
    }

    dissable(){
        this.enable = false;
    }

    hitTest(pos){
        var hit = pos.x > this.pos.x-this.pos.r && pos.x < this.pos.x+this.pos.r && pos.y < this.pos.y+this.pos.r && pos.y > this.pos.y-this.pos.r;
        if(hit){
            this.onPress();
        }
        return hit;
    }

    render(pos) {
        this.pos = pos;
        if(this.enabled){
            this.ctx.beginPath();
            this.ctx.arc(this.pos.x, this.pos.y, this.pos.r, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = (!this.toggle) ? "#505050" : "rgba(255,0,0,0.75)";
            this.ctx.fill();
            
            this.ctx.fillStyle = "#000";
            this.ctx.font='30pt FontAwesome';
            if(this.toggle){
                this.ctx.fillText('\uF04d',this.pos.x-17,this.pos.y+15);
            } else {
                this.ctx.fillText('\uF130',this.pos.x-13,this.pos.y+15);
            }
                
        }
    }
}

export default MicBtn;