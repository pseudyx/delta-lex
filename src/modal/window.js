import * as React from 'react'
import Draggable from './draggable'

class Window extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
          elmntX: 0,
          elmntY: 0,
          clX: 0,
          clY: 0,
          width: this.props.width,
          height: this.props.height,
          boxStyle: this.props.boxStyle ?? "default"
        }
      }

      resizeMouseDown = e => {
        e = e || window.event;
        e.preventDefault();
        
        this.setState({
          clX: e.clientX,
          clY: e.clientY,
        });   

        document.onmouseup = this.releaseDragElement;
        document.onmousemove = this.elementDrag;
      }

      elementDrag = e => {
        e = e || window.event;
        e.preventDefault();

        this.setState(prevState => {
          return {
            elmntX: prevState.clX - e.clientX,
            elmntY: prevState.clY - e.clientY,
            clX: e.clientX,
            clY: e.clientY,
            height: prevState.height - (prevState.clY - e.clientY),
            width: prevState.width - (prevState.clX - e.clientX)
          };
        });        
      }
    
      releaseDragElement = e => {
        e.preventDefault();
        document.onmouseup = null;
        document.onmousemove = null;
      }

      render(){
          var styleOuter = {width: `${this.state.width}px`, height: `${this.state.height}px`, overflowY: 'auto', overflowX: 'hidden', margin: '0', padding: '0'}
          var styleInner = {padding: '4px',  color: '#fff' }
          var styleResize = {
            width: '10px',
            height: '10px',
            background: 'rgba(0, 0, 0, 0.25)',
            float: 'right',
            cursor: 'se-resize',
          }
          var styleSizeHandle = {
            width: '2px',
            height: '10px',
            transform: 'skew(-45deg)',
            background: 'rgba(225, 225, 225, 0.5)',
            float: 'right',
            marginRight: '4px',
            cursor: 'se-resize',
          }
         var styleSizeHandleBar = {
            width: '2px',
            height: '5px',
            background: 'rgba(225, 225, 225, 0.5)',
            float: 'right',
            marginRight: '-5px',
            marginTop: '5px',
            transform: 'skew(-45deg)'
        }
        return (
            <Draggable close={this.props.close} top={this.props.top} left={this.props.left} zIndex={this.props.index} onSort={this.props.onSort}>
              <div className={'modalBody'} style={styleOuter}>
                <div style={styleInner}>
                    {this.props.children}
                </div>
              </div>
              <div id={"resize"} style={styleResize} onMouseDown={this.resizeMouseDown}><div style={styleSizeHandle}></div><div style={styleSizeHandleBar}></div></div>
            </Draggable>
        );
      }
}

export default Window