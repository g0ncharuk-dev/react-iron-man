import React, {Component} from 'react';
import styled from 'styled-components'

const AspectRatioContainer = styled.div`
            position:relative;
            &:before {
                content: "";
                display: block;
                width: 100%;
                padding-top: ${props => props.aspect * 100}%;
            } 
        `;
const AspectRatioContent = styled.div`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        `;

class AspectRatio extends Component {
    render() {
        return (
            <AspectRatioContainer aspect = {this.props.height/this.props.width} >
                <AspectRatioContent>
                    {this.props.children}
                </AspectRatioContent>
            </AspectRatioContainer>
        );
    }
}

export default AspectRatio;