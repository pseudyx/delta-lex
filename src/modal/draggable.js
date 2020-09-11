import * as React from 'react';
import './draggable.css';

class Draggable extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
          target: {},
          elmntX: 0,
          elmntY: 0,
          clX: 0,
          clY: 0,
          defaultX: props.left ?? '40%',
          defaultY: props.top ?? '33%',
          pxper: (props.left) ? 'px' : '%',
          zIndex: this.props.zIndex,
          cursor: this.props.cursor ?? 'grab'
        };
      }

      dragMouseDown = e => {
        e = e || window.event;
        e.preventDefault();
        
        if (typeof this.props.onSort === "function") {
          this.props.onSort();
        }

        this.setState({
          target: e.target.parentNode,
          clX: e.clientX,
          clY: e.clientY,
          cursor: 'grabbing'
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
            zIndex: this.props.zIndex,
            cursor: 'grabbing'
          };
        });
        var elmnt = this.state.target;
        elmnt.style.top = (elmnt.offsetTop - this.state.elmntY) + "px";
        elmnt.style.left = (elmnt.offsetLeft - this.state.elmntX) + "px";
      }
    
      releaseDragElement = e => {
        e.preventDefault();
        this.setState({
          cursor: 'grab'
        });
        document.onmouseup = null;
        document.onmousemove = null;        
      }

      render(){
        var containerStyle = {
          top: `${this.state.defaultY}${this.state.pxper}`, 
          left: `${this.state.defaultX}${this.state.pxper}`, 
          zIndex: this.state.zIndex, 
          position: 'absolute',
        }

        var headerStyle = {
          cursor: this.state.cursor,
          height: '15px',
          paddingRight: '1px',
          zIndex: 10,
          textAlign: 'left'
        }

        var btnStyle = {
          cursor: 'pointer',
          width: '13px',
          height: '13px',
          float: 'right',
          textAlign: 'center',
          lineHeight: '10px'
        }
        
        var dragging = (this.state.cursor === 'grabbing') ? "dragging" : "";

        return (
            <div className={`draggable ${dragging}`} style={containerStyle}>
              <div className={`dragHeader`} onMouseDown={this.dragMouseDown} style={headerStyle}> 
              <div className={`btn`} onClick={this.props.close} style={btnStyle}>x</div></div>
                {this.props.children}
            </div>
        );
      }
}

export default Draggable;