import * as React from 'react';
import Window from './window';
import * as utils from '../lib/utils';

 export default class Stack extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            stack: []
        }
    }

    add = (iWin) => {
        var id = utils.uuidv4()
        const stack = this.state.stack;
        var [top, left] = (stack.length > 0) ? [stack[stack.length-1]?.top+10 ?? 10,stack[stack.length-1]?.left+15 ?? 15] : [10, 15];

        var content = (iWin?.isHtml) ? <div className="content" dangerouslySetInnerHTML={{__html:  iWin.content}}></div> : iWin?.content;

        this.setState(prev => ({
           stack: [...prev.stack, {
                id: id, 
                width: iWin?.width ?? 33/100*window.innerWidth,
                height: iWin?.height ?? 50/100*window.innerHeight,
                index: stack.length+1,
                content: content,
                top: parseInt(top),
                left: parseInt(left)
            }]
        }));

        return id;
    }

    update = (iWin) => {
        var stack = this.state.stack;
        stack.map((win)=> {
            if(win.id === iWin.id)win.content = iWin.content;
        });
        this.setState({stack});
    }

    handleSort(id){
        this.setState(prev => {
            var sort = prev.stack.find((win)=> win.id === id);
            var stack = prev.stack.filter((win)=>{return win.id !== id});
            stack.map((win, i)=> {win.index = ++i});
            sort.index = stack.length+1;

            return{stack: [...stack, sort]}
        })
    }

    handleClose(id){
        this.setState(prev => ({
            stack: prev.stack.filter(win => win.id !== id)
        }));
    }

    render(){
        return (
            <modal-stack>
                {this.state.stack.map((iWin)=>
                    <Window 
                        index={iWin.index} 
                        width={iWin.width} 
                        height={iWin.height}
                        top={iWin.top}
                        left={iWin.left} 
                        onSort={()=>{this.handleSort(iWin.id)}}
                        close={()=>{this.handleClose(iWin.id)}}
                        key={iWin.id}>
                            {iWin.content}
                    </Window>
                )}
            </modal-stack>
        );
    }

}