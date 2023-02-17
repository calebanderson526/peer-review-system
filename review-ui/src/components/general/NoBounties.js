import React from "react";
import Row from "react-bootstrap/Row";

class NoBounties extends React.Component {
    constructor(props) {
        super(props);
        this.generateContent = this.generateContent.bind(this);
    }

    generateContent() {
        if (this.props.type === "reviewer") {
            return (
                <>
                    <Row
                        className="text-center"
                        style={{ "margin-top": "10%" }}
                    >
                        <h1>Not Assigned to Review Any Bounties!</h1>
                        <h3> You must be assigned a bounty from the editor of the bounty. Once you are assinged a bounty they will be displayed here.</h3>
                    </Row>
                </>
            );
        }

        else if (this.props.type === "editor") {
            return (
                <>
                    <Row
                        className="text-center"
                        style={{ "margin-top": "10%" }}
                    >
                        <h1> Not Assigned to Edit Any Bounties!</h1>
                        <h3> You must be assigned a bounty from the author of the bounty. Once you are assinged a bounty they will be displayed here.</h3>
                    </Row>
                </>
            );
        }

        else if (this.props.type === "author") {
            return (
                <>
                    <Row
                        className="text-center"
                        style={{ "margin-top": "10%" }}
                    >
                        <h1> No Authored Bounties!</h1>
                        <h3> You must click on the "Open a Bounty" button in the top right to create a new bounty. Once finshed, your authored bounties will be displayed here.</h3>
                    </Row>
                </>
            );
        }
    }
    render() {
        return (
            <>{this.generateContent()}</>
        )
    }
}

export default NoBounties;