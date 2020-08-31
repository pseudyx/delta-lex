export class Typewriter {
    constructor(font="Arial", size="12pt", lineHeight=20, typeLines = []){
        this.font = font;
        this.size = size;
        this.lineHeight = lineHeight;
        this.line = 1;
        this.left = 10;
        this.typeLines = typeLines;
    }

    writeLine(text){  
        var newLine = this.line;
        const fxLine = (ctx) => {     
            ctx.font = `${this.size} ${this.font}`;
            ctx.fillStyle = "white";
            ctx.fillText(text, this.left, newLine*this.lineHeight);
        }
        this.typeLines.push({fx:fxLine});
        this.line++;
    }

    stream(next){
        this.clear();
        this.writeLine(next);
    }

    newLine(){
        this.line++;
    }

    clear(){
        this.typeLines.splice(0,this.typeLines.length);
        this.line = 1;
    }
}

var typewriter = new Typewriter();
export default typewriter;