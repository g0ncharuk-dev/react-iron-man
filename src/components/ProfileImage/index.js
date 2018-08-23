import React, {Component} from 'react';

import AspectRatio from '../AspectRatio';

import './ProfileImage.scss';


class ProfileImage extends Component {
    render() {
        const style ={
            background: `url(${this.props.imgUrl})no-repeat center center/cover`
        };
        return (
            <AspectRatio width={1} height={1}>
                <div style={style} className={'ProfileImage'} />
            </AspectRatio>
        );
    }
}

export default ProfileImage;