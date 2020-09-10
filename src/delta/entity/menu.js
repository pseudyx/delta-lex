import MicBtn from "./micBtn";
import SettingsMnu from './settingsMnu'

export class Menu {
    constructor(ctx, enabled=true) {
        this.ctx = ctx;
        this.enabled = true;
        this.micBtn = new MicBtn(this.ctx, this.enabled);
        this.SettingsMnu = new SettingsMnu(this.ctx, this.enabled);
    }
    
    onClick(pos, callBack){
        if(this.micBtn.hitRadius(pos)){
            callBack({name: "MicBtn", state: this.micBtn.toggle});
        }
        if(this.SettingsMnu.hitRadius(pos)){
            callBack({name: "SettingsBtn", state: this.SettingsMnu.toggle});
        }
    }

    onRecord(){
        this.micBtn.onRecord();
    }

    onStop(){
        this.micBtn.onStop();
    }

    render() {
        if(this.enabled){
            this.micBtn.render({
                x: this.ctx.canvas.width-50,
                y: 50,
                r: 30
            });

            this.SettingsMnu.render({
                x: 10,
                y: 30
            });

        }
    }


}

export default Menu;