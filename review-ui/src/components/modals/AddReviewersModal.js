import React from "react";
import Col from "react-bootstrap/Col";
import Row from 'react-bootstrap/Row';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Web3 from 'web3';

class AddReveiwersModal extends React.Component {
    // Place holder constructor 
    constructor(props) {
        super(props);
        const w3 = new Web3(window.ethereum);
        this.state = {
            reviewer: null,
            reviewer_values: [''],
            web3: w3
        }
        
        this.handleIncrement = this.handleIncrement.bind(this);
        this.handleDecrement = this.handleDecrement.bind(this);
        this.handleReviewerChange = this.handleReviewerChange.bind(this);
        this.handleAddReviewers = this.handleAddReviewers.bind(this);
    }

    async handleAddReviewers() {
        for (let i = 0; i < this.state.reviewer_values.length; i++) {
            if (!this.state.web3.utils.isAddress(this.state.reviewer_values[i])) {
                alert(`The reviewer address in slot ${i+1} is not a valid eth address.`)
                return
            }
        }
        this.props.PRContract.methods.addReviewersToBounty(
            this.props.bountyid, this.state.reviewer_values
        ).send({from: this.props.account})
        .on('confirmation', (receipt) => {
            window.location.reload();
        });
    }

    handleIncrement() {
        this.setState({
            reviewer_values: [...this.state.reviewer_values, '']
        })
    }

    handleDecrement(i) {
        let new_values = [...this.state.reviewer_values];
        new_values.splice(i, 1);
        this.setState({
            reviewer_values: new_values
        })
    }

    handleReviewerChange(value, i) {
        let new_values = this.state.reviewer_values;
        new_values[i] = value;
        this.setState({
            reviewer_values: new_values
        })
        
        console.log(this.state.reviewer_values);
    }
    
    render() {
        return (
            <Modal 
                show={this.props.showOpenForm} 
                onHide={this.props.handleCloseOpenForm}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Reviewers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        {this.state.reviewer_values.map((item, i) => (
                            <>
                                <Row key={i}>
                                    <Form.Group>
                                        <Row className='align-items-center'>
                                            <Col md={{span:2}}>
                                                <Form.Label>Reviewer:</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control 
                                                    type="text"
                                                    value={item}
                                                    placeholder='Reviewer address'
                                                    onChange={(e) => this.handleReviewerChange(e.target.value, i)}
                                                />
                                            </Col>
                                            
                                            <Col>
                                                <Button
                                                    onClick={() => this.handleDecrement(i)}
                                                >
                                                    -
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form.Group>
                                </Row>
                                <br />
                            </>
                        ))}
                        <br />
                        <Row className='text-center'>
                            <Col>
                                <Button
                                    onClick={this.handleIncrement}
                                >
                                    Add Entry
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    onClick={() => this.handleAddReviewers()}
                                    variant='success'
                                >
                                    Submit Reviewer
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        )
    }
}

export default AddReveiwersModal;