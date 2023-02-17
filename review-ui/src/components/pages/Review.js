import "../../style/TabStyle.css";
import React, { Component } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Dashboard from "./Dashboard";

class Review extends Component {

    render() {
        return (
            <>
                <br />
                <Container fluid>
                    <Row>
                        <Tabs className="tabs">
                            <Tab title='Dashboard' eventKey='dashboard'>
                                <Dashboard
                                    chainId={this.props.chainId}
                                    account={this.props.account}
                                    bounties={this.props.reviewerBounties}
                                    PRContract={this.props.PRContract}
                                    type={"reviewer"}
                                    profile={this.props.profile}
                                />
                            </Tab>
                            <Tab title='Statistics' eventKey='statistics'>
                                <h1>TODO</h1>
                            </Tab>
                        </Tabs>
                    </Row>
                </Container>
            </>
        );
    }
}

export default Review;