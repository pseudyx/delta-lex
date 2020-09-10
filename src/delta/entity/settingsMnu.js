export class SettingsMnu {
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

    hitRadius(pos){
        var hit = pos.x > this.pos.x && pos.x < this.pos.x+80 && pos.y < this.pos.y && pos.y > this.pos.y-20;
        if(hit){
            this.onPress();
        }
        return hit;
    }

    render(pos) {
        this.pos = pos;
        if(this.enabled){
            this.ctx.font = `bold 20px Arial`;
            this.ctx.fillStyle = (!this.toggle) ? "#505050" : "rgba(255,0,0,0.75)";
            this.ctx.fillText("DELTA", pos.x, pos.y); 
        }
    }
}

export default SettingsMnu;