import React, {Component} from 'react';
import {Nav, NavItem, NavLink, Col} from 'reactstrap';

const navBarStyle = {
    height: '100vh',
    maxWidth: '100px',
    position: 'fixed',
    top:'0'
};
const navStyle = {
    backgroundColor: '#242424',
    overflow:'hidden'
};

class NavBar extends Component {
    render() {
        return (
            <Col style={navBarStyle} className={'p-0'}>
                <div style={navStyle} className="h-100 ">
                    <Nav vertical={true} className={''}>
                        <NavItem>
                            <NavLink href="#">Link1</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Link2</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Link3</NavLink>
                        </NavItem>
                    </Nav>
                </div>
            </Col>
        );
    }
}

export default NavBar;