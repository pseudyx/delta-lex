import MicBtn from "./micBtn";

export class Menu {
    constructor(ctx, enabled=true) {
        this.ctx = ctx;
        this.enabled = true;
        this.micBtn = new MicBtn(this.ctx, this.enabled);
    }
    
    onClick(pos, callBack){
        if(this.micBtn.hitRadius(pos)){
            callBack({name: "MicBtn", state: this.micBtn.toggle});
        }
    }

    render() {
        if(this.enabled){
            var pos = {
                x: this.ctx.canvas.width-50,
                y: 50,
                r: 30
            }
            this.micBtn.render(pos);
        }
    }


}

export default Menu;